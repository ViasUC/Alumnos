import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PortafolioComponent } from './pages/portafolio/portafolio.component';
import { OportunidadesComponent } from './pages/oportunidades/oportunidades.component';
import { ConveniosComponent } from './pages/convenios/convenios.component';
import { PerfilComponent } from './pages/perfil/perfil.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'portafolio', component: PortafolioComponent },
      { path: 'oportunidades', component: OportunidadesComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'convenios', component: ConveniosComponent },
      { path: '**', redirectTo: 'portafolio' },
    ],
  },
];
