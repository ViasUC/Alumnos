import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Cert = { titulo: string; anio: number; horas: number };
type Exp = {
  cargo: string;
  desde: string; // "Sep. 2023"
  hasta: string; // "Ago. 2024" o "Actual"
  habilidades: string[]; // aprendidas / responsabilidades
  tech?: string[]; // herramientas o skills clave
};

@Component({
  standalone: true,
  selector: 'app-perfil',
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent {
  // Header / datos de perfil
  nombre = 'Francisco González';
  carreras = ['Ingeniería Informática', 'Diseño Gráfico'];
  semestreMax = '4to curso, 8vo semestre';
  colegio = 'Las Teresas';
  idiomas = ['Inglés', 'Portugués', 'Español', 'Italiano', 'Francés'];

  // Certificados (lista scrollable)
  certificados: Cert[] = [
    { titulo: 'AWS Data Science', anio: 2025, horas: 25 },
    { titulo: 'Administración Empresarial', anio: 2024, horas: 40 },
    { titulo: 'Tecnicatura en CSS', anio: 2023, horas: 90 },
    { titulo: 'Machine Learning', anio: 2022, horas: 20 },
  ];

  // Experiencias (estilo “tabla” con filas tipo cards)
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

  // Sobre mí
  sobreMi: string[] = [
    'Persona proactiva con ganas de emprender y con habilidades en muchos campos, amante del arte que es programar.',
    'Me encantan los retos nuevos y conocer cada parte del software que voy a desarrollar, así como entregar una experiencia total a mis clientes.',
    'Los martes y domingos son de estudio intenso con objetivos claros.',
    'Musulmán.',
  ];

  editarPerfil() {
    // acá irá tu navegación o apertura de modal
    alert('Editar perfil (pendiente de implementación)');
  }

  verCertificado(c: Cert) {
    // acá podrías navegar a /certificados/:id o abrir modal
    alert(`Ver detalles: ${c.titulo}`);
  }
}
