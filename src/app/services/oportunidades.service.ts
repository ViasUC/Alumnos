// src/app/services/oportunidades.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export type Kind =
  | 'Pasantía'
  | 'Beca'
  | 'Proyecto'
  | 'Empleo'
  | 'Ayudantía'
  | 'Otro';

export type OpportunityOrigin = 'oportunidad' | 'bolsaTrabajo';

interface OportunidadDto {
  descripcion: string;
  estado: string;
  fechaCierre: string;
  fechaPublicacion: string;
  idOportunidad: string;
  modalidad: string;
  requisitos: string;
  tipo: string; // viene en minúsculas del backend
  titulo: string;
}

interface BolsaTrabajoDto extends OportunidadDto {
  empresa: string | null;
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
  kind: Kind; // tipo normalizado y capitalizado
  fechaCierre: string;
  fechaPublicacion: string;
  empresa?: string | null;
  ubicacion?: string | null;
  origin: OpportunityOrigin; // 🔹 distingue oportunidad vs bolsa
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
        map((res) =>
          (res.data?.oportunidades ?? []).map((dto) =>
            dtoToOpportunity(dto, 'oportunidad')
          )
        )
      );
  }

  getBolsaTrabajo(): Observable<Opportunity[]> {
    return this.apollo
      .query<{ bolsaTrabajo: BolsaTrabajoDto[] }>({
        query: BOLSA_TRABAJO_QUERY,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) =>
          (res.data?.bolsaTrabajo ?? []).map((dto) =>
            dtoToBolsaOpportunity(dto)
          )
        )
      );
  }

  // 🔹 método combinado para el componente
  getAllOportunities(): Observable<Opportunity[]> {
    return forkJoin([this.getOportunidades(), this.getBolsaTrabajo()]).pipe(
      map(([ops, jobs]) =>
        [...ops, ...jobs].sort((a, b) =>
          b.fechaPublicacion.localeCompare(a.fechaPublicacion)
        )
      )
    );
  }
}

// ---------- helpers ----------

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

function dtoToOpportunity(
  dto: OportunidadDto,
  origin: OpportunityOrigin
): Opportunity {
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
    origin,
  };
}

function dtoToBolsaOpportunity(dto: BolsaTrabajoDto): Opportunity {
  return {
    ...dtoToOpportunity(dto, 'bolsaTrabajo'),
    empresa: dto.empresa,
    ubicacion: dto.ubicacion,
  };
}
