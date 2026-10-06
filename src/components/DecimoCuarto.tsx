import { useState, useEffect } from 'react';

const STORAGE_KEY_DECIMO = 'asistencia_hl_decimo';

interface MonthData {
  month: string;
  shortName: string;
  amount: number;
}

const MONTHS: MonthData[] = [
  { month: 'Diciembre', shortName: 'Dic', amount: 0 },
  { month: 'Enero', shortName: 'Ene', amount: 0 },
  { month: 'Febrero', shortName: 'Feb', amount: 0 },
  { month: 'Marzo', shortName: 'Mar', amount: 0 },
  { month: 'Abril', shortName: 'Abr', amount: 0 },
  { month: 'Mayo', shortName: 'May', amount: 0 },
  { month: 'Junio', shortName: 'Jun', amount: 0 },
  { month: 'Julio', shortName: 'Jul', amount: 0 },
  { month: 'Agosto', shortName: 'Ago', amount: 0 },
  { month: 'Septiembre', shortName: 'Sep', amount: 0 },
  { month: 'Octubre', shortName: 'Oct', amount: 0 },
  { month: 'Noviembre', shortName: 'Nov', amount: 0 },
];

export function DecimoCuarto() {
  const [months, setMonths] = useState<MonthData[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_DECIMO);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return MONTHS.map(m => ({ ...m }));
      }
    }
    return MONTHS.map(m => ({ ...m }));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DECIMO, JSON.stringify(months));
  }, [months]);

  const totalAccumulated = months.reduce((sum, m) => sum + m.amount, 0);
  const decimoCuarto = totalAccumulated / 12;
  const monthsWithSalary = months.filter(m => m.amount > 0).length;

  const handleMonthChange = (index: number, value: string) => {
    const newMonths = [...months];
    newMonths[index] = { ...newMonths[index], amount: parseFloat(value) || 0 };
    setMonths(newMonths);
  };

  const handleClearAll = () => {
    setMonths(MONTHS.map(m => ({ ...m, amount: 0 })));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-gift text-emerald-400"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-emerald-300">14to Sueldo - Aguinaldo</h3>
            <p className="text-sm text-slate-400 mt-1">
              Ingresa los sueldos de <strong className="text-white">diciembre a noviembre</strong>
            </p>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
            <div className="text-xs text-blue-300">
              <p className="font-semibold mb-1">Cálculo Automático</p>
              <p className="text-blue-200/80">
                El día 1 de cada mes, el sistema calcula automáticamente la base para el décimo del mes anterior:
              </p>
              <ul className="mt-2 space-y-1 text-blue-200/70">
                <li>✓ <strong>Sueldo Base</strong> + <strong>Horas Extras</strong> del mes</li>
                <li>✗ NO incluye bonos</li>
                <li>✗ NO incluye fondo de reserva</li>
              </ul>
              <p className="mt-2 text-blue-200/80">
                Puedes editar estos valores manualmente si es necesario.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-calendar-alt text-cyan-400"></i>
            Sueldos Mensuales
          </h3>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-all"
          >
            <i className="fas fa-eraser"></i> Limpiar
          </button>
        </div>

        <div className="space-y-2">
          {months.map((month, index) => (
            <div key={month.month} className="flex items-center gap-3 bg-slate-700/30 rounded-xl p-3 border border-slate-600/30">
              <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center text-xs font-bold text-slate-300">
                {index + 1}
              </div>
              <div className="flex-1">
                <span className="text-sm text-white font-medium">{month.month}</span>
              </div>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={month.amount || ''}
                  onChange={(e) => handleMonthChange(index, e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalAccumulated > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-emerald-500/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-400"></i>
            Resultado
          </h3>

          <div className="space-y-3">
            <div className="bg-slate-700/40 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Meses registrados:</span>
                <span className="text-white font-semibold">{monthsWithSalary} / 12</span>
              </div>
              <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${(monthsWithSalary / 12) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-700/40 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Total acumulado:</span>
                <span className="text-cyan-400 font-semibold">${totalAccumulated.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-600/50 pt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold text-lg">14to Sueldo:</span>
                    <p className="text-xs text-slate-400">Aguinaldo de Navidad</p>
                  </div>
                  <span className="text-3xl font-bold text-emerald-400">${decimoCuarto.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalAccumulated === 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
          <i className="fas fa-gift text-4xl text-slate-600 mb-3"></i>
          <p className="text-slate-400">Ingresa los sueldos mensuales</p>
        </div>
      )}
    </div>
  );
}
