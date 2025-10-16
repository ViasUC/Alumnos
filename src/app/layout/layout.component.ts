import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [NgFor],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'], // corregido
})
export class LayoutComponent {
  menuItems = ['Portafolio', 'Oportunidades', 'Perfil', 'Convenios'];

  isDarkMode = true; // modo inicial

  toggleMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  // ASCII simple para mostrar día/noche
  get modeAscii(): string {
    return this.isDarkMode ? '☾ Noche' : '☀︎ Día';
  }
}
