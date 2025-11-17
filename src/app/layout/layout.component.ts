// src/app/layout/layout.component.ts
import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnInit,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PerfilService } from '../services/perfil.service';
import { GeneralService } from '../services/general.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  // Menú dividido para insertar el "user chip" al medio
  leftMenu = [{ label: 'Portafolio', path: '/portafolio' }];
  rightMenu = [
    { label: 'Oportunidades', path: '/oportunidades' },
    { label: 'Perfil', path: '/perfil' },
    { label: 'Canales', path: '/convenios' },
  ];

  // Se rellena con datos reales
  username = 'Cargando...';
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

  constructor(
    private router: Router,
    private perfilService: PerfilService,
    private generalService: GeneralService
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  private cargarUsuario(): void {
    // si no hay login guardado → ir al login
    const savedLogin = this.generalService.getSavedLogin();
    if (!savedLogin) {
      this.router.navigate(['/login']);
      return;
    }

    // usamos el mismo PerfilService que en la pantalla de perfil
    this.perfilService.getPerfilAlumno().subscribe({
      next: (perfil) => {
        const nombre = `${perfil.nombre} ${perfil.apellido}`.trim();
        this.username = nombre || perfil.email || 'Usuario';
        // si rolPrincipal existe lo usamos como rol actual
        if (perfil.rolPrincipal) {
          this.currentRole = perfil.rolPrincipal as any;
        }
      },
      error: (err) => {
        console.error('Error cargando datos de usuario en layout', err);
        this.username = 'Usuario';
      },
    });
  }

  // --- dark mode ---
  toggleMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }
  get modeAscii(): string {
    return this.isDarkMode ? '🌙' : '☀️';
  }

  // --- menú usuario ---
  toggleUserMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectRole(role: string) {
    // cambiar de tipo de usuario => reautenticar
    this.currentRole = role as any;
    this.isMenuOpen = false;

    // limpiamos sesión y mandamos al login
    this.generalService.clearLogin();
    this.router.navigate(['/login']);
  }

  signOut() {
    this.isMenuOpen = false;
    this.generalService.clearLogin();
    this.router.navigate(['/login']);
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
