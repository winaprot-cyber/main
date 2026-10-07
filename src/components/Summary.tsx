import { WeeklySummary } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  weeklySummary: WeeklySummary;
  weekNumber?: number;
}

export function Summary({ weeklySummary, weekNumber }: Props) {
  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-calendar-week text-blue-400"></i>
          Resumen Semanal {weekNumber && <span className="text-sm text-cyan-400">(Semana {weekNumber})</span>}
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          weeklySummary.percentage >= 100 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : weeklySummary.percentage >= 50 
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
            : 'bg-slate-600/40 text-slate-300 border border-slate-500/30'
        }`}>
          {weeklySummary.percentage}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-700/40 rounded-xl p-3">
          <div className="text-xs text-slate-400 mb-1">Horas semanales</div>
          <div className="text-2xl font-bold text-white">{weeklySummary.totalHours}h</div>
          <div className="text-xs text-slate-500 mt-1">Meta: 45h</div>
        </div>
        <div className="bg-slate-700/40 rounded-xl p-3">
          <div className="text-xs text-slate-400 mb-1">Horas restantes</div>
          <div className="text-2xl font-bold text-cyan-400">
            {Math.max(0, 45 - (weeklySummary.weekdayHours + weeklySummary.holidayHours))}h
          </div>
          <div className="text-xs text-slate-500 mt-1">Para completar</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
          <div className="text-xs text-blue-300 mb-1">Lun-Vie</div>
          <div className="text-lg font-bold text-blue-400">{weeklySummary.weekdayHours}h</div>
        </div>
        <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
          <div className="text-xs text-purple-300 mb-1">Fin de semana</div>
          <div className="text-lg font-bold text-purple-400">{weeklySummary.weekendHours}h</div>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
          <div className="text-xs text-amber-300 mb-1">Feriados</div>
          <div className="text-lg font-bold text-amber-400">{weeklySummary.holidayHours}h</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Progreso semanal</span>
          <span className="text-cyan-400 font-semibold">{Math.min(100, Math.round(((weeklySummary.weekdayHours + weeklySummary.holidayHours) / 45) * 100))}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              (weeklySummary.weekdayHours + weeklySummary.holidayHours) >= 45 
                ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${Math.min(100, ((weeklySummary.weekdayHours + weeklySummary.holidayHours) / 45) * 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        {format(parseISO(weeklySummary.weekStart), "d 'de' MMMM", { locale: es })} - {format(parseISO(weeklySummary.weekEnd), "d 'de' MMMM", { locale: es })}
      </div>
    </div>
  );
}
