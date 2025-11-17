// src/app/pages/perfil/perfil.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfilAlumno, PerfilService } from '../../services/perfil.service';
import {
  PortafolioService,
  Portafolio,
  Evidencia,
} from '../../services/portafolio.service';

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  originalPerfil!: PerfilAlumno;

  // modelo editable (datos del alumno)
  editable = {
    nombre: '',
    apellido: '',
    carrera: '',
    semestre: 0,
    telefono: '',
    email: '',
    ubicacion: '',
  };

  // UI datos fijos
  colegio = 'Las Teresas';
  idiomas = ['Inglés', 'Portugués', 'Español', 'Italiano', 'Francés'];
  rolPrincipal = '';

  // estados de perfil
  loading = false;
  saving = false;
  errorMsg: string | null = null;
  saveMsg: string | null = null;
  editMode = false;

  // --------- NUEVO: portafolio + evidencias (solo lectura) ----------
  portafolio: Portafolio | null = null;
  evidencias: Evidencia[] = [];
  loadingPortafolio = false;
  loadingEvidencias = false;

  // Sobre mí (lo dejamos igual)
  sobreMi: string[] = [
    'Persona proactiva con ganas de emprender y con habilidades en muchos campos, amante del arte que es programar.',
    'Me encantan los retos nuevos y conocer cada parte del software que voy a desarrollar, así como entregar una experiencia total a mis clientes.',
    'Los martes y domingos son de estudio intenso con objetivos claros.',
    'Musulmán.',
  ];

  constructor(
    private perfilService: PerfilService,
    private portafolioService: PortafolioService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    // perfil del alumno
    this.perfilService.getPerfilAlumno().subscribe({
      next: (perfil: PerfilAlumno) => {
        this.originalPerfil = perfil;
        this.rolPrincipal = perfil.rolPrincipal;

        this.editable = {
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          carrera: perfil.carrera,
          semestre: perfil.semestre,
          telefono: perfil.telefono,
          email: perfil.email,
          ubicacion: perfil.ubicacion,
        };

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        this.errorMsg =
          'No se pudo cargar tu perfil. Volvé a iniciar sesión o recargá la página.';
        this.loading = false;
      },
    });

    // portafolio + evidencias (independiente del perfil)
    this.cargarPortafolio();
  }

  // ---------- getters de perfil ----------
  get nombreCompleto(): string {
    return `${this.editable.nombre} ${this.editable.apellido}`.trim();
  }

  get semestreLabel(): string {
    return `${this.editable.semestre}`;
  }

  // ---------- edición de perfil (se mantiene) ----------
  editarPerfil() {
    this.editMode = true;
    this.saveMsg = null;
    this.errorMsg = null;
  }

  cancelarEdicion() {
    this.editMode = false;
    this.errorMsg = null;
    this.saveMsg = null;

    if (this.originalPerfil) {
      this.editable = {
        nombre: this.originalPerfil.nombre,
        apellido: this.originalPerfil.apellido,
        carrera: this.originalPerfil.carrera,
        semestre: this.originalPerfil.semestre,
        telefono: this.originalPerfil.telefono,
        email: this.originalPerfil.email,
        ubicacion: this.originalPerfil.ubicacion,
      };
    }
  }

  private hayCambios(): boolean {
    const o = this.originalPerfil;
    const e = this.editable;
    if (!o) return false;

    return (
      o.nombre !== e.nombre ||
      o.apellido !== e.apellido ||
      o.carrera !== e.carrera ||
      o.semestre !== Number(e.semestre) ||
      o.telefono !== e.telefono ||
      o.email !== e.email ||
      o.ubicacion !== e.ubicacion
    );
  }

  guardarPerfil() {
    if (!this.originalPerfil) return;

    this.errorMsg = null;
    this.saveMsg = null;

    if (!this.hayCambios()) {
      this.editMode = false;
      this.saveMsg = 'No hubo cambios en el perfil.';
      return;
    }

    const updated: PerfilAlumno = {
      ...this.originalPerfil,
      nombre: this.editable.nombre,
      apellido: this.editable.apellido,
      carrera: this.editable.carrera,
      semestre: Number(this.editable.semestre),
      telefono: this.editable.telefono,
      email: this.editable.email,
      ubicacion: this.editable.ubicacion,
    };

    this.saving = true;
    this.perfilService.actualizarPerfilAlumno(updated).subscribe({
      next: () => {
        this.originalPerfil = updated;
        this.saving = false;
        this.editMode = false;
        this.saveMsg = 'Perfil actualizado correctamente.';
      },
      error: (err) => {
        console.error('Error actualizando perfil', err);
        this.saving = false;
        this.errorMsg =
          'Error al actualizar el perfil. Intentá de nuevo más tarde.';
      },
    });
  }

  // --------- NUEVO: portafolio + evidencias (view only) ----------

  private cargarPortafolio(): void {
    this.loadingPortafolio = true;

    this.portafolioService.getPortafolio().subscribe({
      next: (p) => {
        this.portafolio = p;
        this.loadingPortafolio = false;
        this.cargarEvidencias();
      },
      error: (err) => {
        console.error('Error cargando portafolio en perfil', err);
        // no piso errorMsg del perfil si ya estuviera; solo log visual de portafolio
        if (!this.errorMsg) {
          this.errorMsg = 'No se pudo cargar el portafolio.';
        }
        this.loadingPortafolio = false;
      },
    });
  }

  private cargarEvidencias(): void {
    if (!this.portafolio) return;
    this.loadingEvidencias = true;

    this.portafolioService
      .getEvidencias(this.portafolio.idPortafolio)
      .subscribe({
        next: (evs) => {
          this.evidencias = evs;
          this.loadingEvidencias = false;
        },
        error: (err) => {
          console.error('Error cargando evidencias en perfil', err);
          if (!this.errorMsg) {
            this.errorMsg = 'No se pudieron cargar las evidencias.';
          }
          this.loadingEvidencias = false;
        },
      });
  }
}
