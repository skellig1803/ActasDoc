import React, { useState } from 'react';
import { X, Plus, Trash2, Users, RotateCcw, Check } from 'lucide-react';
import { Maestro } from '../types/acta';
import { DEFAULT_ROSTER } from '../utils/storage';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: Maestro[];
  onSaveRoster: (newRoster: Maestro[]) => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  onClose,
  roster,
  onSaveRoster,
}) => {
  const [list, setList] = useState<Maestro[]>(roster);
  const [newName, setNewName] = useState('');
  const [newArea, setNewArea] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newTeacher: Maestro = {
      id: `m-${Date.now()}`,
      nombre: newName.trim(),
      areaCargo: newArea.trim() || 'Docente de Área',
    };

    const updated = [...list, newTeacher];
    setList(updated);
    setNewName('');
    setNewArea('');
  };

  const handleRemove = (id: string) => {
    setList(list.filter(m => m.id !== id));
  };

  const handleReset = () => {
    if (window.confirm('¿Desea restaurar la plantilla predeterminada de profesores?')) {
      setList(DEFAULT_ROSTER);
    }
  };

  const handleSaveAndClose = () => {
    onSaveRoster(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Plantel Docente y Claustro</h3>
              <p className="text-xs text-slate-500">
                Configure los maestros para marcar ausentes con un solo clic en cada reunión.
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

        {/* Form to add teacher */}
        <form onSubmit={handleAdd} className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Nombre completo del Maestro/a
              </label>
              <input
                type="text"
                placeholder="Ej. Prof. María Rodríguez"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Área / Asignatura / Cargo
              </label>
              <input
                type="text"
                placeholder="Ej. Matemáticas / Coordinación"
                value={newArea}
                onChange={e => setNewArea(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir
              </button>
            </div>
          </div>
        </form>

        {/* Teacher list scrollable */}
        <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
          {list.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay docentes registrados. Agregue uno arriba o restaure la plantilla.
            </div>
          ) : (
            list.map((m, idx) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between group hover:bg-slate-50/50 px-2 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-5 tabular-nums">{idx + 1}.</span>
                  <div>
                    <p className="text-xs font-medium text-slate-800">{m.nombre}</p>
                    <p className="text-[11px] text-slate-500">{m.areaCargo}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                  title="Eliminar de la lista"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar valores de muestra
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Guardar Nómina ({list.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
