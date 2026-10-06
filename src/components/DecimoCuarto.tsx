import { useState, useEffect } from 'react';
import { getDecimoMonthlyBases } from '../utils/monthlyBaseCalculator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STORAGE_KEY_DECIMO = 'asistencia_hl_decimo';

interface MonthData {
  month: string;
  shortName: string;
  amount: number;
  isAutoCalculated?: boolean;
  calculatedDate?: string;
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
    // Cargar bases guardadas automáticamente
    const savedBases = getDecimoMonthlyBases();
    
    const stored = localStorage.getItem(STORAGE_KEY_DECIMO);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Combinar con las bases guardadas
        return MONTHS.map((m, index) => {
          const savedBase = savedBases.find(b => {
            const monthNum = parseInt(b.month.split('-')[1]);
            return monthNum === (index === 0 ? 12 : index);
          });
          
          return {
            ...m,
            amount: savedBase ? savedBase.baseAmount : (parsed[index]?.amount || 0),
            isAutoCalculated: savedBase ? true : false,
            calculatedDate: savedBase?.calculatedAt
          };
        });
      } catch {
        return MONTHS.map((m, index) => ({
          ...m,
          amount: savedBases[index]?.baseAmount || 0,
          isAutoCalculated: savedBases[index] ? true : false,
          calculatedDate: savedBases[index]?.calculatedAt
        }));
      }
    }
    
    return MONTHS.map((m, index) => ({
      ...m,
      amount: savedBases[index]?.baseAmount || 0,
      isAutoCalculated: savedBases[index] ? true : false,
      calculatedDate: savedBases[index]?.calculatedAt
    }));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DECIMO, JSON.stringify(months));
  }, [months]);

  const totalAccumulated = months.reduce((sum, m) => sum + m.amount, 0);
  const decimoCuarto = totalAccumulated / 12;
  const monthsWithSalary = months.filter(m => m.amount > 0).length;
  const autoCalculatedMonths = months.filter(m => m.isAutoCalculated).length;

  const handleMonthChange = (index: number, value: string) => {
    const newMonths = [...months];
    newMonths[index] = { 
      ...newMonths[index], 
      amount: parseFloat(value) || 0,
      isAutoCalculated: false // Marcar como editado manualmente
    };
    setMonths(newMonths);
  };

  const handleClearAll = () => {
    setMonths(MONTHS.map(m => ({ ...m, amount: 0, isAutoCalculated: false })));
  };

  const salaryBase = parseFloat(localStorage.getItem('asistencia_hl_salary') || '0');

  return (
    <div className="space-y-6">
      {/* Header con información */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <i className="fas fa-gift text-emerald-400 text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-emerald-300">14to Sueldo - Aguinaldo de Navidad</h3>
            <p className="text-sm text-slate-400 mt-1">
              Calculado automáticamente el día 1 de cada mes
            </p>
          </div>
        </div>
        
        {/* Información del cálculo automático */}
        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <i className="fas fa-robot text-blue-400 mt-0.5"></i>
            <div className="text-xs text-blue-300 flex-1">
              <p className="font-semibold mb-2">🤖 Cálculo Automático Activo</p>
              <p className="text-blue-200/80 mb-2">
                El sistema calcula automáticamente la base para el décimo de cada mes:
              </p>
              <div className="bg-slate-800/50 rounded-lg p-3 mb-2">
                <p className="text-blue-300 font-mono text-sm">
                  Base Mensual = Sueldo Base + Horas Extras del Mes
                </p>
              </div>
              <ul className="mt-2 space-y-1 text-blue-200/70">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-green-400 mt-0.5"></i>
                  <span><strong>Incluye:</strong> Sueldo Base + Horas Extras (50% y 100%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-times-circle text-red-400 mt-0.5"></i>
                  <span><strong>NO incluye:</strong> Bonos, Fondo de Reserva, Ingresos Manuales</span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <p className="text-blue-200/80">
                  <i className="fas fa-calendar-check mr-1"></i>
                  <strong>Próximo cálculo:</strong> Día 1 del próximo mes a las 00:00
                </p>
                <p className="text-blue-200/80 mt-1">
                  <i className="fas fa-edit mr-1"></i>
                  Puedes editar los valores manualmente si es necesario
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sueldo base actual */}
        {salaryBase > 0 && (
          <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-money-bill-wave text-green-400"></i>
                <span className="text-sm text-green-300 font-medium">Sueldo Base Actual:</span>
              </div>
              <span className="text-lg font-bold text-green-400">${salaryBase.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-calendar-check text-cyan-400"></i>
            <span className="text-xs text-slate-400">Meses Registrados</span>
          </div>
          <div className="text-2xl font-bold text-white">{monthsWithSalary} / 12</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-robot text-blue-400"></i>
            <span className="text-xs text-slate-400">Calculados Auto.</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{autoCalculatedMonths}</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-calculator text-purple-400"></i>
            <span className="text-xs text-slate-400">Promedio Mensual</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            ${monthsWithSalary > 0 ? (totalAccumulated / monthsWithSalary).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Lista de meses */}
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fas fa-list text-cyan-400"></i>
            Bases Mensuales del Décimo
          </h3>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-all flex items-center gap-1.5"
          >
            <i className="fas fa-eraser"></i> Limpiar Todo
          </button>
        </div>

        <div className="space-y-2">
          {months.map((month, index) => (
            <div 
              key={month.month} 
              className={`flex items-center gap-3 rounded-xl p-3 border ${
                month.isAutoCalculated 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-slate-700/30 border-slate-600/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                month.isAutoCalculated 
                  ? 'bg-blue-500/30 text-blue-300' 
                  : 'bg-slate-600/50 text-slate-300'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium">{month.month}</span>
                  {month.isAutoCalculated && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                      <i className="fas fa-robot mr-1"></i>
                      Automático
                    </span>
                  )}
                </div>
                {month.calculatedDate && (
                  <div className="text-xs text-slate-500 mt-1">
                    <i className="fas fa-clock mr-1"></i>
                    Calculado: {format(new Date(month.calculatedDate), 'dd/MM/yyyy HH:mm')}
                  </div>
                )}
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

      {/* Resultado final */}
      {totalAccumulated > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <i className="fas fa-trophy text-yellow-400"></i>
            Cálculo del 14to Sueldo
          </h3>

          <div className="space-y-3">
            {/* Progreso */}
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Meses registrados:</span>
                <span className="text-white font-semibold">{monthsWithSalary} / 12</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${(monthsWithSalary / 12) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0 meses</span>
                <span>12 meses</span>
              </div>
            </div>

            {/* Fórmula */}
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-3 font-semibold">📊 Fórmula de Cálculo:</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total acumulado (12 meses):</span>
                  <span className="text-cyan-400 font-semibold">${totalAccumulated.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Dividido entre:</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="border-t border-slate-600/50 pt-2 mt-2">
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

            {/* Desglose por tipo */}
            {autoCalculatedMonths > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <i className="fas fa-robot text-blue-400 mt-0.5"></i>
                  <div className="text-xs text-blue-300">
                    <p className="font-semibold mb-1">Desglose de Cálculos</p>
                    <p className="text-blue-200/80">
                      • {autoCalculatedMonths} meses calculados automáticamente
                    </p>
                    <p className="text-blue-200/80">
                      • {monthsWithSalary - autoCalculatedMonths} meses ingresados manualmente
                    </p>
                    <p className="text-blue-200/80 mt-2">
                      Los valores automáticos se pueden editar si es necesario
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {totalAccumulated === 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
          <i className="fas fa-gift text-5xl text-slate-600 mb-3"></i>
          <p className="text-slate-400 text-lg font-medium">No hay bases registradas</p>
          <p className="text-xs text-slate-500 mt-2">
            Las bases se calcularán automáticamente el día 1 de cada mes
          </p>
          <p className="text-xs text-slate-500 mt-1">
            También puedes ingresar los valores manualmente
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-question-circle text-cyan-400"></i>
          Información Importante
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <div>
              <p className="font-medium text-white">¿Cuándo se calcula?</p>
              <p className="text-xs text-slate-400 mt-1">
                El día 1 de cada mes a las 00:00, el sistema calcula automáticamente la base del mes anterior
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-400 mt-1"></i>
            <div>
              <p className="font-medium text-white">¿Qué incluye?</p>
              <p className="text-xs text-slate-400 mt-1">
                Sueldo Base + Horas Extras del mes (50% y 100%)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="fas fa-times-circle text-red-400 mt-1"></i>
            <div>
              <p className="font-medium text-white">¿Qué NO incluye?</p>
              <p className="text-xs text-slate-400 mt-1">
                Bonos, Fondo de Reserva, Ingresos Extras Manuales
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="fas fa-edit text-amber-400 mt-1"></i>
            <div>
              <p className="font-medium text-white">¿Puedo editar los valores?</p>
              <p className="text-xs text-slate-400 mt-1">
                Sí, puedes editar cualquier valor manualmente en cualquier momento
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <i className="fas fa-save text-blue-400 mt-1"></i>
            <div>
              <p className="font-medium text-white">¿Se guardan los datos?</p>
              <p className="text-xs text-slate-400 mt-1">
                Sí, todos los datos se guardan automáticamente en tu navegador
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
