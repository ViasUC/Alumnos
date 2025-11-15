import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

type LoginResp = { idUsuario: number };

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      idUsuario
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class GeneralService {
  private readonly STORAGE_KEY = 'loginResponse';
  constructor(private apollo: Apollo) {}

  login(email: string, password: string): Observable<LoginResp> {
    return this.apollo
      .mutate<{ login: LoginResp }>({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
      })
      .pipe(
        map((res) => {
          if (!res.data?.login) {
            throw new Error('Respuesta inválida');
          }
          return res.data.login;
        }),
        tap((login) => {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(login));
          localStorage.setItem('userId', String(login.idUsuario));
        })
      );
  }

  getSavedLogin(): LoginResp | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoginResp) : null;
  }

  clearLogin(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('userId');
  }
}
