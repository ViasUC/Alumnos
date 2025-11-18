// src/app/services/postulaciones.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface PostulacionDto {
  oportunidad: {
    idOportunidad: string;
  };
}

const POSTULACIONES_POR_ALUMNO_QUERY = gql`
  query PostulacionesPorAlumno($idAlumno: ID!) {
    postulacionesPorAlumno(idAlumno: $idAlumno) {
      oportunidad {
        idOportunidad
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class PostulacionesService {
  constructor(private apollo: Apollo) {}

  /**
   * Devuelve lista de IDs de oportunidades a las que el alumno ya está postulado
   */
  getPostulacionesAlumno(idAlumno: string): Observable<string[]> {
    return this.apollo
      .query<{ postulacionesPorAlumno: PostulacionDto[] }>({
        query: POSTULACIONES_POR_ALUMNO_QUERY,
        variables: { idAlumno },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => res.data?.postulacionesPorAlumno ?? []),
        map((list) =>
          list
            .map((p) => p.oportunidad?.idOportunidad)
            .filter((id): id is string => !!id)
        )
      );
  }
}
