// src/app/pages/canales/canales.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CanalesService,
  Canal,
  CanalTipo,
} from '../../services/canales.service';

@Component({
  standalone: true,
  selector: 'app-canales',
  imports: [CommonModule, FormsModule],
  templateUrl: './convenios.component.html',
  styleUrls: ['./convenios.component.css'],
})
export class ConveniosComponent implements OnInit {
  all: Canal[] = [];

  tipos: CanalTipo[] = [
    'OFERTAS',
    'EVENTOS',
    'INNOVACION',
    'NOTICIAS_INSTITUCIONALES',
  ];

  selectedTipo: CanalTipo | null = null;
  search = '';

  loading = false;
  errorMsg: string | null = null;
  followingIds = new Set<string>();

  private userId: string | null = null;

  constructor(private canalesSvc: CanalesService) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId'); // ya se guarda en login
    this.cargarCanales();
  }

  private cargarCanales(): void {
    this.loading = true;
    this.errorMsg = null;

    this.canalesSvc.getCanalesActivos(this.userId).subscribe({
      next: (canales) => {
        this.all = canales;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando canales', err);
        this.errorMsg = 'No se pudieron cargar los canales.';
        this.loading = false;
      },
    });
  }

  setTipo(tipo: CanalTipo | null): void {
    this.selectedTipo = tipo;
  }

  isTipoSelected(tipo: CanalTipo): boolean {
    return this.selectedTipo === tipo;
  }

  // listas derivadas: primero seguidos, después el resto
  get followedList(): Canal[] {
    return this.filtered().filter((c) => c.seguido);
  }

  get otherList(): Canal[] {
    return this.filtered().filter((c) => !c.seguido);
  }

  private filtered(): Canal[] {
    const q = this.search.trim().toLowerCase();
    return this.all.filter((c) => {
      const passTipo = !this.selectedTipo || c.tipo === this.selectedTipo;

      const texto =
        `${c.nombre} ${c.descripcion} ${c.slug} ${c.tipo}`.toLowerCase();

      const passSearch = !q || texto.includes(q);
      return passTipo && passSearch;
    });
  }

  puedeSeguir(c: Canal): boolean {
    if (!this.userId) return false;
    if (c.seguido) return false;
    if (this.followingIds.has(c.id)) return false;
    return true;
  }

  seguir(c: Canal): void {
    if (!this.userId || !this.puedeSeguir(c)) return;

    this.followingIds.add(c.id);

    this.canalesSvc.seguirCanal(c.id, this.userId).subscribe({
      next: (ok) => {
        if (ok) {
          // marcar como seguido en la lista local
          this.all = this.all.map((x) =>
            x.id === c.id ? { ...x, seguido: true } : x
          );
        }
        this.followingIds.delete(c.id);
      },
      error: (err) => {
        console.error('Error al seguir canal', err);
        this.followingIds.delete(c.id);
        this.errorMsg = 'No se pudo seguir el canal. Intentá de nuevo.';
      },
    });
  }
}
