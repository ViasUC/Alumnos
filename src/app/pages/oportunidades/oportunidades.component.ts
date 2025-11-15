// src/app/pages/oportunidades/oportunidades.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Kind,
  Opportunity,
  OportunidadesService,
} from '../../services/oportunidades.service';

@Component({
  standalone: true,
  selector: 'app-oportunidades',
  imports: [CommonModule, FormsModule],
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.css'],
})
export class OportunidadesComponent implements OnInit {
  all: Opportunity[] = [];

  // filtros
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

  constructor(private oportunidadesSvc: OportunidadesService) {}

  ngOnInit(): void {
    this.loading = true;
    this.oportunidadesSvc.getAllOportunities().subscribe({
      next: (ops) => {
        this.all = ops;

        const set = new Map<string, string>();
        for (const o of ops) {
          const key = (o.modalidad ?? '').trim().toLowerCase();
          if (key && !set.has(key)) set.set(key, o.modalidad);
        }
        this.modalidades = Array.from(set.values());
        this.selectedModalidades = new Set(
          this.modalidades.map((m) => m.toLowerCase())
        );

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando oportunidades', err);
        this.errorMsg = 'No se pudieron cargar las oportunidades.';
        this.loading = false;
      },
    });
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

    return this.all.filter((o) => {
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

  inscribirse(o: Opportunity) {
    alert(`Inscripción a "${o.title}" (${o.kind})`);
  }

  editar(o: Opportunity) {
    alert(`Editar postulación a "${o.title}"`);
  }
}
