import React, { useState } from 'react';
import { CenedisLogo } from './CenedisLogo';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginWithPassword } from '../utils/api';

interface PasswordGateProps {
  onSuccess: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor ingrese la contraseña de acceso.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginWithPassword(password, remember);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Contraseña incorrecta.');
      }
    } catch (err) {
      setError('Error al verificar la clave. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with CENEDIS LunaSol branding */}
        <div className="bg-emerald-800 p-8 text-center text-white relative">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-md mb-3">
            <CenedisLogo size={56} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            CENEDIS <span className="text-amber-400">LunaSol</span>
          </h1>
          <p className="text-xs text-emerald-100 font-medium tracking-wide mt-1">
            Educación para el ser, salud para el futuro
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-[11px] text-emerald-200 border border-emerald-700/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sistema Central de Actas Docentes</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-5 text-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Acceso a la Facultad de Maestros
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingrese la clave institucional para acceder y sincronizar actas desde este equipo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contraseña institucional
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Ingrese contraseña..."
                  autoFocus
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5"
                />
                <span>Recordar sesión en este equipo</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Verificando...' : 'Ingresar a las Actas'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              CENEDIS LunaSol · Información protegida de la institución
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
