import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificadoData } from '../models/certificado.data';

@Component({
  selector: 'app-certificado-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.css'],
})
export class CertificadoComponent {
  @Input() data!: CertificadoData;
}
