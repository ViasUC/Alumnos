import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { PortafolioComponent } from './portafolio/portafolio.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'portafolio', pathMatch: 'full' },
      { path: 'portafolio', component: PortafolioComponent },
    ],
  },
];
