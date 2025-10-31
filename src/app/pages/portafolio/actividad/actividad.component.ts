import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadData } from '../models/actividad.data';

@Component({
  selector: 'app-actividad-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actividad.component.html',
  styleUrls: ['./actividad.component.css'],
})
export class ActividadComponent {
  @Input() data!: ActividadData;
}
