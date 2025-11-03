import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Convenio = {
  id: string;
  entidad: string;
  titulo: string;
  descripcion: string;
  inicio: string;
  fin: string;
};

@Component({
  selector: 'app-convenios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './convenios.component.html',
  styleUrl: './convenios.component.css',
})
export class ConveniosComponent {
  data: Convenio[] = [
    {
      id: 'c1',
      entidad: 'Fundación UCA',
      titulo: 'Convenio de Investigación aplicada',
      descripcion:
        'Líneas de investigación en IA educativa y análisis de datos académicos.',
      inicio: '2025-10-01',
      fin: '2026-12-31',
    },
    {
      id: 'c2',
      entidad: 'MentorMate',
      titulo: 'Prácticas y Pasantías',
      descripcion:
        'Cupos de prácticas profesionales para estudiantes de ingeniería.',
      inicio: '2025-12-15',
      fin: '2026-06-30',
    },
    {
      id: 'c3',
      entidad: 'SODEP',
      titulo: 'Residencia Profesional',
      descripcion:
        'Programa de residencia con rotaciones en equipos de producto.',
      inicio: '2024-02-01',
      fin: '2025-08-31',
    },
  ];
  // Filtros
  q = '';
  onlyActive = false;

  // Helpers de estado por vigencia
  private toDate(s: string) {
    return new Date(s + 'T00:00:00');
  }
  status(c: Convenio): 'Activo' | 'Próximo' | 'Expirado' {
    const today = new Date();
    const ini = this.toDate(c.inicio);
    const fin = this.toDate(c.fin);
    if (today < ini) return 'Próximo';
    if (today > fin) return 'Expirado';
    return 'Activo';
  }

  // Lista filtrada
  get list(): Convenio[] {
    const q = this.q.trim().toLowerCase();
    return this.data.filter((c) => {
      const match =
        !q ||
        c.entidad.toLowerCase().includes(q) ||
        c.titulo.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q);
      const act = this.status(c) === 'Activo';
      return match && (!this.onlyActive || act);
    });
  }

  ver(c: Convenio) {
    // TODO: navegar a detalle o abrir modal
    alert(`Ver convenio: ${c.titulo}`);
  }
}
