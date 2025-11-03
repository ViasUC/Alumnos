import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  // Menú dividido para insertar el "user chip" al medio
  leftMenu = [{ label: 'Portafolio', path: '/portafolio' }];
  rightMenu = [
    { label: 'Oportunidades', path: '/oportunidades' },
    { label: 'Perfil', path: '/perfil' },
    { label: 'Convenios', path: '/convenios' },
  ];

  // Placeholder: luego lo traes con tu service
  username = 'Francisco González';
  currentRole:
    | 'Alumno'
    | 'Investigador'
    | 'Profesor'
    | 'Ex alumno'
    | 'Empresarial' = 'Alumno';
  roles = ['Investigador', 'Profesor', 'Ex alumno', 'Empresarial'];

  isDarkMode = true;
  isMenuOpen = false;

  @ViewChild('userMenu', { read: ElementRef }) userMenuRef?: ElementRef;

  toggleMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }
  get modeAscii(): string {
    return this.isDarkMode ? '🌙' : '☀️';
  }

  toggleUserMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  selectRole(role: string) {
    this.currentRole = role as any;
    this.isMenuOpen = false;
    // TODO: guardar/cambiar rol vía service
  }
  signOut() {
    this.isMenuOpen = false;
    // TODO: cerrar sesión (service + navigate a /login)
    alert('Cerrar sesión');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.isMenuOpen || !this.userMenuRef) return;
    const el = this.userMenuRef.nativeElement as HTMLElement;
    if (!el.contains(e.target as Node)) this.isMenuOpen = false;
  }
  @HostListener('document:keydown.escape')
  onEsc() {
    this.isMenuOpen = false;
  }
}
