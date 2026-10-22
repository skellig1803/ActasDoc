export type TipoTema = 'informe' | 'exploracion' | 'decision';

export type EstadoTarea = 'pendiente' | 'en_progreso' | 'cumplida';

export interface TemaAgenda {
  id: string;
  numero: number;
  tema: string;
  traidoPor: string;
  tipo: TipoTema;
  desarrollo: string;
  resolucion: string;
  tiempoEstimadoMin?: number;
}

export interface TareaAccion {
  id: string;
  numero: number;
  accion: string;
  responsable: string;
  fechaLimite: string;
  estado: EstadoTarea;
  temaRelacionadoId?: string;
  temaRelacionadoTitulo?: string;
}

export interface Maestro {
  id: string;
  nombre: string;
  areaCargo: string;
}

export interface ActaData {
  id: string;
  actaNumero: string;
  institucion: string;
  subtitulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  facilitador: string;
  secretario: string;
  ausentes: string[];
  ausentesNotas?: string;
  invitados: string;
  
  apertura: {
    checkIn: string;
    informesAvisosBreves: string;
    compromisosAnteriores: string;
  };

  temas: TemaAgenda[];
  tareas: TareaAccion[];

  cierre: {
    proximaReunionFecha: string;
    proximaReunionHora: string;
    proximaReunionLugar?: string;
    checkOut: string;
  };

  firmas: {
    facilitadorNombre: string;
    facilitadorFirmaUrl?: string;
    secretarioNombre: string;
    secretarioFirmaUrl?: string;
  };

  creadoEn: string;
  actualizadoEn: string;
  estado: 'borrador' | 'finalizada';
}
