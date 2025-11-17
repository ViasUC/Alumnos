// src/app/services/canales.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export type CanalTipo =
  | 'OFERTAS'
  | 'EVENTOS'
  | 'INNOVACION'
  | 'NOTICIAS_INSTITUCIONALES';

interface CanalDto {
  activo: boolean;
  descripcion: string;
  nombre: string;
  idCanal: string;
  slug: string;
  tipo: CanalTipo | string;
}

export interface Canal {
  id: string;
  nombre: string;
  descripcion: string;
  slug: string;
  tipo: CanalTipo;
  activo: boolean;
  seguido: boolean;
}

const CANALES_ACTIVOS_QUERY = gql`
  query CanalesActivos {
    canalesActivos {
      activo
      descripcion
      nombre
      idCanal
      slug
      tipo
    }
  }
`;

const CANALES_POR_TIPO_QUERY = gql`
  query CanalesPorTipo($tipo: CanalTipo!) {
    canalesPorTipo(tipo: $tipo) {
      activo
      descripcion
      nombre
      idCanal
      slug
      tipo
    }
  }
`;

const SEGUIR_CANAL_MUTATION = gql`
  mutation SeguirCanal($idCanal: ID!, $idUsuario: ID!) {
    seguirCanal(idCanal: $idCanal, idUsuario: $idUsuario)
  }
`;

type FollowStorage = {
  [userId: string]: string[]; // lista de ids de canal
};

@Injectable({ providedIn: 'root' })
export class CanalesService {
  private readonly STORAGE_KEY = 'viasuc_followed_channels';

  constructor(private apollo: Apollo) {}

  // -------- helpers de storage local por usuario --------

  private getStorage(): FollowStorage {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FollowStorage) : {};
    } catch {
      return {};
    }
  }

  private saveStorage(data: FollowStorage): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private getFollowedIdsForUser(userId: string | null): string[] {
    if (!userId) return [];
    const storage = this.getStorage();
    return storage[userId] ?? [];
  }

  private addFollowedId(userId: string, canalId: string): void {
    const storage = this.getStorage();
    const list = new Set(storage[userId] ?? []);
    list.add(canalId);
    storage[userId] = Array.from(list);
    this.saveStorage(storage);
  }

  // -------- API pública --------

  getCanalesActivos(userId: string | null): Observable<Canal[]> {
    const followedIds = this.getFollowedIdsForUser(userId);

    return this.apollo
      .query<{ canalesActivos: CanalDto[] }>({
        query: CANALES_ACTIVOS_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => res.data?.canalesActivos ?? []),
        map((dtos) => dtos.map((dto) => this.dtoToCanal(dto, followedIds))),
        map((canales) => this.sortBySeguido(canales))
      );
  }

  getCanalesPorTipo(
    tipo: CanalTipo,
    userId: string | null
  ): Observable<Canal[]> {
    const followedIds = this.getFollowedIdsForUser(userId);

    return this.apollo
      .query<{ canalesPorTipo: CanalDto[] }>({
        query: CANALES_POR_TIPO_QUERY,
        variables: { tipo },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => res.data?.canalesPorTipo ?? []),
        map((dtos) => dtos.map((dto) => this.dtoToCanal(dto, followedIds))),
        map((canales) => this.sortBySeguido(canales))
      );
  }

  seguirCanal(idCanal: string, idUsuario: string): Observable<boolean> {
    return this.apollo
      .mutate<{ seguirCanal: boolean }>({
        mutation: SEGUIR_CANAL_MUTATION,
        variables: { idCanal, idUsuario },
      })
      .pipe(
        tap((res) => {
          if (res.data?.seguirCanal) {
            this.addFollowedId(idUsuario, idCanal);
          }
        }),
        map((res) => !!res.data?.seguirCanal)
      );
  }

  // -------- mapeo interno --------

  private dtoToCanal(dto: CanalDto, followedIds: string[]): Canal {
    return {
      id: dto.idCanal,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      slug: dto.slug,
      tipo: dto.tipo as CanalTipo,
      activo: dto.activo,
      seguido: followedIds.includes(dto.idCanal),
    };
  }

  private sortBySeguido(list: Canal[]): Canal[] {
    return [...list].sort((a, b) => {
      if (a.seguido === b.seguido) return a.nombre.localeCompare(b.nombre);
      return a.seguido ? -1 : 1; // seguidos primero
    });
  }
}
