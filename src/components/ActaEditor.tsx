import React, { useState } from 'react';
import {
  ActaData,
  TemaAgenda,
  TareaAccion,
  TipoTema,
  EstadoTarea,
  Maestro,
} from '../types/acta';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  UserX,
  FileCheck2,
  MapPin,
  Building2,
  UserCheck,
} from 'lucide-react';
import { getPendingTasksFromPriorActas } from '../utils/storage';

interface ActaEditorProps {
  acta: ActaData;
  roster: Maestro[];
  onChange: (updated: ActaData) => void;
  onOpenRosterModal: () => void;
  onOpenSignatureModal: (type: 'facilitador' | 'secretario') => void;
  onGoToPreview: () => void;
}

export const ActaEditor: React.FC<ActaEditorProps> = ({
  acta,
  roster,
  onChange,
  onOpenRosterModal,
  onOpenSignatureModal,
  onGoToPreview,
}) => {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // Field change helpers - single, atomic state updates to prevent race conditions
  const handleGeneralChange = (field: keyof ActaData, value: any) => {
    onChange({
      ...acta,
      [field]: value,
    });
  };

  const handleFacilitadorChange = (nombre: string) => {
    onChange({
      ...acta,
      facilitador: nombre,
      firmas: {
        ...acta.firmas,
        facilitadorNombre: nombre,
      },
    });
  };

  const handleSecretarioChange = (nombre: string) => {
    onChange({
      ...acta,
      secretario: nombre,
      firmas: {
        ...acta.firmas,
        secretarioNombre: nombre,
      },
    });
  };

  const handleAperturaChange = (field: keyof ActaData['apertura'], value: string) => {
    onChange({
      ...acta,
      apertura: {
        ...acta.apertura,
        [field]: value,
      },
    });
  };

  const handleCierreChange = (field: keyof ActaData['cierre'], value: string) => {
    onChange({
      ...acta,
      cierre: {
        ...acta.cierre,
        [field]: value,
      },
    });
  };

  // Toggle absentee from roster
  const toggleAusente = (maestroNombre: string) => {
    const isAbsent = acta.ausentes.includes(maestroNombre);
    let newAusentes: string[];
    if (isAbsent) {
      newAusentes = acta.ausentes.filter(name => name !== maestroNombre);
    } else {
      newAusentes = [...acta.ausentes, maestroNombre];
    }
    handleGeneralChange('ausentes', newAusentes);
  };

  // Import prior pending commitments
  const handleImportPendingTasks = () => {
    const pending = getPendingTasksFromPriorActas(acta.id);
    if (pending.length === 0) {
      setPendingNotice('No se encontraron tareas pendientes en las actas anteriores.');
      setTimeout(() => setPendingNotice(null), 4000);
      return;
    }

    const formatted = pending
      .map(
        t =>
          `• ${t.accion} (Responsable: ${t.responsable} | Vence: ${t.fechaLimite || 'Sin fecha'} | Estado: ${t.estado})`
      )
      .join('\n');

    const currentText = acta.apertura.compromisosAnteriores.trim();
    const updatedText = currentText
      ? `${currentText}\n\n[Compromisos pendientes importados]:\n${formatted}`
      : `Compromisos pendientes de sesiones anteriores:\n${formatted}`;

    handleAperturaChange('compromisosAnteriores', updatedText);
    setPendingNotice(`Se importaron ${pending.length} tareas pendientes.`);
    setTimeout(() => setPendingNotice(null), 4000);
  };

  // Topic management
  const handleAddTema = () => {
    const newNumero = acta.temas.length + 1;
    const newTema: TemaAgenda = {
      id: `tema-${Date.now()}`,
      numero: newNumero,
      tema: '',
      traidoPor: '',
      tipo: 'informe',
      desarrollo: '',
      resolucion: '',
      tiempoEstimadoMin: 15,
    };
    onChange({
      ...acta,
      temas: [...acta.temas, newTema],
    });
  };

  const handleUpdateTema = (index: number, field: keyof TemaAgenda, value: any) => {
    const updated = [...acta.temas];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({
      ...acta,
      temas: updated,
    });
  };

  const handleRemoveTema = (index: number) => {
    if (acta.temas.length <= 1) {
      alert('El acta debe contener al menos 1 tema.');
      return;
    }
    const updated = acta.temas.filter((_, i) => i !== index).map((t, i) => ({ ...t, numero: i + 1 }));
    onChange({
      ...acta,
      temas: updated,
    });
  };

  const handleMoveTema = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= acta.temas.length) return;

    const list = [...acta.temas];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    const renumbered = list.map((t, idx) => ({ ...t, numero: idx + 1 }));

    onChange({
      ...acta,
      temas: renumbered,
    });
  };

  // Convert topic resolution to action task directly
  const handleConvertResolutionToTask = (tema: TemaAgenda) => {
    if (!tema.resolucion.trim()) {
      alert('Por favor ingrese una Resolución o Acuerdo en el tema primero.');
      return;
    }

    const newTask: TareaAccion = {
      id: `tarea-${Date.now()}`,
      numero: acta.tareas.length + 1,
      accion: tema.resolucion.trim(),
      responsable: tema.traidoPor || acta.facilitador || 'Facultad de Maestros',
      fechaLimite: acta.cierre.proximaReunionFecha || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      estado: 'pendiente',
      temaRelacionadoId: tema.id,
      temaRelacionadoTitulo: tema.tema || `Tema #${tema.numero}`,
    };

    onChange({
      ...acta,
      tareas: [...acta.tareas, newTask],
    });

    setPendingNotice(`Se agregó la tarea al Plan de Acción para "${tema.tema || 'Tema #' + tema.numero}".`);
    setTimeout(() => setPendingNotice(null), 4000);
  };

  // Task management
  const handleAddTask = () => {
    const newTask: TareaAccion = {
      id: `tarea-${Date.now()}`,
      numero: acta.tareas.length + 1,
      accion: '',
      responsable: '',
      fechaLimite: '',
      estado: 'pendiente',
    };
    onChange({
      ...acta,
      tareas: [...acta.tareas, newTask],
    });
  };

  const handleUpdateTask = (index: number, field: keyof TareaAccion, value: any) => {
    const updated = [...acta.tareas];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange({
      ...acta,
      tareas: updated,
    });
  };

  const handleRemoveTask = (index: number) => {
    const updated = acta.tareas.filter((_, i) => i !== index).map((t, i) => ({ ...t, numero: i + 1 }));
    onChange({
      ...acta,
      tareas: updated,
    });
  };

  const setCurrentTime = (field: 'horaInicio' | 'horaFin') => {
    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    handleGeneralChange(field, timeStr);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {pendingNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{pendingNotice}</span>
        </div>
      )}

      {/* 1. DATOS GENERALES Y ROLES */}
      <div className="bg-white rounded-xl border border-emerald-900/10 overflow-hidden shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setActiveSection(activeSection === 1 ? 0 : 1)}
          className="w-full flex items-center justify-between p-4 bg-emerald-50/40 hover:bg-emerald-50/70 border-b border-emerald-900/10 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-bold text-white font-mono">
              1
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Datos Generales y Roles
              </h2>
              <p className="text-xs text-slate-500">
                Institución, ubicación, fecha, horas, número de acta, facilitador, secretario y registro de ausencias
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 font-medium hidden sm:inline">
              Acta N° {acta.actaNumero || '—'} · {acta.ausentes.length} ausentes
            </span>
            {activeSection === 1 ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        {activeSection === 1 && (
          <div className="p-5 space-y-5">
            {/* Institution and Subtitle (Preloaded with CENEDIS LunaSol) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institución / Unidad Educativa
                </label>
                <div className="relative">
                  <Building2 className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={acta.institucion}
                    onChange={e => handleGeneralChange('institucion', e.target.value)}
                    placeholder="Ej. CENEDIS LunaSol"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtítulo / Filosofía Institucional
                </label>
                <input
                  type="text"
                  value={acta.subtitulo}
                  onChange={e => handleGeneralChange('subtitulo', e.target.value)}
                  placeholder="Ej. Educación para el ser, salud para el futuro · Facultad de Maestros"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Ubicación / Lugar (EXPLICITLY EDITABLE AS REQUESTED) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Lugar / Ubicación de la reunión</span>
                <span className="text-[11px] text-emerald-700 font-normal">
                  (Editable)
                </span>
              </label>
              <div className="relative">
                <MapPin className="h-4 w-4 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={acta.lugar || ''}
                  onChange={e => handleGeneralChange('lugar', e.target.value)}
                  placeholder="Ej. Campus CENEDIS LunaSol - Sala de la Facultad de Maestros / Huerto"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>
              {/* Quick location presets */}
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                <span className="text-[10px] text-slate-400">Sugerencias:</span>
                <button
                  type="button"
                  onClick={() => handleGeneralChange('lugar', 'Campus CENEDIS LunaSol - Sala de la Facultad de Maestros')}
                  className="text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  Sala de Maestros
                </button>
                <button
                  type="button"
                  onClick={() => handleGeneralChange('lugar', 'Campus CENEDIS LunaSol - Área del Huerto Escolar')}
                  className="text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  Huerto Escolar
                </button>
                <button
                  type="button"
                  onClick={() => handleGeneralChange('lugar', 'Campus CENEDIS LunaSol - Jardín de Infancia')}
                  className="text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  Jardín de Infancia
                </button>
                <button
                  type="button"
                  onClick={() => handleGeneralChange('lugar', 'Sesión Virtual / Videoconferencia')}
                  className="text-slate-600 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  Virtual
                </button>
              </div>
            </div>

            {/* Date, Times & Acta Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha (DD/MM/AAAA)
                </label>
                <input
                  type="date"
                  value={acta.fecha}
                  onChange={e => handleGeneralChange('fecha', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Hora inicio</label>
                  <button
                    type="button"
                    onClick={() => setCurrentTime('horaInicio')}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium underline"
                  >
                    Ahora
                  </button>
                </div>
                <input
                  type="time"
                  value={acta.horaInicio}
                  onChange={e => handleGeneralChange('horaInicio', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Hora fin</label>
                  <button
                    type="button"
                    onClick={() => setCurrentTime('horaFin')}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-medium underline"
                  >
                    Ahora
                  </button>
                </div>
                <input
                  type="time"
                  value={acta.horaFin}
                  onChange={e => handleGeneralChange('horaFin', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Acta N°</label>
                <input
                  type="text"
                  value={acta.actaNumero}
                  onChange={e => handleGeneralChange('actaNumero', e.target.value)}
                  placeholder="04-2026"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Roles: Facilitador & Secretario (FIXED & MADE ULTRA EDITABLE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Facilitador */}
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Facilitador/a
                  </label>
                  <span className="text-[10px] text-slate-500">Modera la reunión</span>
                </div>

                {/* Direct text input */}
                <input
                  type="text"
                  value={acta.facilitador}
                  onChange={e => handleFacilitadorChange(e.target.value)}
                  placeholder="Escriba el nombre del facilitador/a..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />

                {/* Quick dropdown select from roster */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 shrink-0">O elegir:</span>
                  <select
                    value={roster.some(m => m.nombre === acta.facilitador) ? acta.facilitador : ''}
                    onChange={e => {
                      if (e.target.value) handleFacilitadorChange(e.target.value);
                    }}
                    className="w-full text-[11px] py-1 px-2 bg-white border border-slate-200 rounded text-slate-600 focus:outline-none"
                  >
                    <option value="">Seleccionar maestro/a de la Facultad...</option>
                    {roster.map(m => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} ({m.areaCargo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secretario */}
              <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Secretario/a
                  </label>
                  <span className="text-[10px] text-slate-500">Redacta el acta</span>
                </div>

                {/* Direct text input */}
                <input
                  type="text"
                  value={acta.secretario}
                  onChange={e => handleSecretarioChange(e.target.value)}
                  placeholder="Escriba el nombre del secretario/a..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />

                {/* Quick dropdown select from roster */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 shrink-0">O elegir:</span>
                  <select
                    value={roster.some(m => m.nombre === acta.secretario) ? acta.secretario : ''}
                    onChange={e => {
                      if (e.target.value) handleSecretarioChange(e.target.value);
                    }}
                    className="w-full text-[11px] py-1 px-2 bg-white border border-slate-200 rounded text-slate-600 focus:outline-none"
                  >
                    <option value="">Seleccionar maestro/a de la Facultad...</option>
                    {roster.map(m => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} ({m.areaCargo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ausentes - Quick Click Checklist */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <UserX className="h-4 w-4 text-rose-600" />
                    <label className="text-xs font-bold text-slate-800">
                      Ausentes: (Solo anotar quién faltó de la Facultad obligatoria)
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Haga clic sobre un maestro para alternar su estado. Los marcados en rojo se registran como ausentes en el documento final.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenRosterModal}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-emerald-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md transition-colors"
                >
                  <Users className="h-3 w-3 text-emerald-700" />
                  Editar Plantel ({roster.length})
                </button>
              </div>

              {/* Roster quick click badges */}
              <div className="flex flex-wrap gap-1.5 my-2">
                {roster.map(teacher => {
                  const isAbsent = acta.ausentes.includes(teacher.nombre);
                  return (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => toggleAusente(teacher.nombre)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer border ${
                        isAbsent
                          ? 'bg-rose-100 border-rose-300 text-rose-800 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isAbsent ? 'Clic para desmarcar (Presente)' : 'Clic para marcar como AUSENTE'}
                    >
                      <span>{teacher.nombre}</span>
                      {isAbsent ? (
                        <span className="text-[10px] font-bold text-rose-600 ml-0.5">✕ Falta</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 ml-0.5">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Absent notes & custom absentees */}
              <div className="mt-2.5">
                <input
                  type="text"
                  value={acta.ausentesNotas || ''}
                  onChange={e => handleGeneralChange('ausentesNotas', e.target.value)}
                  placeholder="Justificaciones o notas de ausencia (ej. Con reposo médico, permiso o comisión pedagógica)"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Invitados */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invitados: (Asistencia esporádica de psicopedagogos, terapeutas, médicos escolares o representantes de familias)
              </label>
              <input
                type="text"
                value={acta.invitados}
                onChange={e => handleGeneralChange('invitados', e.target.value)}
                placeholder="Ej. Lic. Claudia Paredes (Pedagogía Curativa), Dr. Manuel Rivas (Médico Escolar)"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. APERTURA (10 - 15 min) */}
      <div className="bg-white rounded-xl border border-emerald-900/10 overflow-hidden shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setActiveSection(activeSection === 2 ? 0 : 2)}
          className="w-full flex items-center justify-between p-4 bg-emerald-50/40 hover:bg-emerald-50/70 border-b border-emerald-900/10 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-bold text-white font-mono">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Apertura (10 - 15 min)
              </h2>
              <p className="text-xs text-slate-500">
                Check-in de llegada, informes y avisos breves, revisión de compromisos anteriores
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSection === 2 ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        {activeSection === 2 && (
          <div className="p-5 space-y-4">
            {/* Check-in */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Check-in: Ronda rápida de llegada
              </label>
              <textarea
                rows={2}
                value={acta.apertura.checkIn}
                onChange={e => handleAperturaChange('checkIn', e.target.value)}
                placeholder="Disposición anímica de la Facultad al iniciar, armonización inicial..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed"
              />
            </div>

            {/* Informes y avisos breves */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Informes y avisos breves: <span className="font-normal text-slate-500">(Avisos rápidos que no requieren debate)</span>
              </label>
              <textarea
                rows={2}
                value={acta.apertura.informesAvisosBreves}
                onChange={e => handleAperturaChange('informesAvisosBreves', e.target.value)}
                placeholder="• Avisos administrativos, eventos del calendario de festividades, notas breves..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed font-mono text-[11px]"
              />
            </div>

            {/* Revisión de compromisos anteriores */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="text-xs font-semibold text-slate-800">
                  Revisión de compromisos anteriores: <span className="font-normal text-slate-500">(¿Quedó alguna tarea pendiente de la reunión pasada?)</span>
                </label>
                <button
                  type="button"
                  onClick={handleImportPendingTasks}
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md transition-colors shadow-2xs cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  Importar pendientes de actas anteriores
                </button>
              </div>
              <textarea
                rows={3}
                value={acta.apertura.compromisosAnteriores}
                onChange={e => handleAperturaChange('compromisosAnteriores', e.target.value)}
                placeholder="Estado de las tareas acordadas en la sesión previa..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed font-mono text-[11px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. TRATAMIENTO DE TEMAS DE LA AGENDA */}
      <div className="bg-white rounded-xl border border-emerald-900/10 overflow-hidden shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setActiveSection(activeSection === 3 ? 0 : 3)}
          className="w-full flex items-center justify-between p-4 bg-emerald-50/40 hover:bg-emerald-50/70 border-b border-emerald-900/10 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-bold text-white font-mono">
              3
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                3. Tratamiento de Temas de la Agenda
              </h2>
              <p className="text-xs text-slate-500">
                Informes, Exploraciones y Decisiones tratadas durante la sesión ({acta.temas.length} tema{acta.temas.length > 1 ? 's' : ''})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 font-medium hidden sm:inline">
              {acta.temas.length} tema{acta.temas.length > 1 ? 's' : ''} registrado{acta.temas.length > 1 ? 's' : ''}
            </span>
            {activeSection === 3 ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        {activeSection === 3 && (
          <div className="p-5 space-y-6">
            {/* Legend about topic types */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <span className="font-bold text-sky-700 shrink-0">• Informe:</span>
                <span className="text-[11px] text-slate-600 leading-snug">
                  Comunicación unidireccional (no requiere debate).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-700 shrink-0">• Exploración:</span>
                <span className="text-[11px] text-slate-600 leading-snug">
                  Lluvia de ideas, recolección de perspectivas o diagnóstico.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-700 shrink-0">• Decisión:</span>
                <span className="text-[11px] text-slate-600 leading-snug">
                  Propuesta concreta que requiere acuerdo / consentimiento.
                </span>
              </div>
            </div>

            {/* List of Topics */}
            <div className="space-y-5">
              {acta.temas.map((tema, index) => (
                <div
                  key={tema.id}
                  className="border border-slate-200 rounded-xl p-4 bg-white hover:border-emerald-300 transition-all shadow-2xs space-y-3.5"
                >
                  {/* Header of Topic */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {tema.tema || 'Nuevo Tema sin título'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveTema(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded transition-colors"
                        title="Subir tema"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveTema(index, 'down')}
                        disabled={index === acta.temas.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded transition-colors"
                        title="Bajar tema"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveTema(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors ml-1"
                        title="Eliminar este tema"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Topic Title & Presenter */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-7">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tema / Asunto
                      </label>
                      <input
                        type="text"
                        value={tema.tema}
                        onChange={e => handleUpdateTema(index, 'tema', e.target.value)}
                        placeholder="Ej. Planificación de la Época de Inmersión"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Traído por: <span className="font-normal text-slate-500">(Persona o comisión)</span>
                      </label>
                      <input
                        type="text"
                        value={tema.traidoPor}
                        onChange={e => handleUpdateTema(index, 'traidoPor', e.target.value)}
                        list="roster-presenter"
                        placeholder="Ej. Prof. Gabriel Torres (Huerto)"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <datalist id="roster-presenter">
                        {roster.map(m => (
                          <option key={m.id} value={`${m.nombre} (${m.areaCargo})`} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Topic Type Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Tipo de Tema:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <label
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          tema.tipo === 'informe'
                            ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`tipo-tema-${tema.id}`}
                          checked={tema.tipo === 'informe'}
                          onChange={() => handleUpdateTema(index, 'tipo', 'informe')}
                          className="sr-only"
                        />
                        <span>[ {tema.tipo === 'informe' ? '●' : '○'} ] Informe</span>
                      </label>

                      <label
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          tema.tipo === 'exploracion'
                            ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`tipo-tema-${tema.id}`}
                          checked={tema.tipo === 'exploracion'}
                          onChange={() => handleUpdateTema(index, 'tipo', 'exploracion')}
                          className="sr-only"
                        />
                        <span>[ {tema.tipo === 'exploracion' ? '●' : '○'} ] Exploración</span>
                      </label>

                      <label
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          tema.tipo === 'decision'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`tipo-tema-${tema.id}`}
                          checked={tema.tipo === 'decision'}
                          onChange={() => handleUpdateTema(index, 'tipo', 'decision')}
                          className="sr-only"
                        />
                        <span>[ {tema.tipo === 'decision' ? '●' : '○'} ] Decisión</span>
                      </label>
                    </div>
                  </div>

                  {/* Registro y Desarrollo */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Registro y Desarrollo <span className="font-normal text-slate-500">(Lo conversado, argumentos y puntos clave)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={tema.desarrollo}
                      onChange={e => handleUpdateTema(index, 'desarrollo', e.target.value)}
                      placeholder="Redacte aquí las reflexiones del claustro, análisis pedagógico y puntos acordados..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed"
                    />
                  </div>

                  {/* Resolución / Decisión / Acuerdo */}
                  <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-800/15">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                      <label className="text-[11px] font-bold text-emerald-950">
                        Resolución / Decisión / Acuerdo
                      </label>
                      {tema.resolucion && (
                        <button
                          type="button"
                          onClick={() => handleConvertResolutionToTask(tema)}
                          className="flex items-center gap-1 text-[10px] font-medium text-emerald-900 hover:text-emerald-950 bg-white border border-emerald-300 px-2 py-0.5 rounded transition-colors shadow-2xs cursor-pointer"
                          title="Crea automáticamente una fila en el Plan de Acción con este acuerdo"
                        >
                          <ArrowRight className="h-3 w-3 text-emerald-700" />
                          + Convertir en Tarea del Plan de Acción
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={tema.resolucion}
                      onChange={e => handleUpdateTema(index, 'resolucion', e.target.value)}
                      placeholder="Resolución adoptada por consenso o acuerdo vinculante de la Facultad..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Topic Button */}
            <button
              type="button"
              onClick={handleAddTema}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-medium text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100/60 border border-dashed border-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4 text-emerald-700" />
              Añadir Otro Tema a la Agenda
            </button>
          </div>
        )}
      </div>

      {/* 4. PLAN DE ACCIÓN Y TAREAS ASIGNADAS (REMOVED "(Nuevo)") */}
      <div className="bg-white rounded-xl border border-emerald-900/10 overflow-hidden shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setActiveSection(activeSection === 4 ? 0 : 4)}
          className="w-full flex items-center justify-between p-4 bg-emerald-50/40 hover:bg-emerald-50/70 border-b border-emerald-900/10 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-bold text-white font-mono">
              4
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                4. Plan de Acción y Tareas Asignadas
              </h2>
              <p className="text-xs text-slate-500">
                Todo acuerdo que implique trabajo posterior para dar seguimiento en la próxima sesión
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 font-medium hidden sm:inline">
              {acta.tareas.length} tarea{acta.tareas.length > 1 ? 's' : ''} asignada{acta.tareas.length > 1 ? 's' : ''}
            </span>
            {activeSection === 4 ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        {activeSection === 4 && (
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800">Seguimiento pedagógico:</span> Los acuerdos registrados aquí se guardan con su responsable y fecha límite de entrega para dar continuidad en la apertura de la siguiente reunión.
            </div>

            {/* Tasks list */}
            {acta.tareas.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                <FileCheck2 className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500">Aún no se han asignado tareas posteriores.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Haga clic abajo o use el botón "Convertir en Tarea" en los temas de agenda.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {acta.tareas.map((tarea, index) => (
                  <div
                    key={tarea.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {index + 1}.
                        </span>
                        {tarea.temaRelacionadoTitulo && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Ref: {tarea.temaRelacionadoTitulo}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                      {/* Action description */}
                      <div className="md:col-span-5">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Tarea / Acción Concreta
                        </label>
                        <input
                          type="text"
                          value={tarea.accion}
                          onChange={e => handleUpdateTask(index, 'accion', e.target.value)}
                          placeholder="Ej. Redactar circular pedagógica para las familias"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                        />
                      </div>

                      {/* Assignee */}
                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Responsable
                        </label>
                        <input
                          type="text"
                          value={tarea.responsable}
                          onChange={e => handleUpdateTask(index, 'responsable', e.target.value)}
                          list="roster-assignee"
                          placeholder="Maestro o comisión"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                        <datalist id="roster-assignee">
                          {roster.map(m => (
                            <option key={m.id} value={m.nombre} />
                          ))}
                        </datalist>
                      </div>

                      {/* Due date */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Fecha Límite
                        </label>
                        <input
                          type="date"
                          value={tarea.fechaLimite}
                          onChange={e => handleUpdateTask(index, 'fechaLimite', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                        />
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Estado
                        </label>
                        <select
                          value={tarea.estado}
                          onChange={e => handleUpdateTask(index, 'estado', e.target.value as EstadoTarea)}
                          className={`w-full px-2 py-1.5 text-xs border rounded-md font-medium ${
                            tarea.estado === 'cumplida'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : tarea.estado === 'en_progreso'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_progreso">En Proceso</option>
                          <option value="cumplida">Cumplida</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAddTask}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100/60 border border-dashed border-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-700" />
              Añadir Otra Tarea Asignada
            </button>
          </div>
        )}
      </div>

      {/* 5. CIERRE Y PRÓXIMA REUNIÓN */}
      <div className="bg-white rounded-xl border border-emerald-900/10 overflow-hidden shadow-xs transition-all">
        <button
          type="button"
          onClick={() => setActiveSection(activeSection === 5 ? 0 : 5)}
          className="w-full flex items-center justify-between p-4 bg-emerald-50/40 hover:bg-emerald-50/70 border-b border-emerald-900/10 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-[11px] font-bold text-white font-mono">
              5
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                5. Cierre y Próxima Reunión
              </h2>
              <p className="text-xs text-slate-500">
                Fecha de próxima convocatoria, check-out y firmas de Facilitador/a y Secretario/a
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSection === 5 ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        {activeSection === 5 && (
          <div className="p-5 space-y-4">
            {/* Next meeting info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Próxima reunión: Fecha
                </label>
                <input
                  type="date"
                  value={acta.cierre.proximaReunionFecha}
                  onChange={e => handleCierreChange('proximaReunionFecha', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Próxima reunión: Hora
                </label>
                <input
                  type="time"
                  value={acta.cierre.proximaReunionHora}
                  onChange={e => handleCierreChange('proximaReunionHora', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lugar acordado
                </label>
                <input
                  type="text"
                  value={acta.cierre.proximaReunionLugar || ''}
                  onChange={e => handleCierreChange('proximaReunionLugar', e.target.value)}
                  placeholder="Campus CENEDIS LunaSol - Sala de Maestros"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Check-out: Ronda de cierre breve
              </label>
              <textarea
                rows={2}
                value={acta.cierre.checkOut}
                onChange={e => handleCierreChange('checkOut', e.target.value)}
                placeholder="Sensaciones de cierre de la Facultad, palabras finales de armonización..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed"
              />
            </div>

            {/* Signatures status block */}
            <div className="pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Firmas Oficiales (Impresión o Digital)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Facilitador */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 flex flex-col items-center text-center">
                  <p className="text-xs font-bold text-slate-800">Firma Facilitador/a</p>
                  <p className="text-xs text-slate-600 mb-2">{acta.firmas.facilitadorNombre || acta.facilitador}</p>
                  
                  {acta.firmas.facilitadorFirmaUrl ? (
                    <div className="h-14 w-full flex items-center justify-center bg-white border border-slate-200 rounded p-1 mb-2">
                      <img
                        src={acta.firmas.facilitadorFirmaUrl}
                        alt="Firma"
                        className="max-h-12 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-full flex items-center justify-center border border-dashed border-slate-300 bg-white rounded text-[11px] text-slate-400 mb-2">
                      Línea para firma manuscrita al imprimir
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenSignatureModal('facilitador')}
                    className="text-xs font-medium text-emerald-900 bg-white border border-slate-200 hover:border-emerald-300 px-3 py-1 rounded transition-colors cursor-pointer"
                  >
                    {acta.firmas.facilitadorFirmaUrl ? 'Actualizar firma' : 'Firmar en pantalla'}
                  </button>
                </div>

                {/* Secretario */}
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60 flex flex-col items-center text-center">
                  <p className="text-xs font-bold text-slate-800">Firma Secretario/a</p>
                  <p className="text-xs text-slate-600 mb-2">{acta.firmas.secretarioNombre || acta.secretario}</p>

                  {acta.firmas.secretarioFirmaUrl ? (
                    <div className="h-14 w-full flex items-center justify-center bg-white border border-slate-200 rounded p-1 mb-2">
                      <img
                        src={acta.firmas.secretarioFirmaUrl}
                        alt="Firma"
                        className="max-h-12 max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-full flex items-center justify-center border border-dashed border-slate-300 bg-white rounded text-[11px] text-slate-400 mb-2">
                      Línea para firma manuscrita al imprimir
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenSignatureModal('secretario')}
                    className="text-xs font-medium text-emerald-900 bg-white border border-slate-200 hover:border-emerald-300 px-3 py-1 rounded transition-colors cursor-pointer"
                  >
                    {acta.firmas.secretarioFirmaUrl ? 'Actualizar firma' : 'Firmar en pantalla'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA to view final document and print */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Los cambios se respaldan continuamente de forma automática.
        </p>
        <button
          type="button"
          onClick={onGoToPreview}
          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <span>Ver Documento Final & Imprimir</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
