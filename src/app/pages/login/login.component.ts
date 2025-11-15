import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { GeneralService } from '../../services/general.service';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
  form!: LoginForm;
  loading = false;
  errorMsg: string | null = null;

  constructor(
    private fb: FormBuilder,
    private api: GeneralService,
    private router: Router
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get emailCtrl() {
    return this.form.controls.email;
  }

  get passwordCtrl() {
    return this.form.controls.password;
  }

  submit(): void {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading = true;
    this.errorMsg = null;

    this.api
      .login(email, password)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          // login OK -> ir a portafolio (carga Layout + PortafolioComponent)
          this.router.navigate(['/portafolio']);
        },
        error: (err) => {
          console.error('Error en login', err);
          this.errorMsg =
            this.extractErrorMessage(err) ??
            'Credenciales inválidas o error de red.';
        },
      });
  }

  private extractErrorMessage(error: unknown): string | null {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;

    const anyErr = error as any;

    if (
      Array.isArray(anyErr.graphQLErrors) &&
      anyErr.graphQLErrors.length > 0 &&
      typeof anyErr.graphQLErrors[0].message === 'string'
    ) {
      return anyErr.graphQLErrors[0].message;
    }

    if (typeof anyErr.message === 'string') return anyErr.message;
    return null;
  }
}
