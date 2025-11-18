// src/app/pages/oportunidades/oportunidades.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Kind,
  Opportunity,
  OportunidadesService,
} from '../../services/oportunidades.service';
import { PostulacionesService } from '../../services/postulacion.service';

type ViewMode = 'oportunidades' | 'bolsa';

@Component({
  standalone: true,
  selector: 'app-oportunidades',
  imports: [CommonModule, FormsModule],
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.css'],
})
export class OportunidadesComponent implements OnInit {
  all: Opportunity[] = [];

  viewMode: ViewMode = 'oportunidades';

  search = '';
  kinds: Kind[] = [
    'Pasantía',
    'Beca',
    'Proyecto',
    'Empleo',
    'Ayudantía',
    'Otro',
  ];
  selectedKind: Kind | null = null;

  modalidades: string[] = [];
  selectedModalidades = new Set<string>(); // modalidad en minúsculas

  careerPalette = [
    '#4f46e5',
    '#a21caf',
    '#059669',
    '#c2410c',
    '#2563eb',
    '#9333ea',
  ];

  loading = false;
  errorMsg: string | null = null;

  // postulación
  applyMsg: string | null = null;
  applyingIds = new Set<string>(); // ids que están en proceso de postulación
  private userId: string | null = null;

  constructor(
    private oportunidadesSvc: OportunidadesService,
    private postulacionesSvc: PostulacionesService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.userId = localStorage.getItem('userId');

    // 1) traer todas las oportunidades
    this.oportunidadesSvc.getAllOportunities().subscribe({
      next: (ops) => {
        // si no hay usuario logueado, no podemos marcar aplicados
        if (!this.userId) {
          this.initModalidades(ops);
          this.all = ops.map((o) => ({ ...o, aplicado: false }));
          this.loading = false;
          return;
        }

        // 2) traer postulaciones del alumno y marcar aplicados
        this.postulacionesSvc.getPostulacionesAlumno(this.userId).subscribe({
          next: (ids) => {
            const appliedSet = new Set(ids);
            this.initModalidades(ops);
            this.all = ops.map((o) => ({
              ...o,
              aplicado: appliedSet.has(o.id),
            }));
            this.loading = false;
          },
          error: (err) => {
            console.error('Error cargando postulaciones del alumno', err);
            // si falla, seguimos pero sin marcado de aplicados
            this.initModalidades(ops);
            this.all = ops.map((o) => ({ ...o, aplicado: false }));
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('Error cargando oportunidades', err);
        this.errorMsg = 'No se pudieron cargar las oportunidades.';
        this.loading = false;
      },
    });
  }

  private initModalidades(ops: Opportunity[]): void {
    const set = new Map<string, string>();
    for (const o of ops) {
      const key = (o.modalidad ?? '').trim().toLowerCase();
      if (key && !set.has(key)) set.set(key, o.modalidad);
    }
    this.modalidades = Array.from(set.values());
    this.selectedModalidades = new Set(
      this.modalidades.map((m) => m.toLowerCase())
    );
  }

  // cambiar entre F2/F3 y F4
  setViewMode(mode: ViewMode) {
    this.viewMode = mode;
    this.applyMsg = null;
    this.errorMsg = null;
  }

  isModalidadSelected(m: string): boolean {
    return this.selectedModalidades.has(m.toLowerCase());
  }

  toggleModalidad(m: string): void {
    const key = m.toLowerCase();
    if (this.selectedModalidades.has(key)) {
      this.selectedModalidades.delete(key);
    } else {
      this.selectedModalidades.add(key);
    }
  }

  setKind(k: Kind | null): void {
    this.selectedKind = k;
  }

  modalidadColor(modalidad: string): string {
    const key = modalidad.toLowerCase();
    const idx = this.modalidades.findIndex((m) => m.toLowerCase() === key);
    const i = idx >= 0 ? idx : 0;
    return this.careerPalette[i % this.careerPalette.length];
  }

  // lista filtrada y búsqueda case-insensitive
  get list(): Opportunity[] {
    const q = this.search.trim().toLowerCase();

    const originFiltered = this.all.filter((o) =>
      this.viewMode === 'oportunidades'
        ? o.origin === 'oportunidad'
        : o.origin === 'bolsaTrabajo'
    );

    return originFiltered.filter((o) => {
      const passKind = !this.selectedKind || o.kind === this.selectedKind;

      const passModalidad =
        this.selectedModalidades.size === 0 ||
        this.selectedModalidades.has((o.modalidad ?? '').toLowerCase());

      const textoEmpresa = (o.empresa ?? '').toLowerCase();
      const textoUbicacion = (o.ubicacion ?? '').toLowerCase();

      const passSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        (o.descripcion ?? '').toLowerCase().includes(q) ||
        (o.modalidad ?? '').toLowerCase().includes(q) ||
        o.kind.toLowerCase().includes(q) ||
        textoEmpresa.includes(q) ||
        textoUbicacion.includes(q);

      return passKind && passModalidad && passSearch;
    });
  }

  isApplying(o: Opportunity): boolean {
    return this.applyingIds.has(o.id);
  }

  // no se puede postular si ya está aplicado
  canApply(o: Opportunity): boolean {
    if (o.aplicado) return false;
    if (this.isApplying(o)) return false;
    return true;
  }

  inscribirse(o: Opportunity) {
    this.applyMsg = null;
    this.errorMsg = null;

    const alumnoId = this.userId ?? localStorage.getItem('userId');
    if (!alumnoId) {
      this.errorMsg = 'Debés iniciar sesión para postularte.';
      return;
    }

    if (!this.canApply(o)) return;

    this.applyingIds.add(o.id);

    this.oportunidadesSvc.crearPostulacion(o.id, alumnoId).subscribe({
      next: (resp) => {
        this.applyingIds.delete(o.id);
        // marcar como aplicado en la lista completa
        this.all = this.all.map((x) =>
          x.id === o.id ? { ...x, aplicado: true } : x
        );
        this.applyMsg = `Te postulaste a "${o.title}" (estado: ${resp.estado}).`;
      },
      error: (err) => {
        console.error('Error al crear postulación', err);
        this.applyingIds.delete(o.id);
        this.errorMsg =
          'No se pudo completar la postulación. Intentá de nuevo más tarde.';
      },
    });
  }

  editar(o: Opportunity) {
    alert(`Editar postulación a "${o.title}"`);
  }
}
