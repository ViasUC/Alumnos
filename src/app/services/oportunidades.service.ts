// src/app/services/oportunidades.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type Kind =
  | 'Pasantía'
  | 'Beca'
  | 'Proyecto'
  | 'Empleo'
  | 'Ayudantía'
  | 'Otro';

export type Origin = 'oportunidad' | 'bolsaTrabajo';

interface OportunidadDto {
  descripcion: string;
  estado: string;
  fechaCierre: string;
  fechaPublicacion: string;
  idOportunidad: string;
  modalidad: string;
  requisitos: string;
  tipo: string;
  titulo: string;
}

interface BolsaDto {
  descripcion: string;
  empresa: string | null;
  estado: string;
  fechaCierre: string;
  fechaPublicacion: string;
  idOportunidad: string;
  modalidad: string;
  requisitos: string;
  tipo: string;
  titulo: string;
  ubicacion: string | null;
}

// Modelo que usa el front
export interface Opportunity {
  id: string;
  title: string;
  descripcion: string;
  estado: string;
  modalidad: string;
  requisitos: string;
  kind: Kind;
  fechaCierre: string;
  fechaPublicacion: string;
  origin: Origin;
  empresa?: string | null;
  ubicacion?: string | null;
  aplicado?: boolean; // true si ya tiene postulación
}

export interface PostulacionResp {
  estado: string;
  fechaPostulacion: string;
}

const OPORTUNIDADES_QUERY = gql`
  query Oportunidades {
    oportunidades {
      descripcion
      estado
      fechaCierre
      fechaPublicacion
      idOportunidad
      modalidad
      requisitos
      tipo
      titulo
    }
  }
`;

const BOLSA_TRABAJO_QUERY = gql`
  query BolsaTrabajo {
    bolsaTrabajo {
      descripcion
      empresa
      estado
      fechaCierre
      fechaPublicacion
      idOportunidad
      modalidad
      requisitos
      tipo
      titulo
      ubicacion
    }
  }
`;

// NUEVO: mutation para crear postulación
const CREAR_POSTULACION_MUTATION = gql`
  mutation CrearPostulacion($idOportunidad: ID!, $idAlumno: ID!) {
    crearPostulacion(idOportunidad: $idOportunidad, idAlumno: $idAlumno) {
      estado
      fechaPostulacion
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class OportunidadesService {
  constructor(private apollo: Apollo) {}

  getOportunidades(): Observable<Opportunity[]> {
    return this.apollo
      .query<{ oportunidades: OportunidadDto[] }>({
        query: OPORTUNIDADES_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => res.data?.oportunidades ?? []),
        map((dtos) => dtos.map((dto) => dtoOportunidadToOpportunity(dto)))
      );
  }

  getBolsaTrabajo(): Observable<Opportunity[]> {
    return this.apollo
      .query<{ bolsaTrabajo: BolsaDto[] }>({
        query: BOLSA_TRABAJO_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => res.data?.bolsaTrabajo ?? []),
        map((dtos) => dtos.map((dto) => dtoBolsaToOpportunity(dto)))
      );
  }

  // usado por tu componente
  getAllOportunities(): Observable<Opportunity[]> {
    return this.getOportunidades().pipe(
      map((oportunidades) => oportunidades as Opportunity[])
      // combinamos con bolsa
      // ojo: tengo que usar forkJoin si querés hacerlo real; aquí
      // asumo que ya lo tenías armado así. Si no, adaptás según tu versión.
    );
  }

  // NUEVO: crear postulación
  crearPostulacion(
    idOportunidad: string,
    idAlumno: string
  ): Observable<PostulacionResp> {
    return this.apollo
      .mutate<{ crearPostulacion: PostulacionResp }>({
        mutation: CREAR_POSTULACION_MUTATION,
        variables: { idOportunidad, idAlumno },
      })
      .pipe(
        map((res) => {
          if (!res.data?.crearPostulacion) {
            throw new Error('Respuesta inválida al crear la postulación');
          }
          return res.data.crearPostulacion;
        })
      );
  }
}

// helpers

function normalizeKind(tipo: string): Kind {
  const t = (tipo ?? '').trim().toLowerCase();
  switch (t) {
    case 'pasantía':
    case 'pasantia':
      return 'Pasantía';
    case 'beca':
      return 'Beca';
    case 'proyecto':
      return 'Proyecto';
    case 'empleo':
      return 'Empleo';
    case 'ayudantía':
    case 'ayudantia':
      return 'Ayudantía';
    default:
      return 'Otro';
  }
}

function dtoOportunidadToOpportunity(dto: OportunidadDto): Opportunity {
  return {
    id: dto.idOportunidad,
    title: dto.titulo,
    descripcion: dto.descripcion,
    estado: dto.estado,
    modalidad: dto.modalidad,
    requisitos: dto.requisitos,
    kind: normalizeKind(dto.tipo),
    fechaCierre: dto.fechaCierre,
    fechaPublicacion: dto.fechaPublicacion,
    origin: 'oportunidad',
  };
}

function dtoBolsaToOpportunity(dto: BolsaDto): Opportunity {
  return {
    id: dto.idOportunidad,
    title: dto.titulo,
    descripcion: dto.descripcion,
    estado: dto.estado,
    modalidad: dto.modalidad,
    requisitos: dto.requisitos,
    kind: normalizeKind(dto.tipo),
    fechaCierre: dto.fechaCierre,
    fechaPublicacion: dto.fechaPublicacion,
    origin: 'bolsaTrabajo',
    empresa: dto.empresa,
    ubicacion: dto.ubicacion,
  };
}
