import { ActaData, Maestro, TareaAccion } from '../types/acta';

const STORAGE_KEYS = {
  CURRENT_DRAFT: 'actasdoc_cenedis_current_draft_v2',
  SAVED_ACTAS: 'actasdoc_cenedis_saved_actas_v2',
  ROSTER: 'actasdoc_cenedis_teachers_roster_v2',
};

export const DEFAULT_ROSTER: Maestro[] = [
  { id: '1', nombre: 'Clara Augusta', areaCargo: 'Jardín' },
  { id: '2', nombre: 'Maritza Adriana', areaCargo: 'Rectora, Jardín' },
  { id: '3', nombre: 'Lorena Filomena', areaCargo: 'Segundo' },
  { id: '4', nombre: 'Mariuxi Dayana', areaCargo: 'Tercero' },
  { id: '5', nombre: 'Layla Gioana', areaCargo: 'Cuarto' },
  { id: '6', nombre: 'Priscila Isabel', areaCargo: 'Quinto' },
  { id: '7', nombre: 'Lisseth Odalis', areaCargo: 'Séptimo' },
  { id: '8', nombre: 'José Luis', areaCargo: 'Coordinación Administrativa' },
];

export const createBlankActa = (numero: string = '01'): ActaData => {
  const hoy = new Date();
  const fechaStr = hoy.toISOString().split('T')[0];
  const horaActual = hoy.toTimeString().substring(0, 5);
  
  return {
    id: `acta-${Date.now()}`,
    actaNumero: numero,
    institucion: 'CENEDIS LunaSol',
    subtitulo: 'Educación para el ser, salud para el futuro · Facultad de Maestros',
    fecha: fechaStr,
    horaInicio: horaActual,
    horaFin: '',
    lugar: 'Campus CENEDIS LunaSol - Sala de la Facultad de Maestros',
    facilitador: 'Maritza Adriana',
    secretario: 'José Luis',
    ausentes: [],
    ausentesNotas: '',
    invitados: '',
    apertura: {
      checkIn: '',
      informesAvisosBreves: '',
      compromisosAnteriores: '',
    },
    temas: [
      {
        id: `tema-${Date.now()}-1`,
        numero: 1,
        tema: '',
        traidoPor: '',
        tipo: 'informe',
        desarrollo: '',
        resolucion: '',
        tiempoEstimadoMin: 15,
      },
    ],
    tareas: [],
    cierre: {
      proximaReunionFecha: '',
      proximaReunionHora: '',
      proximaReunionLugar: 'Campus CENEDIS LunaSol - Sala de la Facultad de Maestros',
      checkOut: '',
    },
    firmas: {
      facilitadorNombre: 'Maritza Adriana',
      secretarioNombre: 'José Luis',
    },
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    estado: 'borrador',
  };
};

export const INITIAL_SAMPLE_ACTA: ActaData = {
  id: 'acta-cenedis-01',
  actaNumero: '04-2026',
  institucion: 'CENEDIS LunaSol',
  subtitulo: 'Educación para el ser, salud para el futuro · Reunión Ordinaria de Facultad de Maestros',
  fecha: new Date().toISOString().split('T')[0],
  horaInicio: '08:30',
  horaFin: '10:15',
  lugar: 'Campus CENEDIS LunaSol - Sala de la Facultad de Maestros',
  facilitador: 'Maritza Adriana',
  secretario: 'José Luis',
  ausentes: ['Layla Gioana'],
  ausentesNotas: 'Layla Gioana con permiso institucional en capacitación pedagógica.',
  invitados: 'Lic. Claudia Paredes (Pedagogía Curativa)',
  apertura: {
    checkIn: 'Ronda de inicio: La Facultad de Maestros comparte el estado de armonía y vitalidad del centro. Se destaca la receptividad en Jardín y el compromiso en los grados de Básica.',
    informesAvisosBreves: '• Celebración de la Fiesta de Otoño y Mesa de Estación el próximo viernes a las 10:00.\n• Entrega de materiales de lana natural y ceras antes del martes.',
    compromisosAnteriores: '• Cuadernos de época de segundo y tercero: Revisados y acompañados con retroalimentación artística.\n• Cronograma de siembra en el Huerto Escolar: Ejecutado al 100%.',
  },
  temas: [
    {
      id: 'tema-1',
      numero: 1,
      tema: 'Ritmo y Protección de Fuerzas Vitales en el Primer Septenio (Jardín)',
      traidoPor: 'Maritza Adriana (Rectora, Jardín)',
      tipo: 'decision',
      desarrollo: 'Se evalúa la necesidad de resguardar el juego libre e imitación en Jardín frente a demandas externas de intelectualización precoz. Se reafirma la política institucional de no forzar el pensar abstracto antes de los siete años para proteger la maduración cerebral y la voluntad.',
      resolucion: 'Se aprueba por consenso ratificar la estructura del aula de Jardín: 70% juego libre y rondas rítmicas, 30% labores manuales de imitación (cocina y tejido). Se comunicará este fundamento a las familias en la próxima circular.',
      tiempoEstimadoMin: 25,
    },
    {
      id: 'tema-2',
      numero: 2,
      tema: 'Planificación de Épocas de Inmersión de Segundo a Séptimo Grado',
      traidoPor: 'Lorena Filomena (Segundo)',
      tipo: 'exploracion',
      desarrollo: 'Exploración de la nueva época de cuatro semanas para educación básica. Se propone articular los cuadernos de época de Segundo y Tercero con narraciones vivas, acuarela y trabajos manuales significativos.',
      resolucion: 'Se acuerda iniciar la Época el primer lunes del próximo mes. Las maestras de grado coordinarán los contenidos artísticos y épocas de inmersión.',
      tiempoEstimadoMin: 20,
    },
    {
      id: 'tema-3',
      numero: 3,
      tema: 'Mantenimiento del Espacio, Huerto y Recursos Escolares',
      traidoPor: 'José Luis (Coordinación Administrativa)',
      tipo: 'informe',
      desarrollo: 'Informe sobre la reposición de bloques de cera de abejas, aceites naturales para madera y adecuación de espacios pedagógicos para la salud de los estudiantes.',
      resolucion: 'Informe recibido a satisfacción de la Facultad. Se continuará con el cronograma de dotación pedagógica.',
      tiempoEstimadoMin: 10,
    },
  ],
  tareas: [
    {
      id: 'tarea-1',
      numero: 1,
      accion: 'Redactar circular explicativa sobre el valor del juego libre y protección cerebral para familias de Jardín',
      responsable: 'Clara Augusta y Maritza Adriana',
      fechaLimite: '2026-10-28',
      estado: 'en_progreso',
      temaRelacionadoTitulo: 'Ritmo y Protección de Fuerzas Vitales',
    },
    {
      id: 'tarea-2',
      numero: 2,
      accion: 'Preparar materiales y cuadernos de época para Segundo y Tercero',
      responsable: 'Lorena Filomena y Mariuxi Dayana',
      fechaLimite: '2026-10-30',
      estado: 'pendiente',
      temaRelacionadoTitulo: 'Planificación de Épocas de Inmersión',
    },
    {
      id: 'tarea-3',
      numero: 3,
      accion: 'Coordinar la logística de entrega de materiales nobles para las aulas',
      responsable: 'José Luis',
      fechaLimite: '2026-10-26',
      estado: 'pendiente',
      temaRelacionadoTitulo: 'Mantenimiento del Espacio y Huerto',
    },
  ],
  cierre: {
    proximaReunionFecha: '2026-10-29',
    proximaReunionHora: '08:30',
    proximaReunionLugar: 'Campus CENEDIS LunaSol - Sala de la Facultad de Maestros',
    checkOut: 'Ronda de cierre en armonía. La Facultad resalta la congruencia entre la normativa y el bienestar integral de los niños.',
  },
  firmas: {
    facilitadorNombre: 'Maritza Adriana',
    secretarioNombre: 'José Luis',
  },
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
  estado: 'finalizada',
};

export const getSavedActas = (): ActaData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ACTAS);
    if (!raw) {
      return [INITIAL_SAMPLE_ACTA];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_SAMPLE_ACTA];
  } catch (e) {
    console.error('Error loading saved actas:', e);
    return [INITIAL_SAMPLE_ACTA];
  }
};

export const saveActasCollection = (actas: ActaData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_ACTAS, JSON.stringify(actas));
  } catch (e) {
    console.error('Error saving actas:', e);
  }
};

export const saveSingleActa = (acta: ActaData): void => {
  const currentList = getSavedActas();
  const index = currentList.findIndex(a => a.id === acta.id);
  let updatedList: ActaData[];
  
  const actaWithTimestamp = {
    ...acta,
    actualizadoEn: new Date().toISOString(),
  };

  if (index >= 0) {
    updatedList = [...currentList];
    updatedList[index] = actaWithTimestamp;
  } else {
    updatedList = [actaWithTimestamp, ...currentList];
  }

  saveActasCollection(updatedList);
  saveCurrentDraft(actaWithTimestamp);
};

export const deleteActa = (id: string): ActaData[] => {
  const currentList = getSavedActas();
  const filtered = currentList.filter(a => a.id !== id);
  saveActasCollection(filtered);
  return filtered;
};

export const getCurrentDraft = (): ActaData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_DRAFT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Error reading draft:', e);
  }
  return INITIAL_SAMPLE_ACTA;
};

export const saveCurrentDraft = (draft: ActaData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DRAFT, JSON.stringify(draft));
  } catch (e) {
    console.error('Error writing draft:', e);
  }
};

export const getRoster = (): Maestro[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROSTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.some(m => m.nombre === 'Clara Augusta' || m.nombre === 'Maritza Adriana')
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading roster:', e);
  }
  saveRoster(DEFAULT_ROSTER);
  return DEFAULT_ROSTER;
};

export const saveRoster = (roster: Maestro[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster));
  } catch (e) {
    console.error('Error saving roster:', e);
  }
};

export const getPendingTasksFromPriorActas = (currentActaId: string): TareaAccion[] => {
  const allActas = getSavedActas();
  const priorActas = allActas.filter(a => a.id !== currentActaId);
  const pending: TareaAccion[] = [];
  
  priorActas.forEach(acta => {
    acta.tareas.forEach(tarea => {
      if (tarea.estado === 'pendiente' || tarea.estado === 'en_progreso') {
        pending.push({
          ...tarea,
          temaRelacionadoTitulo: tarea.temaRelacionadoTitulo
            ? `${tarea.temaRelacionadoTitulo} (Acta N° ${acta.actaNumero})`
            : `Acta N° ${acta.actaNumero}`,
        });
      }
    });
  });

  return pending;
};
