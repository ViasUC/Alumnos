import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NgFor, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  // Mapeo label -> path
  menu = [
    { label: 'Portafolio', path: '/portafolio' },
    { label: 'Oportunidades', path: '/oportunidades' },
    { label: 'Perfil', path: '/perfil' },
    { label: 'Convenios', path: '/convenios' },
  ];

  isDarkMode = true;

  toggleMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }

  get modeAscii(): string {
    return this.isDarkMode ? '🌙' : '☀️';
  }
}
