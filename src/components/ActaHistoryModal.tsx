import React, { useState } from 'react';
import { X, Search, Calendar, FileText, Trash2, ArrowUpRight, Copy, CheckCircle2 } from 'lucide-react';
import { ActaData } from '../types/acta';

interface ActaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedActas: ActaData[];
  currentActaId: string;
  onSelectActa: (acta: ActaData) => void;
  onDeleteActa: (id: string) => void;
  onDuplicateActa: (acta: ActaData) => void;
}

export const ActaHistoryModal: React.FC<ActaHistoryModalProps> = ({
  isOpen,
  onClose,
  savedActas,
  currentActaId,
  onSelectActa,
  onDeleteActa,
  onDuplicateActa,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredActas = savedActas.filter(acta => {
    const q = search.toLowerCase();
    const matchNum = acta.actaNumero?.toLowerCase().includes(q);
    const matchFecha = acta.fecha?.toLowerCase().includes(q);
    const matchFacilitador = acta.facilitador?.toLowerCase().includes(q);
    const matchSecretario = acta.secretario?.toLowerCase().includes(q);
    const matchTemas = acta.temas.some(t => t.tema.toLowerCase().includes(q) || t.resolucion.toLowerCase().includes(q));
    return matchNum || matchFecha || matchFacilitador || matchSecretario || matchTemas;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Historial de Actas Registradas</h3>
              <p className="text-xs text-slate-500">
                Consulte, reabra o duplique actas de reuniones anteriores ({savedActas.length} en archivo)
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

        {/* Search */}
        <div className="mt-4 relative shrink-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número de acta, fecha, facilitador o tema tratado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        {/* List */}
        <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
          {filteredActas.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No se encontraron actas que coincidan con la búsqueda.
            </div>
          ) : (
            filteredActas.map(acta => {
              const isCurrent = acta.id === currentActaId;
              const pendingCount = acta.tareas.filter(t => t.estado !== 'cumplida').length;

              return (
                <div
                  key={acta.id}
                  className={`py-3.5 px-3 rounded-lg transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent ? 'bg-slate-50 border border-slate-200/80' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        Acta N° {acta.actaNumero || 'S/N'}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-mono tabular-nums">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {acta.fecha || 'Sin fecha'}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          En pantalla
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      Facilitador: <strong className="font-medium text-slate-700">{acta.facilitador}</strong> · Secretario: <strong className="font-medium text-slate-700">{acta.secretario}</strong>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 flex-wrap">
                      <span>{acta.temas.length} temas tratados</span>
                      <span>·</span>
                      <span>{acta.tareas.length} tareas asignadas</span>
                      {pendingCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700 font-medium">
                            {pendingCount} compromiso{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                      {acta.ausentes.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-rose-600">
                            {acta.ausentes.length} ausente{acta.ausentes.length > 1 ? 's' : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onDuplicateActa(acta)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 rounded-lg text-xs transition-colors"
                      title="Duplicar como nueva acta"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    {savedActas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar Acta N° ${acta.actaNumero}?`)) {
                            onDeleteActa(acta.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg text-xs transition-colors"
                        title="Eliminar acta"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onSelectActa(acta);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Abrir
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Los datos se conservan automáticamente en la memoria del navegador.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
