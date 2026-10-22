import { ActaData, Maestro } from '../types/acta';
import { DEFAULT_ROSTER, INITIAL_SAMPLE_ACTA } from './storage';

const AUTH_KEY = 'cenedis_auth_token_v2';
const LOCAL_BACKUPS_KEY = 'cenedis_local_backups_v2';
const FACULTY_PASS_HARDCODED = 'LunaSol2026';

export interface BackupItem {
  id: string;
  timestamp: number;
  fechaFormato: string;
  razon: string;
  totalActas: number;
  actaNumeros?: string[];
}

export const checkIsAuthenticated = (): boolean => {
  try {
    const token = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
    return token === 'cenedis-auth-session-valid';
  } catch (e) {
    return false;
  }
};

export const loginWithPassword = async (
  password: string,
  rememberOnDevice: boolean = true
): Promise<{ success: boolean; error?: string }> => {
  const cleanPass = password.trim();

  // Try server endpoint first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: cleanPass }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        if (rememberOnDevice) {
          localStorage.setItem(AUTH_KEY, data.token || 'cenedis-auth-session-valid');
        } else {
          sessionStorage.setItem(AUTH_KEY, data.token || 'cenedis-auth-session-valid');
        }
        return { success: true };
      }
    }
  } catch (err) {
    console.warn('Backend auth offline, using local password validation:', err);
  }

  // Client-side validation fallback
  if (cleanPass === FACULTY_PASS_HARDCODED) {
    if (rememberOnDevice) {
      localStorage.setItem(AUTH_KEY, 'cenedis-auth-session-valid');
    } else {
      sessionStorage.setItem(AUTH_KEY, 'cenedis-auth-session-valid');
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Contraseña incorrecta. Verifique la clave oficial de la Facultad de Maestros.',
  };
};

export const logoutSession = (): void => {
  try {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
  } catch (e) {
    console.error('Error logging out:', e);
  }
};

// Central Server Data Fetching with LocalStorage Cache
export interface CentralDataResponse {
  actas: ActaData[];
  currentDraft: ActaData;
  roster: Maestro[];
  isServerSynced: boolean;
}

export const fetchCentralData = async (): Promise<CentralDataResponse> => {
  try {
    const res = await fetch('/api/actas', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.actas) && data.actas.length > 0) {
        return {
          actas: data.actas,
          currentDraft: data.currentDraft || data.actas[0],
          roster: Array.isArray(data.roster) && data.roster.length > 0 ? data.roster : DEFAULT_ROSTER,
          isServerSynced: true,
        };
      }
    }
  } catch (err) {
    console.warn('Using local cache (server unreachable):', err);
  }

  return {
    actas: [INITIAL_SAMPLE_ACTA],
    currentDraft: INITIAL_SAMPLE_ACTA,
    roster: DEFAULT_ROSTER,
    isServerSynced: false,
  };
};

export const saveActaToCentral = async (acta: ActaData): Promise<boolean> => {
  try {
    const res = await fetch('/api/actas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acta),
    });
    return res.ok;
  } catch (e) {
    console.warn('Could not sync acta with server, kept in local draft:', e);
    return false;
  }
};

export const deleteActaFromCentral = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/actas/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    console.warn('Could not delete from server:', e);
    return false;
  }
};

export const saveRosterToCentral = async (roster: Maestro[]): Promise<boolean> => {
  try {
    const res = await fetch('/api/roster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roster }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Could not sync roster to server:', e);
    return false;
  }
};

// Backups API
export const fetchBackupsList = async (): Promise<BackupItem[]> => {
  try {
    const res = await fetch('/api/backups', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.backups)) {
        return data.backups;
      }
    }
  } catch (err) {
    console.warn('Could not fetch server backups list:', err);
  }

  // Fallback to local storage backup list
  try {
    const local = localStorage.getItem(LOCAL_BACKUPS_KEY);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.error('Error reading local backups:', e);
  }

  return [];
};

export const createManualBackup = async (label: string): Promise<{ success: boolean; backups: BackupItem[] }> => {
  try {
    const res = await fetch('/api/backups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, backups: data.backups || [] };
    }
  } catch (err) {
    console.warn('Server manual backup failed:', err);
  }

  return { success: false, backups: [] };
};

export const restoreBackupById = async (
  id: string
): Promise<{ success: boolean; actas?: ActaData[]; roster?: Maestro[]; currentDraft?: ActaData; error?: string }> => {
  try {
    const res = await fetch(`/api/backups/restore/${id}`, {
      method: 'POST',
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        actas: data.actas,
        roster: data.roster,
        currentDraft: data.currentDraft,
      };
    } else {
      const err = await res.json();
      return { success: false, error: err.error || 'No se pudo restaurar el backup' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de conexión al restaurar' };
  }
};

// Google Drive / JSON export file generator
export const downloadDriveBackupFile = (actas: ActaData[], roster: Maestro[]) => {
  const payload = {
    institucion: 'CENEDIS LunaSol',
    descripcion: 'Respaldo Compartido de Actas de Reunión de la Facultad de Maestros',
    version: '2.0',
    fechaExportacion: new Date().toISOString(),
    actas,
    roster,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `CENEDIS_LunaSol_Actas_Drive_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import file from Google Drive or local device
export const parseDriveBackupFile = async (
  file: File
): Promise<{ actas: ActaData[]; roster: Maestro[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const data = parsed.data || parsed;

        if (!Array.isArray(data.actas)) {
          throw new Error('El archivo no contiene un listado de actas válido');
        }

        // Sync with server as well
        try {
          await fetch('/api/sync/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ importedData: data }),
          });
        } catch (serverErr) {
          console.warn('Could not push imported data to server:', serverErr);
        }

        resolve({
          actas: data.actas,
          roster: Array.isArray(data.roster) ? data.roster : DEFAULT_ROSTER,
        });
      } catch (err: any) {
        reject(new Error(err.message || 'Error al procesar el archivo JSON'));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsText(file);
  });
};
