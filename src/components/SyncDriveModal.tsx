import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  History,
  Plus,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { ActaData, Maestro } from '../types/acta';
import {
  downloadDriveBackupFile,
  parseDriveBackupFile,
  fetchBackupsList,
  createManualBackup,
  restoreBackupById,
  BackupItem,
} from '../utils/api';

interface SyncDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  actas: ActaData[];
  roster: Maestro[];
  isServerSynced: boolean;
  onImportSuccess: (imported: { actas: ActaData[]; roster: Maestro[] }) => void;
  onRestoreSuccess: (restored: { actas: ActaData[]; roster: Maestro[]; currentDraft?: ActaData }) => void;
}

export const SyncDriveModal: React.FC<SyncDriveModalProps> = ({
  isOpen,
  onClose,
  actas,
  roster,
  isServerSynced,
  onImportSuccess,
  onRestoreSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'backups' | 'drive'>('backups');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [newBackupLabel, setNewBackupLabel] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load backups when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const load = async () => {
      setLoadingBackups(true);
      try {
        const list = await fetchBackupsList();
        if (mounted) setBackups(list);
      } catch (e) {
        console.error('Error loading backups:', e);
      } finally {
        if (mounted) setLoadingBackups(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    downloadDriveBackupFile(actas, roster);
    setMessage({
      type: 'success',
      text: 'Archivo descargado. Puede subirlo a la carpeta compartida de Google Drive de CENEDIS LunaSol.',
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const data = await parseDriveBackupFile(file);
      onImportSuccess(data);
      setMessage({
        type: 'success',
        text: `Se importaron exitosamente ${data.actas.length} actas desde el archivo de Drive.`,
      });

      // Refresh backup list since server took a snapshot
      const updated = await fetchBackupsList();
      setBackups(updated);

      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al importar el archivo.',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateManualBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = newBackupLabel.trim() || 'Punto de restauración manual';
    setIsCreatingBackup(true);
    setMessage(null);

    try {
      const res = await createManualBackup(label);
      if (res.success) {
        setBackups(res.backups);
        setNewBackupLabel('');
        setMessage({
          type: 'success',
          text: `Punto de restauración "${label}" creado correctamente.`,
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: 'No se pudo crear la copia de respaldo.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al contactar el servidor.' });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupItem) => {
    const confirmRestore = window.confirm(
      `¿Desea regresar al punto de restauración del ${backup.fechaFormato}?\n\nRazón: ${backup.razon}\nActas incluidas: ${backup.totalActas}\n\n(Se creará automáticamente una copia del estado actual antes de regresar, por seguridad).`
    );

    if (!confirmRestore) return;

    setRestoringId(backup.id);
    setMessage(null);

    try {
      const res = await restoreBackupById(backup.id);
      if (res.success && res.actas) {
        onRestoreSuccess({
          actas: res.actas,
          roster: res.roster || roster,
          currentDraft: res.currentDraft,
        });

        setMessage({
          type: 'success',
          text: `Base de datos restaurada con éxito al punto del ${backup.fechaFormato}.`,
        });

        // Refresh backups list
        const updated = await fetchBackupsList();
        setBackups(updated);

        setTimeout(() => {
          setMessage(null);
          onClose();
        }, 2200);
      } else {
        setMessage({
          type: 'error',
          text: res.error || 'Error al restaurar la copia de respaldo.',
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Error al comunicar con el servidor para restaurar.',
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Puntos de Respaldo y Google Drive
              </h3>
              <p className="text-xs text-slate-500">
                Regrese a un backup previo cuando lo necesite o descargue archivos para Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('backups')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'backups'
                ? 'bg-white text-emerald-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5 text-emerald-700" />
            <span>Puntos de Restauración ({backups.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-white text-emerald-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="h-3.5 w-3.5 text-emerald-700" />
            <span>Google Drive (.json)</span>
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab 1: Puntos de Restauración Previos */}
        {activeTab === 'backups' && (
          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            {/* Create manual snapshot bar */}
            <form
              onSubmit={handleCreateManualBackup}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 shrink-0 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nombre o motivo del respaldo (ej. Antes de modificar temas del bimestre)..."
                value={newBackupLabel}
                onChange={e => setNewBackupLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              <button
                type="submit"
                disabled={isCreatingBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {isCreatingBackup ? 'Guardando...' : 'Crear Punto Ahora'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
              <span>El sistema crea un backup automático cada vez que se guarda o modifica un acta:</span>
            </div>

            {/* Backups List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
              {loadingBackups ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Cargando puntos de restauración...
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Aún no hay respaldos registrados. Cree uno arriba o guarde un acta.
                </div>
              ) : (
                backups.map(b => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200/90 hover:border-emerald-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-emerald-700" />
                          {b.fechaFormato}
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {b.totalActas} acta{b.totalActas !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-1">
                        {b.razon}
                      </p>
                      {b.actaNumeros && b.actaNumeros.length > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Actas incluidas: {b.actaNumeros.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRestoreBackup(b)}
                        disabled={restoringId === b.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Regresar y restaurar toda la base de datos a este momento"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-emerald-700" />
                        {restoringId === b.id ? 'Restaurando...' : 'Regresar a este punto'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Google Drive (.json file export/import) */}
        {activeTab === 'drive' && (
          <div className="mt-4 space-y-3.5 flex-1 overflow-y-auto pr-1">
            {/* Status indicator */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">
                  Servidor Central CENEDIS LunaSol:
                </span>
                <span className="text-emerald-700 font-medium">Activo y sincronizado</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                {actas.length} actas registradas
              </span>
            </div>

            {/* Option A: Download backup file for Google Drive */}
            <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-white">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Download className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">
                    Exportar archivo para Google Drive
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Descargue el archivo de respaldo para guardarlo en la carpeta compartida de Google Drive de la escuela.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar Archivo Compartido (.json)
                  </button>
                </div>
              </div>
            </div>

            {/* Option B: Import from Google Drive / file */}
            <div className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-white">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0 mt-0.5">
                  <Upload className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">
                    Cargar archivo desde Google Drive
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Si se guardó una versión en Google Drive desde otra máquina, selecciónela aquí para actualizar el sistema al instante.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importing}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {importing ? 'Sincronizando...' : 'Seleccionar Archivo de Drive'}
                  </button>
                </div>
              </div>
            </div>

            {/* Information box */}
            <div className="p-3 bg-emerald-950/5 rounded-xl border border-emerald-900/10 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-emerald-950 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Acceso desde cualquier equipo con contraseña:
              </p>
              <p>
                Cualquier maestro puede ingresar desde su computadora o celular escribiendo la contraseña <strong>LunaSol2026</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Seguridad institucional CENEDIS LunaSol
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
