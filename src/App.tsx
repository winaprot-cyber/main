import { useState, useEffect } from 'react';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { getWeeklySummary, getProjection, getWeeklyDataForChart, getMonthlyDataForChart, getWeekNumber } from './utils/calculations';
import { exportDatabase, importDatabase, downloadOfflineApp, downloadProjectFiles } from './utils/database';
import { processMonthChange } from './utils/monthlyBaseCalculator';
import { AttendanceRecord } from './types';
import { WeeklyChart } from './components/WeeklyChart';
import { MonthlyChart } from './components/MonthlyChart';
import { RecordForm } from './components/RecordForm';
import { RecordList } from './components/RecordList';
import { Summary } from './components/Summary';
import { ProjectionPanel } from './components/ProjectionPanel';
import { ProjectionPay } from './components/ProjectionPay';
import { DecimoCuarto } from './components/DecimoCuarto';
import { FinancialManager } from './components/FinancialManager';
import { HolidayManager } from './components/HolidayManager';
import { BalancePersonal } from './components/BalancePersonal';
import { WelcomeModal } from './components/WelcomeModal';
import { OptionsMenu } from './components/OptionsMenu';
import { ThemeSelector } from './components/ThemeSelector';
import { ContactInfo } from './components/ContactInfo';
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
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const currentDate = new Date();
  const selectedDate = addWeeks(currentDate, selectedWeekOffset);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekNumber = getWeekNumber(selectedDate);

  // Leer fechas de configuración de pago
  const payStartDate = localStorage.getItem('asistencia_hl_selected_week_start') || undefined;
  const payEndDate = localStorage.getItem('asistencia_hl_selected_week_end') || undefined;

  const weeklySummary = getWeeklySummary(records, selectedDate);
  const projection = getProjection(records);
  const weeklyChartData = getWeeklyDataForChart(records, selectedDate);
  const monthlyChartData = getMonthlyDataForChart(records, payStartDate, payEndDate);

  // Detectar cambio de mes automático (día 1 de cada mes)
  useEffect(() => {
    const salary = parseFloat(localStorage.getItem('asistencia_hl_salary') || '0');
    
    if (salary > 0 && records.length > 0) {
      const result = processMonthChange(salary, records);
      
      if (result.processed) {
        console.log(`✅ Cambio de mes procesado automáticamente`);
        console.log(`   Mes anterior: ${result.previousMonth}`);
        console.log(`   Base para décimo: $${result.baseAmount?.toFixed(2)}`);
      }
    }
  }, [records]);

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleSave = (record: AttendanceRecord) => {
    if (editingRecord) {
      updateRecord(editingRecord.id, record);
    } else {
      addRecord(record);
    }
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

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

  const handleDownloadProject = async () => {
    try {
      const success = await downloadProjectFiles();
      if (success) {
        alert('✅ ¡Proyecto completo descargado exitosamente!');
      } else {
        alert('❌ Error al descargar el proyecto.');
      }
    } catch (error) {
      console.error('Error al descargar el proyecto:', error);
      alert('❌ Error al descargar el proyecto.');
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
              <OptionsMenu
                onExportData={handleExportData}
                onImportData={handleImportData}
                onDownloadApp={handleDownloadApp}
                onDownloadProject={handleDownloadProject}
                onChangeTheme={() => setShowThemeSelector(true)}
                onShowContact={() => setShowContactInfo(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'registro' && (
          <div className="space-y-6">
            {/* Selector de semana */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <i className="fas fa-calendar-week text-cyan-400"></i>
                  Seleccionar Semana
                </h3>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">
                  Semana {weekNumber} del año
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedWeekOffset(prev => prev - 1)}
                  className="flex-shrink-0 w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-all"
                >
                  <i className="fas fa-chevron-left text-slate-300"></i>
                </button>
                <div className="flex-1 text-center">
                  <div className="text-sm font-semibold text-white">
                    {format(weekStart, 'dd MMM', { locale: es })} - {format(weekEnd, 'dd MMM yyyy', { locale: es })}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedWeekOffset === 0 ? 'Semana actual' : selectedWeekOffset === -1 ? 'Semana pasada' : `${Math.abs(selectedWeekOffset)} semanas ${selectedWeekOffset < 0 ? 'atrás' : 'adelante'}`}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWeekOffset(prev => prev + 1)}
                  className="flex-shrink-0 w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center transition-all"
                >
                  <i className="fas fa-chevron-right text-slate-300"></i>
                </button>
              </div>
              {selectedWeekOffset !== 0 && (
                <button
                  onClick={() => setSelectedWeekOffset(0)}
                  className="w-full mt-2 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-xs font-medium text-cyan-300 transition-all"
                >
                  <i className="fas fa-undo mr-1"></i>
                  Volver a semana actual
                </button>
              )}
            </div>

            <Summary weeklySummary={weeklySummary} weekNumber={weekNumber} />

            {/* Gestor de Feriados */}
            <HolidayManager
              holidays={holidays}
              onAdd={addHoliday}
              onDelete={deleteHoliday}
            />

            {weeklySummary.totalHours > 45 && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-400"></i>
                  </div>
                  <div>
                    <p className="text-green-300 font-semibold text-sm">¡Meta alcanzada!</p>
                    <p className="text-green-200/70 text-xs">Has trabajado más de 45h esta semana. Desempeño al 100%</p>
                  </div>
                </div>
              </div>
            )}

            <WeeklyChart data={weeklyChartData} />

            <ProjectionPanel projection={projection} />

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-semibold text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Registrar Asistencia
              </button>
            ) : (
              <RecordForm
                onSave={handleSave}
                onCancel={handleCancel}
                editingRecord={editingRecord}
                existingRecords={records}
                holidays={holidays}
              />
            )}
          </div>
        )}

        {activeTab === 'historial' && (
          <RecordList
            records={records}
            onEdit={handleEdit}
            onDelete={deleteRecord}
            onClearAll={clearAllRecords}
            onRemoveDuplicates={removeDuplicates}
          />
        )}

        {activeTab === 'reportes' && (
          <div className="space-y-6">
            <ProjectionPanel projection={projection} />
            <WeeklyChart data={weeklyChartData} />
            <MonthlyChart 
              data={monthlyChartData} 
              startDate={payStartDate} 
              endDate={payEndDate} 
            />
            
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-chart-pie text-cyan-400"></i>
                Resumen de Proyección
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{projection.weekly}h</div>
                  <div className="text-xs text-slate-400 mt-1">Semanal</div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{projection.monthly}h</div>
                  <div className="text-xs text-slate-400 mt-1">Mensual</div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{projection.quarterly}h</div>
                  <div className="text-xs text-slate-400 mt-1">Trimestral</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pago' && (
          <ProjectionPay
            records={records}
            bonuses={bonuses}
            discounts={discounts}
            holidays={holidays}
          />
        )}

        {activeTab === 'finanzas' && (
          <FinancialManager
            records={records}
            bonuses={bonuses}
            discounts={discounts}
            onAddBonus={addBonus}
            onDeleteBonus={deleteBonus}
            onAddDiscount={addDiscount}
            onUpdateDiscount={updateDiscount}
            onDeleteDiscount={deleteDiscount}
          />
        )}

        {activeTab === 'balance' && (
          <BalancePersonal
            personalDebts={personalDebts}
            personalExpenses={personalExpenses}
            records={records}
            bonuses={bonuses}
            monthlyBalances={monthlyBalances}
            onAddDebt={addPersonalDebt}
            onUpdateDebt={updatePersonalDebt}
            onDeleteDebt={deletePersonalDebt}
            onAddExpense={addPersonalExpense}
            onUpdateExpense={updatePersonalExpense}
            onDeleteExpense={deletePersonalExpense}
            onAddMonthlyBalance={addMonthlyBalance}
            getMonthlyBalance={getMonthlyBalance}
          />
        )}

        {activeTab === 'decimo' && (
          <DecimoCuarto />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 z-40">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('registro')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'registro' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-home text-base ${activeTab === 'registro' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Inicio</span>
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'historial' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-history text-base ${activeTab === 'historial' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Historial</span>
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'reportes' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-chart-bar text-base ${activeTab === 'reportes' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Reportes</span>
          </button>
          <button
            onClick={() => setActiveTab('pago')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'pago' ? 'text-green-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-money-bill-wave text-base ${activeTab === 'pago' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Pago</span>
          </button>
          <button
            onClick={() => setActiveTab('finanzas')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'finanzas' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-wallet text-base ${activeTab === 'finanzas' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Finanzas</span>
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'balance' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-balance-scale text-base ${activeTab === 'balance' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Balance</span>
          </button>
          <button
            onClick={() => setActiveTab('decimo')}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${activeTab === 'decimo' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <i className={`fas fa-gift text-base ${activeTab === 'decimo' ? 'scale-110' : ''} transition-transform`}></i>
            <span className="text-[10px] font-medium">Décimo</span>
          </button>
        </div>
      </nav>

      {showThemeSelector && (
        <ThemeSelector onClose={() => setShowThemeSelector(false)} />
      )}

      {showContactInfo && (
        <ContactInfo onClose={() => setShowContactInfo(false)} />
      )}

      <WelcomeModal />
    </div>
  );
}
