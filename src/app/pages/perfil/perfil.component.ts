// src/app/pages/perfil/perfil.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfilAlumno, PerfilService } from '../../services/perfil.service';

type Cert = { titulo: string; anio: number; horas: number };
type Exp = {
  cargo: string;
  desde: string;
  hasta: string;
  habilidades: string[];
  tech: string[];
};

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  originalPerfil!: PerfilAlumno;

  // modelo editable
  editable = {
    nombre: '',
    apellido: '',
    carrera: '',
    semestre: 0,
    telefono: '',
    email: '',
    ubicacion: '',
  };

  // UI
  colegio = 'Las Teresas';
  idiomas = ['Inglés', 'Portugués', 'Español', 'Italiano', 'Francés'];
  rolPrincipal = '';

  loading = false;
  saving = false;
  errorMsg: string | null = null;
  saveMsg: string | null = null;
  editMode = false;

  // Certificados (no se tocan)
  certificados: Cert[] = [
    { titulo: 'AWS Data Science', anio: 2025, horas: 25 },
    { titulo: 'Administración Empresarial', anio: 2024, horas: 40 },
    { titulo: 'Tecnicatura en CSS', anio: 2023, horas: 90 },
    { titulo: 'Machine Learning', anio: 2022, horas: 20 },
  ];

  // Experiencias (no se tocan)
  experiencias: Exp[] = [
    {
      cargo: 'Artista independiente',
      desde: 'Sep. 2023',
      hasta: 'Ago. 2024',
      habilidades: [
        'IA generativa',
        'Pagar impuestos y promocionarse en redes',
      ],
      tech: ['LLM'],
    },
    {
      cargo: 'Analista de datos',
      desde: 'Ago. 2022',
      hasta: 'Sep. 2023',
      habilidades: [
        'Excel',
        'Dar predicciones de ventas a clientes necesitados',
      ],
      tech: ['Visual Basic'],
    },
    {
      cargo: 'Promotor de Colombo',
      desde: 'Sep. 2021',
      hasta: 'Ago. 2022',
      habilidades: [
        'Trato con clientes',
        'Automatización de respuestas de WhatsApp',
      ],
      tech: ['Python'],
    },
  ];

  sobreMi: string[] = [
    'Persona proactiva con ganas de emprender y con habilidades en muchos campos, amante del arte que es programar.',
    'Me encantan los retos nuevos y conocer cada parte del software que voy a desarrollar, así como entregar una experiencia total a mis clientes.',
    'Los martes y domingos son de estudio intenso con objetivos claros.',
    'Musulmán.',
  ];

  constructor(private perfilService: PerfilService) {}

  ngOnInit(): void {
    this.loading = true;
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
  }

  get nombreCompleto(): string {
    return `${this.editable.nombre} ${this.editable.apellido}`.trim();
  }

  get semestreLabel(): string {
    return `${this.editable.semestre}`;
  }

  editarPerfil() {
    this.editMode = true;
    this.saveMsg = null;
    this.errorMsg = null;
  }

  cancelarEdicion() {
    this.editMode = false;
    this.errorMsg = null;
    this.saveMsg = null;

    // reset a original
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
      // no llamar al backend si no hay cambios
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

  verCertificado(c: Cert) {
    alert(`Ver detalles: ${c.titulo}`);
  }
}
