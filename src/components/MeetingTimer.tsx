import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle } from 'lucide-react';

interface MeetingTimerProps {
  onSetHoraFin: (timeStr: string) => void;
  horaInicio?: string;
}

export const MeetingTimer: React.FC<MeetingTimerProps> = ({ onSetHoraFin, horaInicio }) => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleFinishNow = () => {
    const now = new Date();
    const timeStr = now.toTimeString().substring(0, 5);
    onSetHoraFin(timeStr);
    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs shadow-xs">
      <div className="flex items-center gap-1.5 text-slate-300">
        <Clock className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[11px] font-medium hidden sm:inline">Cronómetro Sesión:</span>
        <span className="font-mono tabular-nums font-bold text-white text-xs">
          {formatTime(seconds)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className={`p-1 rounded transition-colors ${
            isRunning ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
          }`}
          title={isRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro de reunión'}
        >
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRunning(false);
            setSeconds(0);
          }}
          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Reiniciar cronómetro"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      <div className="h-3 w-px bg-slate-700" />

      <button
        type="button"
        onClick={handleFinishNow}
        className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white font-medium transition-colors"
        title="Registrar hora actual como Hora de Fin de la reunión"
      >
        <CheckCircle className="h-3 w-3 text-emerald-400" />
        <span className="hidden md:inline">Marcar fin actual</span>
      </button>
    </div>
  );
};
