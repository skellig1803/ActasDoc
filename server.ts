import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'cenedis_actas_db.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Ensure data and backup directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initial default faculty roster
const DEFAULT_ROSTER = [
  { id: '1', nombre: 'Clara Augusta', areaCargo: 'Jardín' },
  { id: '2', nombre: 'Maritza Adriana', areaCargo: 'Rectora, Jardín' },
  { id: '3', nombre: 'Lorena Filomena', areaCargo: 'Segundo' },
  { id: '4', nombre: 'Mariuxi Dayana', areaCargo: 'Tercero' },
  { id: '5', nombre: 'Layla Gioana', areaCargo: 'Cuarto' },
  { id: '6', nombre: 'Priscila Isabel', areaCargo: 'Quinto' },
  { id: '7', nombre: 'Lisseth Odalis', areaCargo: 'Séptimo' },
  { id: '8', nombre: 'José Luis', areaCargo: 'Coordinación Administrativa' },
];

const INITIAL_ACTA = {
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

const getDatabase = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  const initialDb = {
    actas: [INITIAL_ACTA],
    currentDraft: INITIAL_ACTA,
    roster: DEFAULT_ROSTER,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    // Also create initial genesis backup
    createBackupSnapshot('Estado inicial de la aplicación');
  } catch (err) {
    console.error('Error creating database file:', err);
  }

  return initialDb;
};

// Snapshot backup creator
const createBackupSnapshot = (reason: string = 'Respaldo automático') => {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);

    const timestamp = Date.now();
    const id = `snap-${timestamp}`;
    const dateObj = new Date();
    const fechaFormato = `${dateObj.toLocaleDateString('es-ES')} ${dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

    const backupPayload = {
      id,
      timestamp,
      fechaFormato,
      razon: reason,
      totalActas: (parsed.actas || []).length,
      actaNumeros: (parsed.actas || []).map((a: any) => a.actaNumero).filter(Boolean),
      data: parsed,
    };

    const filePath = path.join(BACKUP_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(backupPayload, null, 2), 'utf-8');

    // Keep maximum 30 backup files (purge oldest)
    cleanOldBackups(30);

    return backupPayload;
  } catch (err) {
    console.error('Error creating backup snapshot:', err);
    return null;
  }
};

const cleanOldBackups = (maxCount: number = 30) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('snap-') && f.endsWith('.json'));
    if (files.length <= maxCount) return;

    // Sort by timestamp asc
    files.sort((a, b) => {
      const timeA = parseInt(a.replace('snap-', '').replace('.json', ''), 10) || 0;
      const timeB = parseInt(b.replace('snap-', '').replace('.json', ''), 10) || 0;
      return timeA - timeB;
    });

    const toRemove = files.slice(0, files.length - maxCount);
    for (const f of toRemove) {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
    }
  } catch (e) {
    console.warn('Error purging old backups:', e);
  }
};

const listBackupSnapshots = () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('snap-') && f.endsWith('.json'));

    const list: any[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(BACKUP_DIR, file), 'utf-8');
        const parsed = JSON.parse(raw);
        list.push({
          id: parsed.id || file.replace('.json', ''),
          timestamp: parsed.timestamp || 0,
          fechaFormato: parsed.fechaFormato || 'Fecha no disponible',
          razon: parsed.razon || 'Respaldo previo',
          totalActas: parsed.totalActas || (parsed.data?.actas?.length || 0),
          actaNumeros: parsed.actaNumeros || [],
        });
      } catch (readErr) {
        // Skip corrupted file
      }
    }

    // Sort newest first
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  } catch (err) {
    console.error('Error listing backups:', err);
    return [];
  }
};

const saveDatabase = (data: any, backupReason?: string) => {
  try {
    // Automatically save a snapshot BEFORE overwriting if a reason is provided
    if (backupReason) {
      createBackupSnapshot(backupReason);
    }

    const updated = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
};

// Middleware
app.use(express.json({ limit: '20mb' }));

// Auth verification endpoint
const FACULTY_PASSWORD = 'LunaSol2026';

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  if (password.trim() === FACULTY_PASSWORD) {
    return res.json({
      success: true,
      token: 'cenedis-auth-session-valid',
      message: 'Acceso autorizado a la Facultad de Maestros',
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Contraseña incorrecta. Solo docentes autorizados de CENEDIS LunaSol.',
  });
});

// Central shared Database API endpoints
app.get('/api/actas', (req, res) => {
  const db = getDatabase();
  res.json({
    actas: db.actas || [],
    currentDraft: db.currentDraft || INITIAL_ACTA,
    roster: db.roster || DEFAULT_ROSTER,
    lastUpdated: db.lastUpdated || new Date().toISOString(),
  });
});

app.post('/api/actas', (req, res) => {
  const newActa = req.body;
  if (!newActa || !newActa.id) {
    return res.status(400).json({ error: 'Datos de acta inválidos' });
  }

  const db = getDatabase();
  const index = (db.actas || []).findIndex((a: any) => a.id === newActa.id);
  let updatedList = [...(db.actas || [])];

  const withTimestamp = {
    ...newActa,
    actualizadoEn: new Date().toISOString(),
  };

  if (index >= 0) {
    updatedList[index] = withTimestamp;
  } else {
    updatedList = [withTimestamp, ...updatedList];
  }

  db.actas = updatedList;
  db.currentDraft = withTimestamp;

  // Auto-backup before saving
  const reason = `Previo a guardar Acta N° ${newActa.actaNumero || 'S/N'}`;
  saveDatabase(db, reason);

  res.json({ success: true, actas: db.actas, currentDraft: db.currentDraft });
});

app.delete('/api/actas/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const deletedActa = (db.actas || []).find((a: any) => a.id === id);
  const reason = `Previo a eliminar Acta N° ${deletedActa?.actaNumero || id}`;
  
  db.actas = (db.actas || []).filter((a: any) => a.id !== id);
  saveDatabase(db, reason);

  res.json({ success: true, actas: db.actas });
});

app.post('/api/draft', (req, res) => {
  const draft = req.body;
  const db = getDatabase();
  db.currentDraft = {
    ...draft,
    actualizadoEn: new Date().toISOString(),
  };
  saveDatabase(db);
  res.json({ success: true, currentDraft: db.currentDraft });
});

app.post('/api/roster', (req, res) => {
  const { roster } = req.body;
  if (!Array.isArray(roster)) {
    return res.status(400).json({ error: 'Nómina inválida' });
  }
  const db = getDatabase();
  db.roster = roster;
  saveDatabase(db, 'Previo a actualizar nómina docente');
  res.json({ success: true, roster: db.roster });
});

// Snapshot Backups Endpoints
app.get('/api/backups', (req, res) => {
  const backups = listBackupSnapshots();
  res.json({ backups });
});

app.post('/api/backups/create', (req, res) => {
  const { label } = req.body;
  const reason = label?.trim() || 'Punto de restauración manual';
  const snapshot = createBackupSnapshot(reason);

  if (snapshot) {
    res.json({ success: true, snapshot, backups: listBackupSnapshots() });
  } else {
    res.status(500).json({ error: 'No se pudo crear la copia de seguridad' });
  }
});

app.post('/api/backups/restore/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(BACKUP_DIR, `${id}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Copia de seguridad no encontrada' });
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const backupContent = JSON.parse(raw);
    const restoredData = backupContent.data;

    if (!restoredData || !Array.isArray(restoredData.actas)) {
      return res.status(400).json({ error: 'Formato de copia de seguridad inválido' });
    }

    // Safety: Create a snapshot of current state before reverting!
    createBackupSnapshot(`Punto de seguridad previo a restaurar copia del ${backupContent.fechaFormato}`);

    // Revert database
    fs.writeFileSync(DATA_FILE, JSON.stringify(restoredData, null, 2), 'utf-8');

    res.json({
      success: true,
      message: `Restaurado con éxito al punto: ${backupContent.fechaFormato}`,
      actas: restoredData.actas,
      roster: restoredData.roster || DEFAULT_ROSTER,
      currentDraft: restoredData.currentDraft || restoredData.actas[0],
      backups: listBackupSnapshots(),
    });
  } catch (err: any) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: err.message || 'Error al restaurar la copia' });
  }
});

// Google Drive / Cloud Sync backup export & import
app.get('/api/sync/export', (req, res) => {
  const db = getDatabase();
  const exportPayload = {
    exportDate: new Date().toISOString(),
    institution: 'CENEDIS LunaSol',
    version: '2.0',
    data: db,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="CENEDIS_LunaSol_Actas_Drive_${new Date().toISOString().split('T')[0]}.json"`
  );
  res.send(JSON.stringify(exportPayload, null, 2));
});

app.post('/api/sync/import', (req, res) => {
  const { importedData } = req.body;
  if (!importedData || (!importedData.actas && !importedData.data)) {
    return res.status(400).json({ error: 'Formato de archivo no válido para CENEDIS LunaSol' });
  }

  // Backup current state before importing!
  createBackupSnapshot('Previo a importar archivo externo de Google Drive');

  const payload = importedData.data ? importedData.data : importedData;
  const db = getDatabase();

  if (Array.isArray(payload.actas) && payload.actas.length > 0) {
    db.actas = payload.actas;
  }
  if (Array.isArray(payload.roster) && payload.roster.length > 0) {
    db.roster = payload.roster;
  }
  if (payload.currentDraft) {
    db.currentDraft = payload.currentDraft;
  }

  saveDatabase(db);
  res.json({
    success: true,
    message: 'Base de datos sincronizada exitosamente',
    actas: db.actas,
    roster: db.roster,
    currentDraft: db.currentDraft,
  });
});

// Vite mounting
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
