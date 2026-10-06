import { useState } from 'react';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { getWeeklySummary, getProjection, getWeeklyDataForChart, getMonthlyDataForChart, getWeekNumber } from './utils/calculations';
import { exportDatabase, importDatabase, downloadOfflineApp } from './utils/database';
import { AttendanceRecord } from './types';
import { RecordList } from './components/RecordList';
import { WelcomeModal } from './components/WelcomeModal';
import { startOfWeek, endOfWeek, addWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';

type Tab = 'registro' | 'historial' | 'reportes' | 'pago' | 'finanzas' | 'balance' | 'decimo';

export default function App() {
  const {
    records, holidays, bonuses, discounts, personalDebts, personalExpenses, monthlyBalances,
    addRecord, updateRecord, deleteRecord, clearAllRecords, removeDuplicates,
    addHoliday, deleteHoliday,
    addBonus, deleteBonus,
    addDiscount, updateDiscount, deleteDiscount,
    addPersonalDebt, updatePersonalDebt, deletePersonalDebt,
    addPersonalExpense, updatePersonalExpense, deletePersonalExpense,
    addMonthlyBalance, getMonthlyBalance
  } = useAttendanceStorage();

  const [activeTab, setActiveTab] = useState<Tab>('registro');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);

  const currentDate = new Date();
  const selectedDate = addWeeks(currentDate, selectedWeekOffset);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekNumber = getWeekNumber(selectedDate);

  const weeklySummary = getWeeklySummary(records, selectedDate);
  const projection = getProjection(records);
  const weeklyChartData = getWeeklyDataForChart(records, selectedDate);
  const monthlyChartData = getMonthlyDataForChart(records);

  const handleExportData = () => {
    const success = exportDatabase();
    if (success) {
      alert('✅ Base de datos exportada exitosamente!');
    } else {
      alert('❌ Error al exportar la base de datos');
    }
  };

  const handleImportData = async () => {
    await importDatabase();
  };

  const handleDownloadApp = async () => {
    try {
      await downloadOfflineApp();
      alert('✅ ¡Aplicación descargada exitosamente!');
    } catch (error) {
      console.error('Error al descargar la app:', error);
      alert('❌ Error al descargar la aplicación.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <i className="fas fa-clock text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  CONTROL DE ASISTENCIA
                </h1>
                <p className="text-xs text-slate-400">Creador by Hugo Leon</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-400">Semana actual</div>
                <div className="text-sm font-semibold text-cyan-300">{weeklySummary.totalHours}h / 45h</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'registro' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h2 className="text-lg font-semibold mb-4">Registro de Asistencia - Semana {weekNumber}</h2>
              <p className="text-slate-400">Total horas: {weeklySummary.totalHours}h</p>
            </div>
          </div>
        )}

        {activeTab === 'historial' && (
          <RecordList
            records={records}
            onEdit={(record) => console.log('Edit', record)}
            onDelete={deleteRecord}
            onClearAll={clearAllRecords}
            onRemoveDuplicates={removeDuplicates}
          />
        )}

        {activeTab === 'balance' && (
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h2 className="text-lg font-semibold mb-4">Balance Personal</h2>
            <p className="text-slate-400">Funcionalidad de balance con fichas elegantes y fotos de respaldo</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 z-40">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('registro')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'registro' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <i className="fas fa-home text-base"></i>
            <span className="text-[10px] font-medium">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'historial' ? 'text-cyan-400' : 'text-slate-400'}`}
          >
            <i className="fas fa-history text-base"></i>
            <span className="text-[10px] font-medium">Historial</span>
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'balance' ? 'text-amber-400' : 'text-slate-400'}`}
          >
            <i className="fas fa-balance-scale text-base"></i>
            <span className="text-[10px] font-medium">Balance</span>
          </button>
        </div>
      </nav>

      <WelcomeModal />
    </div>
  );
}
