import { useState, useEffect } from 'react';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { getWeeklySummary, getProjection, getWeekNumber } from './utils/calculations';
import { exportDatabase, importDatabase } from './utils/database';
import { processMonthChange } from './utils/monthlyBaseCalculator';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function App() {
  const { records, holidays, bonuses, discounts, personalDebts, personalExpenses, addRecord, updateRecord, deleteRecord, clearAllRecords, addHoliday, deleteHoliday, addBonus, deleteBonus, addDiscount, updateDiscount, deleteDiscount, addPersonalDebt, updatePersonalDebt, deletePersonalDebt, addPersonalExpense, updatePersonalExpense, deletePersonalExpense } = useAttendanceStorage();

  const [activeTab, setActiveTab] = useState('registro');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  const currentDate = new Date();
  const selectedDate = addWeeks(currentDate, selectedWeekOffset);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekNumber = getWeekNumber(selectedDate);
  const weeklySummary = getWeeklySummary(records, selectedDate);
  const projection = getProjection(records);

  useEffect(() => {
    const salary = parseFloat(localStorage.getItem('asistencia_hl_salary') || '0');
    if (salary > 0 && records.length > 0) {
      processMonthChange(salary, records);
    }
  }, [records]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">CONTROL DE ASISTENCIA</h1>
                <p className="text-xs text-slate-400">Creador by Hugo Leon</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Semana {weekNumber}</div>
                <div className="text-sm font-semibold text-cyan-300">{weeklySummary.totalHours}h / 45h</div>
              </div>
              <button onClick={() => exportDatabase()} className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center" title="Exportar">
                <i className="fas fa-download text-green-400"></i>
              </button>
              <button onClick={() => importDatabase()} className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-full flex items-center justify-center" title="Importar">
                <i className="fas fa-upload text-blue-400"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'registro' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <i className="fas fa-calendar-week text-cyan-400"></i>
                  Semana {weekNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedWeekOffset(prev => prev - 1)} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="flex-1 text-center">
                  <div className="text-sm font-semibold">{format(weekStart, 'dd MMM', { locale: es })} - {format(weekEnd, 'dd MMM yyyy', { locale: es })}</div>
                </div>
                <button onClick={() => setSelectedWeekOffset(prev => prev + 1)} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h2 className="text-lg font-semibold mb-4">Resumen Semanal</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Horas</div>
                  <div className="text-2xl font-bold">{weeklySummary.totalHours}h</div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <div className="text-xs text-slate-400">Progreso</div>
                  <div className="text-2xl font-bold text-cyan-400">{weeklySummary.percentage}%</div>
                </div>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.min(100, (weeklySummary.totalHours / 45) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4">Proyecciones</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{projection.weekly}h</div>
                  <div className="text-xs text-slate-400">Semanal</div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{projection.monthly}h</div>
                  <div className="text-xs text-slate-400">Mensual</div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{projection.quarterly}h</div>
                  <div className="text-xs text-slate-400">Trimestral</div>
                </div>
              </div>
            </div>

            <button onClick={() => {
              const date = prompt('Fecha (YYYY-MM-DD):', format(new Date(), 'yyyy-MM-dd'));
              if (!date) return;
              const entry = prompt('Hora entrada:', '08:00');
              if (!entry) return;
              const exit = prompt('Hora salida:', '17:00');
              if (!exit) return;
              const [eh, em] = entry.split(':').map(Number);
              const [xh, xm] = exit.split(':').map(Number);
              const hours = ((xh * 60 + xm) - (eh * 60 + em)) / 60;
              addRecord({
                id: Date.now().toString(),
                date,
                dayOfWeek: new Date(date).getDay(),
                entryTime: entry,
                exitTime: exit,
                hoursWorked: hours,
                isWeekend: [0, 6].includes(new Date(date).getDay()),
                isHoliday: holidays.some(h => h.date === date)
              });
              alert('✅ Registro guardado');
            }} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-semibold shadow-lg">
              <i className="fas fa-plus mr-2"></i>Registrar Asistencia
            </button>
          </div>
        )}

        {activeTab === 'historial' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Historial de Registros</h2>
            {records.length === 0 ? (
              <div className="bg-slate-800/60 rounded-2xl p-8 text-center">
                <i className="fas fa-clipboard-list text-4xl text-slate-600 mb-3"></i>
                <p className="text-slate-400">No hay registros</p>
              </div>
            ) : (
              records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                <div key={record.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{format(new Date(record.date), 'dd/MM/yyyy')}</div>
                      <div className="text-sm text-slate-400">{record.entryTime} - {record.exitTime}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-cyan-400">{record.hoursWorked}h</div>
                      <button onClick={() => { if (confirm('¿Eliminar?')) deleteRecord(record.id); }} className="text-xs text-red-400 hover:text-red-300">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'pago' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Cálculo de Pagos</h2>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">Sueldo Base</label>
                  <input type="number" defaultValue={localStorage.getItem('asistencia_hl_salary') || '0'} onBlur={(e) => localStorage.setItem('asistencia_hl_salary', e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Tarifa 100%</label>
                  <input type="number" step="0.01" defaultValue={localStorage.getItem('asistencia_hl_rate100') || '4.39'} onBlur={(e) => localStorage.setItem('asistencia_hl_rate100', e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Tarifa 50%</label>
                  <input type="number" step="0.01" defaultValue={localStorage.getItem('asistencia_hl_rate50') || '3.29'} onBlur={(e) => localStorage.setItem('asistencia_hl_rate50', e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 mt-1" />
                </div>
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="font-semibold mb-3">Resumen del Mes</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Horas trabajadas:</span><span className="font-bold">{projection.monthly}h</span></div>
                <div className="flex justify-between"><span>Sueldo base:</span><span className="font-bold">${parseFloat(localStorage.getItem('asistencia_hl_salary') || '0').toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finanzas' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Finanzas</h2>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="font-semibold mb-3">Bonos ({bonuses.length})</h3>
              {bonuses.map(b => (
                <div key={b.id} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span>{b.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">${b.amount.toFixed(2)}</span>
                    <button onClick={() => deleteBonus(b.id)} className="text-red-400"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const name = prompt('Nombre del bono:');
                if (!name) return;
                const amount = parseFloat(prompt('Monto:') || '0');
                if (amount <= 0) return;
                addBonus({ id: Date.now().toString(), name, type: 'fixed', amount, startDate: format(new Date(), 'yyyy-MM-dd') });
              }} className="w-full py-2 mt-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm">
                <i className="fas fa-plus mr-2"></i>Agregar Bono
              </button>
            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Balance Personal</h2>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="font-semibold mb-3">Gastos ({personalExpenses.length})</h3>
              {personalExpenses.map(e => (
                <div key={e.id} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span>{e.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">${e.amount.toFixed(2)}</span>
                    <button onClick={() => deletePersonalExpense(e.id)} className="text-red-400"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
              <button onClick={() => {
                const name = prompt('Nombre del gasto:');
                if (!name) return;
                const amount = parseFloat(prompt('Monto:') || '0');
                if (amount <= 0) return;
                addPersonalExpense({ id: Date.now().toString(), name, category: 'other', amount, frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd'), isActive: true });
              }} className="w-full py-2 mt-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-sm">
                <i className="fas fa-plus mr-2"></i>Agregar Gasto
              </button>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="font-semibold mb-3">Deudas ({personalDebts.length})</h3>
              {personalDebts.map(d => (
                <div key={d.id} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span>{d.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">${d.totalAmount.toFixed(2)}</span>
                    <button onClick={() => deletePersonalDebt(d.id)} className="text-red-400"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'decimo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Décimo Cuarto</h2>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <p className="text-slate-400 text-sm mb-4">El décimo se calcula automáticamente el día 1 de cada mes basado en: Sueldo Base + Horas Extras</p>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  ${(parseFloat(localStorage.getItem('asistencia_hl_salary') || '0') * 2).toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">Décimo proyectado (2 sueldos)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reportes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Reportes</h2>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="font-semibold mb-3">Estadísticas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Total registros:</span><span className="font-bold">{records.length}</span></div>
                <div className="flex justify-between"><span>Horas este mes:</span><span className="font-bold">{projection.monthly}h</span></div>
                <div className="flex justify-between"><span>Horas este trimestre:</span><span className="font-bold">{projection.quarterly}h</span></div>
                <div className="flex justify-between"><span>Feriados registrados:</span><span className="font-bold">{holidays.length}</span></div>
                <div className="flex justify-between"><span>Bonos activos:</span><span className="font-bold">{bonuses.length}</span></div>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 z-40">
        <div className="max-w-4xl mx-auto flex">
          {[
            { id: 'registro', icon: 'fa-home', label: 'Inicio' },
            { id: 'historial', icon: 'fa-history', label: 'Historial' },
            { id: 'reportes', icon: 'fa-chart-bar', label: 'Reportes' },
            { id: 'pago', icon: 'fa-money-bill-wave', label: 'Pago' },
            { id: 'finanzas', icon: 'fa-wallet', label: 'Finanzas' },
            { id: 'balance', icon: 'fa-balance-scale', label: 'Balance' },
            { id: 'decimo', icon: 'fa-gift', label: 'Décimo' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-400'}`}>
              <i className={`fas ${tab.icon} text-base`}></i>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
