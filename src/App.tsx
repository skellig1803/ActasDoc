import React, { useState, useEffect } from 'react';
import { ActaData, Maestro } from './types/acta';
import {
  getCurrentDraft,
  saveCurrentDraft,
  getSavedActas,
  saveSingleActa,
  deleteActa,
  getRoster,
  saveRoster,
  createBlankActa,
} from './utils/storage';
import {
  checkIsAuthenticated,
  logoutSession,
  fetchCentralData,
  saveActaToCentral,
  deleteActaFromCentral,
  saveRosterToCentral,
} from './utils/api';
import {
  generatePdfFromElement,
  formatActaForSharing,
  triggerBrowserPrint,
} from './utils/pdfGenerator';
import { Header, ActiveTab } from './components/Header';
import { ActaEditor } from './components/ActaEditor';
import { ActaPrintView } from './components/ActaPrintView';
import { SignaturePadModal } from './components/SignaturePadModal';
import { RosterModal } from './components/RosterModal';
import { ActaHistoryModal } from './components/ActaHistoryModal';
import { SyncDriveModal } from './components/SyncDriveModal';
import { PasswordGate } from './components/PasswordGate';
import { MeetingTimer } from './components/MeetingTimer';
import { CheckCircle2, FileText, Calendar, Clock, MapPin, Plus, X, Cloud } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkIsAuthenticated());

  const [acta, setActa] = useState<ActaData>(() => getCurrentDraft());
  const [roster, setRoster] = useState<Maestro[]>(() => getRoster());
  const [savedActas, setSavedActas] = useState<ActaData[]>(() => getSavedActas());
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isServerSynced, setIsServerSynced] = useState<boolean>(false);

  // Modals state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureRole, setSignatureRole] = useState<'facilitador' | 'secretario'>('facilitador');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isSyncDriveOpen, setIsSyncDriveOpen] = useState(false);
  const [isNewActaModalOpen, setIsNewActaModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with central server on login / load
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const syncData = async () => {
      try {
        const central = await fetchCentralData();
        if (isMounted) {
          if (central.isServerSynced) {
            setIsServerSynced(true);
            if (central.actas.length > 0) {
              setSavedActas(central.actas);
            }
            if (central.roster.length > 0) {
              setRoster(central.roster);
            }
          }
        }
      } catch (e) {
        console.warn('Initial server sync:', e);
      }
    };

    syncData();

    // Periodic sync every 45 seconds to fetch changes from other computers
    const interval = setInterval(syncData, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Auto-save draft on changes locally
  useEffect(() => {
    saveCurrentDraft(acta);
  }, [acta]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleActaChange = (updated: ActaData) => {
    setActa(updated);
  };

  const handleSaveActa = async () => {
    // Save to local storage first
    saveSingleActa(acta);
    setSavedActas(getSavedActas());

    // Sync to central server so other computers see it immediately
    const synced = await saveActaToCentral(acta);
    if (synced) {
      setIsServerSynced(true);
      showToast(`Acta N° ${acta.actaNumero || 'S/N'} guardada y sincronizada en todos los equipos.`);
    } else {
      showToast(`Acta N° ${acta.actaNumero || 'S/N'} guardada localmente.`);
    }
  };

  // Safe in-app modal flow for New Acta
  const handleOpenNewActaModal = () => {
    setIsNewActaModalOpen(true);
  };

  const handleConfirmNewActa = async (saveCurrentFirst: boolean) => {
    if (saveCurrentFirst) {
      saveSingleActa(acta);
      setSavedActas(getSavedActas());
      await saveActaToCentral(acta);
    }

    // Calculate next suggested number
    const currentNum = parseInt(acta.actaNumero.replace(/[^0-9]/g, ''), 10);
    const nextNum = isNaN(currentNum) ? '05' : (currentNum + 1).toString().padStart(2, '0');
    const newActa = createBlankActa(nextNum);
    
    // Carry forward current Facilitator & Secretary preferences
    newActa.facilitador = acta.facilitador || 'Maritza Adriana';
    newActa.secretario = acta.secretario || 'José Luis';
    newActa.lugar = acta.lugar || 'Campus CENEDIS LunaSol - Sala de la Facultad de Maestros';
    newActa.firmas.facilitadorNombre = newActa.facilitador;
    newActa.firmas.secretarioNombre = newActa.secretario;

    setActa(newActa);
    setIsNewActaModalOpen(false);
    setActiveTab('editor');
    showToast(`Nueva Acta N° ${nextNum} iniciada.`);
  };

  const handleSelectHistoryActa = (selected: ActaData) => {
    setActa(selected);
    showToast(`Acta N° ${selected.actaNumero} cargada en pantalla.`);
  };

  const handleDeleteHistoryActa = async (id: string) => {
    const updated = deleteActa(id);
    setSavedActas(updated);
    await deleteActaFromCentral(id);
    showToast('Acta eliminada del archivo central.');
  };

  const handleDuplicateActa = (source: ActaData) => {
    const hoy = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().substring(0, 5);
    const numInt = parseInt(source.actaNumero.replace(/[^0-9]/g, ''), 10);
    const nextNum = isNaN(numInt) ? '05' : (numInt + 1).toString().padStart(2, '0');
    
    const duplicated: ActaData = {
      ...source,
      id: `acta-${Date.now()}`,
      actaNumero: nextNum,
      fecha: hoy,
      horaInicio: hora,
      horaFin: '',
      apertura: {
        checkIn: '',
        informesAvisosBreves: '',
        compromisosAnteriores: `Seguimiento de acuerdos de la reunión N° ${source.actaNumero}`,
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
      firmas: {
        facilitadorNombre: source.firmas.facilitadorNombre || source.facilitador,
        secretarioNombre: source.firmas.secretarioNombre || source.secretario,
      },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      estado: 'borrador',
    };

    setActa(duplicated);
    setIsHistoryOpen(false);
    setActiveTab('editor');
    showToast(`Se ha creado una nueva acta N° ${nextNum} basada en la N° ${source.actaNumero}.`);
  };

  const handleSaveRoster = async (newRoster: Maestro[]) => {
    saveRoster(newRoster);
    setRoster(newRoster);
    await saveRosterToCentral(newRoster);
    showToast('Nómina de docentes actualizada y sincronizada.');
  };

  const handleOpenSignature = (type: 'facilitador' | 'secretario') => {
    setSignatureRole(type);
    setIsSignatureModalOpen(true);
  };

  const handleSaveSignature = (dataUrl: string) => {
    if (signatureRole === 'facilitador') {
      setActa({
        ...acta,
        firmas: {
          ...acta.firmas,
          facilitadorFirmaUrl: dataUrl,
        },
      });
      showToast('Firma digital del Facilitador/a guardada.');
    } else {
      setActa({
        ...acta,
        firmas: {
          ...acta.firmas,
          secretarioFirmaUrl: dataUrl,
        },
      });
      showToast('Firma digital del Secretario/a guardada.');
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generatePdfFromElement('acta-printable-document', acta);
      showToast('Reporte PDF descargado con éxito.');
    } catch (e: any) {
      console.error('Error generando PDF:', e);
      triggerBrowserPrint();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleQuickPrint = () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      setTimeout(() => {
        triggerBrowserPrint();
      }, 250);
    } else {
      triggerBrowserPrint();
    }
  };

  const handleCopyShareText = async () => {
    try {
      const text = formatActaForSharing(acta);
      await navigator.clipboard.writeText(text);
      showToast('Resumen del acta copiado al portapapeles para WhatsApp o correo.');
    } catch (e) {
      console.error('Error copiando texto:', e);
    }
  };

  const handleLockSession = () => {
    logoutSession();
    setIsAuthenticated(false);
    showToast('Sesión bloqueada correctamente.');
  };

  const handleImportDriveSuccess = (imported: { actas: ActaData[]; roster: Maestro[] }) => {
    setSavedActas(imported.actas);
    setRoster(imported.roster);
    if (imported.actas.length > 0) {
      setActa(imported.actas[0]);
    }
    showToast('Base de datos sincronizada desde archivo de Drive.');
  };

  const handleRestoreSuccess = (restored: { actas: ActaData[]; roster: Maestro[]; currentDraft?: ActaData }) => {
    setSavedActas(restored.actas);
    setRoster(restored.roster);
    if (restored.currentDraft) {
      setActa(restored.currentDraft);
    } else if (restored.actas.length > 0) {
      setActa(restored.actas[0]);
    }
    showToast('Base de datos restaurada con éxito al punto anterior.');
  };

  // If user is not yet logged in with password "LunaSol2026", show PasswordGate
  if (!isAuthenticated) {
    return <PasswordGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header with CENEDIS LunaSol identity */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actaNumero={acta.actaNumero}
        onSaveActa={handleSaveActa}
        onNewActa={handleOpenNewActaModal}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onOpenSyncDrive={() => setIsSyncDriveOpen(true)}
        onLockSession={handleLockSession}
        onQuickPrint={handleQuickPrint}
      />

      {/* Meeting Context Bar (unobtrusive status and timer with CENEDIS LunaSol palette) */}
      <div className="no-print bg-white border-b border-emerald-950/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-600 flex-wrap">
            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-700" />
              Acta N° {acta.actaNumero || 'S/N'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-600 font-mono tabular-nums">
              <Calendar className="h-3 w-3 text-emerald-600" />
              {acta.fecha || 'Sin fecha'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-600 font-mono tabular-nums">
              <Clock className="h-3 w-3 text-amber-600" />
              {acta.horaInicio} - {acta.horaFin || 'En curso'}
            </span>
            {acta.lugar && (
              <>
                <span className="text-slate-300 hidden md:inline">|</span>
                <span className="hidden md:flex items-center gap-1 text-slate-600 truncate max-w-sm" title={acta.lugar}>
                  <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                  {acta.lugar}
                </span>
              </>
            )}
            <span className="text-slate-300 hidden lg:inline">|</span>
            <button
              type="button"
              onClick={() => setIsSyncDriveOpen(true)}
              className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/80 cursor-pointer"
            >
              <Cloud className="h-3 w-3 text-emerald-600" />
              <span>Sincronizado multi-equipo</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <MeetingTimer
              horaInicio={acta.horaInicio}
              onSetHoraFin={timeStr => {
                setActa(prev => ({ ...prev, horaFin: timeStr }));
                showToast(`Hora fin fijada a las ${timeStr}`);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'editor' ? (
          <ActaEditor
            acta={acta}
            roster={roster}
            onChange={handleActaChange}
            onOpenRosterModal={() => setIsRosterOpen(true)}
            onOpenSignatureModal={handleOpenSignature}
            onGoToPreview={() => setActiveTab('preview')}
          />
        ) : (
          <ActaPrintView
            acta={acta}
            onBackToEditor={() => setActiveTab('editor')}
            onOpenSignatureModal={handleOpenSignature}
            onExportPdf={handleExportPdf}
            onCopyShareText={handleCopyShareText}
            isGeneratingPdf={isGeneratingPdf}
          />
        )}
      </main>

      {/* In-App Confirmation Modal for "Nueva Acta" */}
      {isNewActaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Crear Nueva Acta</h3>
                  <p className="text-xs text-slate-500">
                    Iniciar un documento limpio para la próxima reunión
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewActaModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-600 space-y-2">
              <p>
                Acta actual en pantalla: <strong>N° {acta.actaNumero || 'S/N'}</strong> ({acta.fecha || 'Sin fecha'}).
              </p>
              <p>
                ¿Desea guardar el acta actual en el archivo central antes de iniciar la nueva?
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleConfirmNewActa(true)}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer text-center"
              >
                Guardar acta actual e iniciar nueva
              </button>
              <button
                type="button"
                onClick={() => handleConfirmNewActa(false)}
                className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center"
              >
                Iniciar nueva sin guardar cambios actuales
              </button>
              <button
                type="button"
                onClick={() => setIsNewActaModalOpen(false)}
                className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 text-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        title={
          signatureRole === 'facilitador'
            ? 'Firma Digital del Facilitador/a'
            : 'Firma Digital del Secretario/a'
        }
        signeeName={
          signatureRole === 'facilitador'
            ? acta.firmas.facilitadorNombre || acta.facilitador
            : acta.firmas.secretarioNombre || acta.secretario
        }
      />

      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        roster={roster}
        onSaveRoster={handleSaveRoster}
      />

      <ActaHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedActas={savedActas}
        currentActaId={acta.id}
        onSelectActa={handleSelectHistoryActa}
        onDeleteActa={handleDeleteHistoryActa}
        onDuplicateActa={handleDuplicateActa}
      />

      <SyncDriveModal
        isOpen={isSyncDriveOpen}
        onClose={() => setIsSyncDriveOpen(false)}
        actas={savedActas}
        roster={roster}
        isServerSynced={isServerSynced}
        onImportSuccess={handleImportDriveSuccess}
        onRestoreSuccess={handleRestoreSuccess}
      />

      {/* Screen Footer (hidden in print) */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-emerald-950">
            CENEDIS LunaSol · Educación para el ser, salud para el futuro
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Acceso Seguro con Contraseña</span>
            <span>·</span>
            <button
              type="button"
              onClick={handleLockSession}
              className="text-emerald-800 hover:underline"
            >
              Bloquear sesión
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
