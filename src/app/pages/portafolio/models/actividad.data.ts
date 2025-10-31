export interface ActividadData {
  id?: number;
  nombre: string;
  tipo: string;
  carrera: string;
  areas: string[];
  horas: number;
  fecha: string;
  lugar?: string;
  origen: string;
  estado?: string;
}
