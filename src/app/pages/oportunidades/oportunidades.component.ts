import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Kind = 'Pasantía' | 'Beca' | 'Proyecto' | 'Empleo';

interface Opportunity {
  id: string;
  title: string;
  career: string; // p.ej. 'Ingeniería Informática', 'Diseño Gráfico'
  kind: Kind;
  start: string; // p.ej. '2026'
  hours: number; // ~100
  credits: number; // 1, 2, ...
}

@Component({
  standalone: true,
  selector: 'app-oportunidades',
  imports: [CommonModule, FormsModule],
  templateUrl: './oportunidades.component.html',
  styleUrls: ['./oportunidades.component.css'],
})
export class OportunidadesComponent {
  // Carreras del usuario en orden => mapeo a paleta dinámica
  userCareers = ['Ingeniería Informática', 'Diseño Gráfico'];

  // Paleta (1ª azul, 2ª púrpura; puedes extenderla sin tocar CSS)
  careerPalette = [
    '#4f46e5',
    '#a21caf',
    '#059669',
    '#c2410c',
    '#2563eb',
    '#9333ea',
  ];

  // Tipos disponibles
  kinds: Kind[] = ['Pasantía', 'Beca', 'Proyecto', 'Empleo'];

  // Datos mock (con el look del diseño)
  all: Opportunity[] = [
    {
      id: '1',
      title: 'AppCECyT',
      career: 'Ingeniería Informática',
      kind: 'Proyecto',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '2',
      title: 'GuaranIA',
      career: 'Ingeniería Informática',
      kind: 'Pasantía',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '3',
      title: 'Diseño de logo',
      career: 'Diseño Gráfico',
      kind: 'Pasantía',
      start: '2026',
      hours: 10,
      credits: 1,
    },
    {
      id: '4',
      title: 'RubyOnRails',
      career: 'Ingeniería Informática',
      kind: 'Proyecto',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '5',
      title: 'SODEP',
      career: 'Ingeniería Informática',
      kind: 'Empleo',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '6',
      title: 'DGI - UCA',
      career: 'Ingeniería Informática',
      kind: 'Empleo',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '7',
      title: 'CBA',
      career: 'Ingeniería Informática',
      kind: 'Empleo',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '8',
      title: 'AppCECyT',
      career: 'Diseño Gráfico',
      kind: 'Proyecto',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '9',
      title: 'MentorMate',
      career: 'Ingeniería Informática',
      kind: 'Empleo',
      start: '2026',
      hours: 100,
      credits: 2,
    },
    {
      id: '10',
      title: 'EmpresaDeDiseño',
      career: 'Diseño Gráfico',
      kind: 'Empleo',
      start: '2026',
      hours: 100,
      credits: 2,
    },
  ];

  // Estado de filtros
  search = '';
  selectedKind: Kind | null = null; // categoría activa (o null = todas)
  selectedCareers = new Set<string>(this.userCareers); // por defecto, todas las del usuario

  // Helpers de UI
  isCareerSelected(c: string) {
    return this.selectedCareers.has(c);
  }
  toggleCareer(c: string) {
    if (this.selectedCareers.has(c)) this.selectedCareers.delete(c);
    else this.selectedCareers.add(c);
  }
  setKind(k: Kind | null) {
    this.selectedKind = k;
  }

  // Color dinámico por carrera (según orden del usuario)
  careerColor(career: string): string {
    const idx = this.userCareers.findIndex(
      (c) => c.toLowerCase() === career.toLowerCase()
    );
    return this.careerPalette[(idx >= 0 ? idx : 0) % this.careerPalette.length];
  }

  // Lista filtrada
  get list(): Opportunity[] {
    const q = this.search.trim().toLowerCase();
    return this.all.filter((o) => {
      const passKind = !this.selectedKind || o.kind === this.selectedKind;
      const passCareer =
        this.selectedCareers.size === 0 || this.selectedCareers.has(o.career);
      const passSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.career.toLowerCase().includes(q);
      return passKind && passCareer && passSearch;
    });
  }

  inscribirse(o: Opportunity) {
    alert(`Inscripción a "${o.title}" (${o.kind})`);
  }

  editar(o: Opportunity) {
    alert(`Editar postulación a "${o.title}"`);
  }
}
