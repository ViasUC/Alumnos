// src/app/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GeneralService } from './general.service';

const ALUMNO_POR_ID = gql`
  query AlumnoPorId($id: ID!) {
    alumnoPorId(id: $id) {
      usuario {
        apellido
        email
        nombre
        rolPrincipal
        telefono
        ubicacion
      }
      semestre
      carrera
    }
  }
`;

const ACTUALIZAR_ALUMNO = gql`
  mutation ActualizarAlumno(
    $id: ID!
    $nombre: String!
    $apellido: String!
    $email: String!
    $password: String!
    $telefono: String!
    $ubicacion: String!
    $carrera: String!
    $semestre: Int!
  ) {
    actualizarAlumno(
      id: $id
      input: {
        usuario: {
          apellido: $apellido
          email: $email
          nombre: $nombre
          password: $password
          telefono: $telefono
          ubicacion: $ubicacion
        }
        carrera: $carrera
        semestre: $semestre
      }
    ) {
      idAuditoria
      idUsuario
    }
  }
`;

interface UsuarioDto {
  apellido: string;
  email: string;
  nombre: string;
  rolPrincipal: string;
  telefono: string;
  ubicacion: string;
}

interface AlumnoPorIdDto {
  usuario: UsuarioDto;
  semestre: number | string;
  carrera: string;
}

export interface PerfilAlumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  rolPrincipal: string;
  semestre: number;
  carrera: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  constructor(private apollo: Apollo, private generalService: GeneralService) {}

  getPerfilAlumno(): Observable<PerfilAlumno> {
    const userId = this.generalService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('No hay usuario logueado (userId no encontrado).')
      );
    }

    return this.apollo
      .query<{ alumnoPorId: AlumnoPorIdDto }>({
        query: ALUMNO_POR_ID,
        variables: { id: userId },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((res) => {
          const data = res.data?.alumnoPorId;
          if (!data) {
            throw new Error('Perfil de alumno no encontrado.');
          }
          return mapPerfil(data, userId);
        })
      );
  }

  actualizarPerfilAlumno(updated: PerfilAlumno) {
    const userId = this.generalService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('No hay usuario logueado (userId no encontrado).')
      );
    }

    const semestreNum = Number(updated.semestre);

    return this.apollo
      .mutate<{
        actualizarAlumno: { idAuditoria: string; idUsuario: string };
      }>({
        mutation: ACTUALIZAR_ALUMNO,
        variables: {
          id: userId,
          nombre: updated.nombre,
          apellido: updated.apellido,
          email: updated.email,
          password: '', // no tocamos password desde esta pantalla
          telefono: updated.telefono,
          ubicacion: updated.ubicacion,
          carrera: updated.carrera,
          semestre: semestreNum,
        },
      })
      .pipe(
        map((res) => {
          if (!res.data?.actualizarAlumno) {
            throw new Error('Respuesta inválida al actualizar alumno.');
          }
          return res.data.actualizarAlumno;
        })
      );
  }
}

function mapPerfil(dto: AlumnoPorIdDto, id: string): PerfilAlumno {
  const u = dto.usuario;
  return {
    id,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono,
    ubicacion: u.ubicacion,
    rolPrincipal: u.rolPrincipal,
    semestre: Number(dto.semestre),
    carrera: dto.carrera,
  };
}
