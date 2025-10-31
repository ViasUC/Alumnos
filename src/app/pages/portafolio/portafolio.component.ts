import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CertificadoComponent } from './certificado/certificado.component';
import { ActividadComponent } from './actividad/actividad.component';
import { PendienteComponent } from './pendiente/pendiente.component';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [
    CommonModule,
    CertificadoComponent,
    ActividadComponent,
    PendienteComponent,
    RouterModule,
  ],
  templateUrl: './portafolio.component.html',
  styleUrls: ['./portafolio.component.css'],
})
export class PortafolioComponent {
  certificados = [
    {
      id: 1,
      nombreEvento: 'Congreso de Innovación 2025',
      tipo: 'certificado',
      carrera: 'Ingeniería Informática',
      areas: ['Tecnología', 'Investigación'],
      horas: 12,
      fecha: '2025-09-01',
      lugar: 'Asunción',
      origen: 'Alumno',
      estado: 'Pendiente',
      archivoUrl: 'assets/certificados/innovacion.pdf',
    },
  ];

  actividades = [
    {
      id: 1,
      nombre: 'Voluntariado en Biblioteca UC',
      fecha: '2025-10-15',
      horas: 8,
      tipo: 'voluntariado',
      carrera: 'Ingeniería Informática',
      areas: ['Responsabilidad Social', 'Educación'],
      lugar: 'Campus Central',
      origen: 'VIAS UC',
      estado: 'Aprobado',
    },
    {
      id: 2,
      nombre: 'Hackathon Vias UC 2024',
      fecha: '2025-09-15',
      horas: 40,
      tipo: 'actividad',
      carrera: 'Ingeniería Informática',
      areas: ['Innovación', 'Programación'],
      lugar: 'Online',
      origen: 'VIAS UC',
      estado: 'Aprobado',
    },
  ];
}
