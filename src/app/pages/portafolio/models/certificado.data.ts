export interface CertificadoData {
  id: number;
  nombreEvento: string;
  tipo: string;
  carrera: string;
  areas: string[];
  horas: number;
  fecha: string;
  lugar: string;
  origen: string;
  estado: string;
  archivoUrl?: string; // opcional para el botón de descarga
}
