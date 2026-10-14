import { Projection } from '../types';

interface Props {
  projection: Projection;
}

export function ProjectionPanel({ projection }: Props) {
  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="fas fa-chart-line text-purple-400"></i>
        Proyección de Horas
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${Math.min(100, (projection.weekly / 45) * 100)}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-400">{Math.min(100, Math.round((projection.weekly / 45) * 100))}%</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-white">{projection.weekly}h</div>
          <div className="text-xs text-slate-400">Semanal</div>
        </div>

        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray={`${Math.min(100, (projection.monthly / 180) * 100)}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-400">{Math.min(100, Math.round((projection.monthly / 180) * 100))}%</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-white">{projection.monthly}h</div>
          <div className="text-xs text-slate-400">Mensual</div>
        </div>

        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(100,116,139,0.3)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray={`${Math.min(100, (projection.quarterly / 540) * 100)}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-400">{Math.min(100, Math.round((projection.quarterly / 540) * 100))}%</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-white">{projection.quarterly}h</div>
          <div className="text-xs text-slate-400">Trimestral</div>
        </div>
      </div>
    </div>
  );
}
