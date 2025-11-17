// src/app/services/portafolio.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GeneralService } from './general.service';

const PORTAFOLIO_POR_USUARIO = gql`
  query PortafolioPorUsuario($idUsuario: ID!) {
    portafolioPorUsuario(idUsuario: $idUsuario) {
      descripcion
      idPortafolio
      skills
      visibilidad
    }
  }
`;

const ACTUALIZAR_PORTAFOLIO = gql`
  mutation ActualizarPortafolio(
    $idUsuario: Int!
    $descripcion: String!
    $skills: String!
    $visibilidad: Boolean!
  ) {
    actualizarPortafolio(
      input: {
        idUsuario: $idUsuario
        descripcion: $descripcion
        skills: $skills
        visibilidad: $visibilidad
      }
    ) {
      descripcion
      idPortafolio
      skills
      ultimaActualizacion
      visibilidad
    }
  }
`;

const EVIDENCIAS_POR_PORTAFOLIO = gql`
  query EvidenciasPorPortafolio($idPortafolio: ID!) {
    evidenciasPorPortafolio(idPortafolio: $idPortafolio) {
      idEvidencia
      descripcion
      recurso
      tipo
      titulo
    }
  }
`;

const AGREGAR_EVIDENCIA = gql`
  mutation AgregarEvidencia(
    $idPortafolio: Int!
    $idUsuario: Int!
    $descripcion: String!
    $recurso: String!
    $tipo: String!
    $titulo: String!
  ) {
    agregarEvidencia(
      input: {
        idPortafolio: $idPortafolio
        idUsuario: $idUsuario
        descripcion: $descripcion
        recurso: $recurso
        tipo: $tipo
        titulo: $titulo
      }
    ) {
      idEvidencia
      descripcion
      recurso
      tipo
      titulo
    }
  }
`;

const ELIMINAR_EVIDENCIA = gql`
  mutation EliminarEvidencia($idEvidencia: Int!, $idUsuario: Int!) {
    eliminarEvidencia(idEvidencia: $idEvidencia, idUsuario: $idUsuario)
  }
`;

const EDITAR_EVIDENCIA = gql`
  mutation EditarEvidencia(
    $idEvidencia: Int!
    $idUsuario: Int!
    $descripcion: String!
    $recurso: String!
    $tipo: String!
    $titulo: String!
  ) {
    editarEvidencia(
      input: {
        idEvidencia: $idEvidencia
        idUsuario: $idUsuario
        descripcion: $descripcion
        recurso: $recurso
        tipo: $tipo
        titulo: $titulo
      }
    ) {
      idEvidencia
      descripcion
      recurso
      tipo
      titulo
    }
  }
`;

export interface Portafolio {
  idPortafolio: number;
  descripcion: string;
  skills: string;
  visibilidad: boolean;
}

export interface Evidencia {
  idEvidencia: number;
  titulo: string;
  descripcion: string;
  recurso: string;
  tipo: string;
}

@Injectable({ providedIn: 'root' })
export class PortafolioService {
  constructor(private apollo: Apollo, private generalService: GeneralService) {}

  private getUserIdOrError(): number {
    const raw = this.generalService.getUserId();
    if (!raw) {
      throw new Error('No hay usuario logueado (userId no encontrado).');
    }
    return Number(raw);
  }

  getPortafolio(): Observable<Portafolio> {
    let idUsuario: number;
    try {
      idUsuario = this.getUserIdOrError();
    } catch (e) {
      return throwError(() => e);
    }

    return this.apollo
      .query<{
        portafolioPorUsuario: {
          descripcion: string;
          idPortafolio: string;
          skills: string;
          visibilidad: boolean;
        };
      }>({
        query: PORTAFOLIO_POR_USUARIO,
        variables: { idUsuario: String(idUsuario) },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => {
          const dto = res.data?.portafolioPorUsuario;
          if (!dto) {
            throw new Error('No se encontró portafolio para este usuario.');
          }
          return {
            idPortafolio: Number(dto.idPortafolio),
            descripcion: dto.descripcion ?? '',
            skills: dto.skills ?? '',
            visibilidad: !!dto.visibilidad,
          } as Portafolio;
        })
      );
  }

  actualizarPortafolio(p: Portafolio): Observable<Portafolio> {
    const idUsuario = this.getUserIdOrError();

    return this.apollo
      .mutate<{
        actualizarPortafolio: {
          descripcion: string;
          idPortafolio: string;
          skills: string;
          ultimaActualizacion: string;
          visibilidad: boolean;
        };
      }>({
        mutation: ACTUALIZAR_PORTAFOLIO,
        variables: {
          idUsuario,
          descripcion: p.descripcion,
          skills: p.skills,
          visibilidad: p.visibilidad,
        },
      })
      .pipe(
        map((res) => {
          const dto = res.data?.actualizarPortafolio;
          if (!dto) {
            throw new Error('Respuesta inválida al actualizar portafolio.');
          }
          return {
            idPortafolio: Number(dto.idPortafolio),
            descripcion: dto.descripcion ?? '',
            skills: dto.skills ?? '',
            visibilidad: !!dto.visibilidad,
          } as Portafolio;
        })
      );
  }

  getEvidencias(idPortafolio: number): Observable<Evidencia[]> {
    return this.apollo
      .query<{
        evidenciasPorPortafolio: {
          idEvidencia: number | string;
          descripcion: string;
          recurso: string;
          tipo: string;
          titulo: string;
        }[];
      }>({
        query: EVIDENCIAS_POR_PORTAFOLIO,
        variables: { idPortafolio: String(idPortafolio) },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) =>
          (res.data?.evidenciasPorPortafolio ?? []).map((e) => ({
            idEvidencia: Number(e.idEvidencia),
            titulo: e.titulo ?? '',
            descripcion: e.descripcion ?? '',
            recurso: e.recurso ?? '',
            tipo: e.tipo ?? '',
          }))
        )
      );
  }

  agregarEvidencia(
    idPortafolio: number,
    payload: Omit<Evidencia, 'idEvidencia'>
  ): Observable<Evidencia> {
    const idUsuario = this.getUserIdOrError();

    return this.apollo
      .mutate<{
        agregarEvidencia: {
          idEvidencia: number | string;
          descripcion: string;
          recurso: string;
          tipo: string;
          titulo: string;
        };
      }>({
        mutation: AGREGAR_EVIDENCIA,
        variables: {
          idPortafolio,
          idUsuario,
          descripcion: payload.descripcion,
          recurso: payload.recurso,
          tipo: payload.tipo,
          titulo: payload.titulo,
        },
      })
      .pipe(
        map((res) => {
          const e = res.data?.agregarEvidencia;
          if (!e) {
            throw new Error('Respuesta inválida al agregar evidencia.');
          }
          return {
            idEvidencia: Number(e.idEvidencia),
            titulo: e.titulo ?? '',
            descripcion: e.descripcion ?? '',
            recurso: e.recurso ?? '',
            tipo: e.tipo ?? '',
          } as Evidencia;
        })
      );
  }

  eliminarEvidencia(idEvidencia: number): Observable<boolean> {
    const idUsuario = this.getUserIdOrError();

    return this.apollo
      .mutate<{ eliminarEvidencia: boolean }>({
        mutation: ELIMINAR_EVIDENCIA,
        variables: { idEvidencia, idUsuario },
      })
      .pipe(
        map((res) => {
          // si el backend devuelve boolean
          return !!res.data?.eliminarEvidencia;
        })
      );
  }

  editarEvidencia(e: Evidencia): Observable<Evidencia> {
    const idUsuario = this.getUserIdOrError();

    return this.apollo
      .mutate<{
        editarEvidencia: {
          idEvidencia: number | string;
          descripcion: string;
          recurso: string;
          tipo: string;
          titulo: string;
        };
      }>({
        mutation: EDITAR_EVIDENCIA,
        variables: {
          idEvidencia: e.idEvidencia,
          idUsuario,
          descripcion: e.descripcion,
          recurso: e.recurso,
          tipo: e.tipo,
          titulo: e.titulo,
        },
      })
      .pipe(
        map((res) => {
          const data = res.data?.editarEvidencia;
          if (!data) {
            throw new Error('Respuesta inválida al editar evidencia.');
          }
          return {
            idEvidencia: Number(data.idEvidencia),
            titulo: data.titulo ?? '',
            descripcion: data.descripcion ?? '',
            recurso: data.recurso ?? '',
            tipo: data.tipo ?? '',
          } as Evidencia;
        })
      );
  }
}
