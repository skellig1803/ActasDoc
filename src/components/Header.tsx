import React from 'react';
import { Printer, Save, PlusCircle, History, Users, Eye, Edit3 } from 'lucide-react';
import { CenedisLogo } from './CenedisLogo';

export type ActiveTab = 'editor' | 'preview';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  actaNumero: string;
  onSaveActa: () => void;
  onNewActa: () => void;
  onOpenHistory: () => void;
  onOpenRoster: () => void;
  onQuickPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  actaNumero,
  onSaveActa,
  onNewActa,
  onOpenHistory,
  onOpenRoster,
  onQuickPrint,
}) => {
  return (
    <header className="no-print bg-white border-b border-emerald-950/10 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line with CENEDIS LunaSol identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('editor')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <CenedisLogo size={36} />
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                CENEDIS <span className="text-amber-600 font-extrabold">LunaSol</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold block">
                Actas · Facultad de Maestros
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 concise single-line nav tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onTabChange('editor')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'text-emerald-900 font-bold border-b-2 border-emerald-700'
                : 'hover:text-emerald-800'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
            Editor de Acta
          </button>

          <button
            type="button"
            onClick={() => onTabChange('preview')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'text-emerald-900 font-bold border-b-2 border-emerald-700'
                : 'hover:text-emerald-800'
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-emerald-700" />
            Vista Oficial y Reporte
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="whitespace-nowrap shrink-0 hover:text-emerald-900 transition-colors py-1 cursor-pointer flex items-center gap-1.5"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            Historial de Actas
          </button>

          <button
            type="button"
            onClick={onOpenRoster}
            className="whitespace-nowrap shrink-0 hover:text-emerald-900 transition-colors py-1 cursor-pointer flex items-center gap-1.5"
          >
            <Users className="h-3.5 w-3.5 text-slate-400" />
            Plantel Docente
          </button>
        </nav>

        {/* Zone 3: Primary action cluster with dossier color harmony */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewActa}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
            title="Crear una nueva acta de reunión"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-700" />
            <span>Nueva Acta</span>
          </button>

          <button
            type="button"
            onClick={onSaveActa}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Guardar en el archivo de actas"
          >
            <Save className="h-3.5 w-3.5 text-slate-500" />
            <span>Guardar</span>
          </button>

          <button
            type="button"
            onClick={onQuickPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-lg hover:bg-emerald-900 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-3 py-1.5 text-xs bg-slate-50">
        <button
          type="button"
          onClick={() => onTabChange('editor')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'editor' ? 'text-emerald-900 font-bold bg-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => onTabChange('preview')}
          className={`px-2 py-1 rounded font-medium ${
            activeTab === 'preview' ? 'text-emerald-900 font-bold bg-white shadow-xs' : 'text-slate-600'
          }`}
        >
          Vista Oficial
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="px-2 py-1 text-slate-600 hover:text-slate-900"
        >
          Historial
        </button>
        <button
          type="button"
          onClick={onOpenRoster}
          className="px-2 py-1 text-slate-600 hover:text-slate-900"
        >
          Plantel
        </button>
      </div>
    </header>
  );
};
