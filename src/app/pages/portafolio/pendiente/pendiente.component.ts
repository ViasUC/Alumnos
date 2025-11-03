import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PendienteData = {
  id: number | string;
  nombre: string;
  fecha: string;
  horas: number;
  tipo: string;
  carrera: string;
  areas: string[];
  lugar?: string;
  origen?: string;
  estado?: string; // "Pendiente"
};

@Component({
  selector: 'app-pendiente-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pendiente.component.html',
  styleUrls: ['./pendiente.component.css'],
})
export class PendienteComponent {
  @Input() data!: PendienteData;
}
