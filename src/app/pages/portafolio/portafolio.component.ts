// src/app/pages/portafolio/portafolio.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Portafolio,
  PortafolioService,
  Evidencia,
} from '../../services/portafolio.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './portafolio.component.html',
  styleUrls: ['./portafolio.component.css'],
})
export class PortafolioComponent implements OnInit {
  activeTab: 'aprobadas' | 'pendientes' = 'aprobadas';

  portafolioOriginal: Portafolio | null = null;
  portafolioEdit: {
    descripcion: string;
    skills: string;
    visibilidad: boolean;
  } = {
    descripcion: '',
    skills: '',
    visibilidad: true,
  };

  evidencias: Evidencia[] = [];
  loading = false;
  loadingEvidencias = false;
  savingPortafolio = false;
  savingEvidencia = false;

  errorMsg: string | null = null;
  successMsg: string | null = null;

  showNewEvidence = false;
  newEvidence: Omit<Evidencia, 'idEvidencia'> = {
    titulo: '',
    descripcion: '',
    recurso: '',
    tipo: '',
  };

  // edición inline de evidencia
  editingEvidenceId: number | null = null;
  editEvidenceModel: Omit<Evidencia, 'idEvidencia'> = {
    titulo: '',
    descripcion: '',
    recurso: '',
    tipo: '',
  };

  constructor(private portafolioService: PortafolioService) {}

  ngOnInit(): void {
    this.cargarPortafolio();
  }

  private cargarPortafolio(): void {
    this.loading = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.portafolioService.getPortafolio().subscribe({
      next: (p) => {
        this.portafolioOriginal = p;
        this.portafolioEdit = {
          descripcion: p.descripcion,
          skills: p.skills,
          visibilidad: p.visibilidad,
        };
        this.loading = false;
        this.cargarEvidencias();
      },
      error: (err) => {
        console.error('Error cargando portafolio', err);
        this.errorMsg =
          'No se pudo cargar tu portafolio. Volvé a iniciar sesión o recargá la página.';
        this.loading = false;
      },
    });
  }

  private cargarEvidencias(): void {
    if (!this.portafolioOriginal) return;
    this.loadingEvidencias = true;
    this.errorMsg = null;

    this.portafolioService
      .getEvidencias(this.portafolioOriginal.idPortafolio)
      .subscribe({
        next: (evs) => {
          this.evidencias = evs;
          this.loadingEvidencias = false;
        },
        error: (err) => {
          console.error('Error cargando evidencias', err);
          this.errorMsg = 'No se pudieron cargar las evidencias.';
          this.loadingEvidencias = false;
        },
      });
  }

  private hayCambiosPortafolio(): boolean {
    const o = this.portafolioOriginal;
    const e = this.portafolioEdit;
    if (!o) return false;

    return (
      (o.descripcion ?? '') !== (e.descripcion ?? '') ||
      (o.skills ?? '') !== (e.skills ?? '') ||
      !!o.visibilidad !== !!e.visibilidad
    );
  }

  guardarPortafolio(): void {
    if (!this.portafolioOriginal) return;

    this.errorMsg = null;
    this.successMsg = null;

    if (!this.hayCambiosPortafolio()) {
      this.successMsg = 'No hubo cambios en el portafolio.';
      return;
    }

    const updated: Portafolio = {
      ...this.portafolioOriginal,
      descripcion: this.portafolioEdit.descripcion ?? '',
      skills: this.portafolioEdit.skills ?? '',
      visibilidad: !!this.portafolioEdit.visibilidad,
    };

    this.savingPortafolio = true;
    this.portafolioService.actualizarPortafolio(updated).subscribe({
      next: (saved) => {
        this.portafolioOriginal = saved;
        this.portafolioEdit = {
          descripcion: saved.descripcion,
          skills: saved.skills,
          visibilidad: saved.visibilidad,
        };
        this.savingPortafolio = false;
        this.successMsg = 'Portafolio actualizado correctamente.';
      },
      error: (err) => {
        console.error('Error actualizando portafolio', err);
        this.savingPortafolio = false;
        this.errorMsg =
          'Error al actualizar el portafolio. Intentá de nuevo más tarde.';
      },
    });
  }

  // Evidencias

  toggleNuevaEvidencia(): void {
    this.showNewEvidence = !this.showNewEvidence;
    if (this.showNewEvidence) {
      this.successMsg = null;
      this.errorMsg = null;
      this.newEvidence = {
        titulo: '',
        descripcion: '',
        recurso: '',
        tipo: '',
      };
    }
  }

  guardarEvidencia(): void {
    if (!this.portafolioOriginal) return;

    const { titulo, descripcion, recurso, tipo } = this.newEvidence;
    if (!titulo.trim() || !descripcion.trim()) {
      this.errorMsg =
        'Título y descripción son obligatorios para la evidencia.';
      return;
    }

    this.savingEvidencia = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.portafolioService
      .agregarEvidencia(this.portafolioOriginal.idPortafolio, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        recurso: recurso.trim(),
        tipo: tipo.trim(),
      })
      .subscribe({
        next: (ev) => {
          this.evidencias.unshift(ev);
          this.savingEvidencia = false;
          this.showNewEvidence = false;
          this.successMsg = 'Evidencia agregada correctamente.';
        },
        error: (err) => {
          console.error('Error agregando evidencia', err);
          this.savingEvidencia = false;
          this.errorMsg =
            'No se pudo agregar la evidencia. Intentá de nuevo más tarde.';
        },
      });
  }

  // edición inline

  startEditarEvidencia(e: Evidencia): void {
    this.editingEvidenceId = e.idEvidencia;
    this.editEvidenceModel = {
      titulo: e.titulo,
      descripcion: e.descripcion,
      recurso: e.recurso,
      tipo: e.tipo,
    };
    this.errorMsg = null;
    this.successMsg = null;
  }

  cancelarEditarEvidencia(): void {
    this.editingEvidenceId = null;
    this.editEvidenceModel = {
      titulo: '',
      descripcion: '',
      recurso: '',
      tipo: '',
    };
  }

  guardarEdicionEvidencia(): void {
    if (this.editingEvidenceId == null) return;

    const titulo = this.editEvidenceModel.titulo.trim();
    const descripcion = this.editEvidenceModel.descripcion.trim();

    if (!titulo || !descripcion) {
      this.errorMsg = 'Título y descripción son obligatorios.';
      return;
    }

    this.savingEvidencia = true;
    this.errorMsg = null;
    this.successMsg = null;

    const payload: Evidencia = {
      idEvidencia: this.editingEvidenceId,
      titulo,
      descripcion,
      recurso: this.editEvidenceModel.recurso.trim(),
      tipo: this.editEvidenceModel.tipo.trim(),
    };

    this.portafolioService.editarEvidencia(payload).subscribe({
      next: (saved) => {
        this.evidencias = this.evidencias.map((ev) =>
          ev.idEvidencia === saved.idEvidencia ? saved : ev
        );
        this.savingEvidencia = false;
        this.editingEvidenceId = null;
        this.successMsg = 'Evidencia actualizada correctamente.';
      },
      error: (err) => {
        console.error('Error editando evidencia', err);
        this.savingEvidencia = false;
        this.errorMsg =
          'No se pudo editar la evidencia. Intentá de nuevo más tarde.';
      },
    });
  }

  eliminarEvidencia(e: Evidencia): void {
    if (!confirm(`¿Eliminar la evidencia "${e.titulo}"?`)) return;

    this.savingEvidencia = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.portafolioService.eliminarEvidencia(e.idEvidencia).subscribe({
      next: (ok) => {
        if (ok) {
          this.evidencias = this.evidencias.filter(
            (ev) => ev.idEvidencia !== e.idEvidencia
          );
          this.successMsg = 'Evidencia eliminada.';
        } else {
          this.errorMsg = 'No se pudo eliminar la evidencia.';
        }
        this.savingEvidencia = false;
      },
      error: (err) => {
        console.error('Error eliminando evidencia', err);
        this.savingEvidencia = false;
        this.errorMsg =
          'No se pudo eliminar la evidencia. Intentá de nuevo más tarde.';
      },
    });
  }

  get pendientes(): Evidencia[] {
    // placeholder por si después distinguís estados
    return [];
  }
}
