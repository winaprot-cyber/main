import { useState, useEffect, useRef } from 'react';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { AttendanceRecord, PersonalExpense, PersonalDebt, ExpensePayment, DebtPayment, Holiday, Bonus, Discount } from './types';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, getISOWeek, isWithinInterval, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateHoursWorked, isWeekend, isHoliday, getDayOfWeekName, getWeekNumber, generateId } from './utils/calculations';
import { generateExpenseCard, generateDebtCard, generatePaymentReceipt, downloadCard, shareCardWhatsApp } from './utils/cardGenerator';

const EXPENSE_CATEGORIES = {
  utilities: { label: 'Servicios', icon: '⚡', color: '#f59e0b' },
  rent: { label: 'Arriendo', icon: '🏠', color: '#ef4444' },
  food: { label: 'Alimentación', icon: '🍽️', color: '#10b981' },
  transport: { label: 'Transporte', icon: '🚗', color: '#3b82f6' },
  entertainment: { label: 'Entretenimiento', icon: '🎬', color: '#8b5cf6' },
  health: { label: 'Salud', icon: '❤️', color: '#ec4899' },
  education: { label: 'Educación', icon: '🎓', color: '#06b6d4' },
  other: { label: 'Otros', icon: '📦', color: '#64748b' }
};

const DEBT_TYPES = {
  bank: { label: 'Bancaria', icon: '🏦', color: '#3b82f6' },
  personal: { label: 'Particular', icon: '👤', color: '#8b5cf6' },
  credit_card: { label: 'Tarjeta', icon: '💳', color: '#ef4444' },
  quirurgico: { label: 'Quirúrgico', icon: '🏥', color: '#f59e0b' },
  other: { label: 'Otro', icon: '📋', color: '#64748b' }
};

export default function App() {
  const storage = useAttendanceStorage();
  const [activeTab, setActiveTab] = useState<'home' | 'balance'>('home');
  const [balanceTab, setBalanceTab] = useState<'expenses' | 'debts'>('expenses');
  
  // Home states
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  
  // Record form states
  const [recordDate, setRecordDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryTime, setEntryTime] = useState('08:00');
  const [exitTime, setExitTime] = useState('17:00');
  
  // Balance states
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ type: 'expense' | 'debt', id: string } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Expense form states
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<keyof typeof EXPENSE_CATEGORIES>('utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  
  // Debt form states
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState<keyof typeof DEBT_TYPES>('bank');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  
  // Calculate current week
  const currentDate = new Date();
  const selectedDate = addWeeks(currentDate, selectedWeekOffset);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekNumber = getWeekNumber(selectedDate);
  
  // Get weekly summary
  const weeklySummary = storage.records.length > 0 
    ? (() => {
        const weekRecords = storage.records.filter(r => 
          isWithinInterval(parseISO(r.date), { start: weekStart, end: weekEnd })
        );
        
        const weekdayHours = weekRecords.filter(r => !r.isWeekend && !r.isHoliday).reduce((sum, r) => sum + r.hoursWorked, 0);
        const weekendHours = weekRecords.filter(r => r.isWeekend && !r.isHoliday).reduce((sum, r) => sum + r.hoursWorked, 0);
        const holidayHours = weekRecords.filter(r => r.isHoliday).reduce((sum, r) => sum + r.hoursWorked, 0);
        const weekdayHolidayHours = weekRecords.filter(r => r.isHoliday && !r.isWeekend).reduce((sum, r) => sum + r.hoursWorked, 0);
        
        const totalHours = weekdayHours + weekendHours + holidayHours;
        const effectiveWeekdayHours = weekdayHours + weekdayHolidayHours;
        
        let percentage = 0;
        if (effectiveWeekdayHours >= 45) percentage = 100;
        else if (weekendHours > 0 || holidayHours > 0) percentage = 50;
        else percentage = Math.round((effectiveWeekdayHours / 45) * 100);
        
        return {
          weekStart: format(weekStart, 'yyyy-MM-dd'),
          weekEnd: format(weekEnd, 'yyyy-MM-dd'),
          totalHours: Math.round(totalHours * 100) / 100,
          weekdayHours: Math.round(weekdayHours * 100) / 100,
          weekendHours: Math.round(weekendHours * 100) / 100,
          holidayHours: Math.round(holidayHours * 100) / 100,
          percentage,
          records: weekRecords
        };
      })()
    : {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        totalHours: 0,
        weekdayHours: 0,
        weekendHours: 0,
        holidayHours: 0,
        percentage: 0,
        records: []
      };
  
  // Handle record save
  const handleSaveRecord = () => {
    const hoursWorked = calculateHoursWorked(entryTime, exitTime);
    const weekend = isWeekend(recordDate);
    const holiday = isHoliday(recordDate, storage.holidays);
    
    const record: AttendanceRecord = {
      id: generateId(),
      date: recordDate,
      dayOfWeek: new Date(recordDate + 'T00:00:00').getDay(),
      entryTime,
      exitTime,
      hoursWorked,
      isWeekend: weekend,
      isHoliday: holiday
    };
    
    storage.addRecord(record);
    setShowRecordForm(false);
    setEntryTime('08:00');
    setExitTime('17:00');
  };
  
  // Handle expense add
  const handleAddExpense = () => {
    if (!expenseName || !expenseAmount) return;
    
    const expense: PersonalExpense = {
      id: generateId(),
      name: expenseName,
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      frequency: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
      paidAmount: 0,
      payments: []
    };
    
    storage.addPersonalExpense(expense);
    setExpenseName('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };
  
  // Handle debt add
  const handleAddDebt = () => {
    if (!debtName || !debtTotal || !debtMonthly) return;
    
    const debt: PersonalDebt = {
      id: generateId(),
      name: debtName,
      type: debtType,
      totalAmount: parseFloat(debtTotal),
      monthlyPayment: parseFloat(debtMonthly),
      startDate: format(new Date(), 'yyyy-MM-dd'),
      paidAmount: 0,
      payments: []
    };
    
    storage.addPersonalDebt(debt);
    setDebtName('');
    setDebtTotal('');
    setDebtMonthly('');
    setShowDebtForm(false);
  };
  
  // Handle file change for receipt
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPaymentReceipt(base64);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle payment
  const handlePayment = () => {
    if (!showPaymentModal || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    const paymentDate = format(new Date(), 'yyyy-MM-dd');

    if (showPaymentModal.type === 'expense') {
      const expense = storage.personalExpenses.find(e => e.id === showPaymentModal.id);
      if (!expense) return;

      const payment: ExpensePayment = {
        id: generateId(),
        amount,
        date: paymentDate,
        notes: paymentNotes || undefined,
        receiptPhoto: paymentReceipt || undefined
      };

      const newPaidAmount = (expense.paidAmount || 0) + amount;
      
      storage.updatePersonalExpense(expense.id, {
        paidAmount: newPaidAmount,
        payments: [...(expense.payments || []), payment]
      });

      const receiptDataUrl = generatePaymentReceipt(
        'expense',
        expense.name,
        amount,
        newPaidAmount,
        expense.amount,
        paymentDate,
        paymentNotes,
        paymentReceipt
      );

      setTimeout(() => {
        const share = confirm('✅ Pago registrado\n\n¿Compartir comprobante por WhatsApp?');
        if (share) {
          shareCardWhatsApp(receiptDataUrl, `Pago: ${expense.name}`);
        }
      }, 500);

    } else {
      const debt = storage.personalDebts.find(d => d.id === showPaymentModal.id);
      if (!debt) return;

      const payment: DebtPayment = {
        id: generateId(),
        amount,
        date: paymentDate,
        notes: paymentNotes || undefined,
        receiptPhoto: paymentReceipt || undefined
      };

      const newPaidAmount = debt.paidAmount + amount;
      
      storage.updatePersonalDebt(debt.id, {
        paidAmount: newPaidAmount,
        payments: [...(debt.payments || []), payment]
      });

      const receiptDataUrl = generatePaymentReceipt(
        'debt',
        debt.name,
        amount,
        newPaidAmount,
        debt.totalAmount,
        paymentDate,
        paymentNotes,
        paymentReceipt
      );

      setTimeout(() => {
        const share = confirm('✅ Pago registrado\n\n¿Compartir comprobante por WhatsApp?');
        if (share) {
          shareCardWhatsApp(receiptDataUrl, `Pago: ${debt.name}`);
        }
      }, 500);
    }

    setShowPaymentModal(null);
    setPaymentAmount('');
    setPaymentNotes('');
    setPaymentReceipt('');
  };
  
  // Calculate totals
  const totalExpenses = storage.personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaidExpenses = storage.personalExpenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
  const totalDebts = storage.personalDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaidDebts = storage.personalDebts.reduce((sum, d) => sum + d.paidAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Control de Asistencia
                </h1>
                <p className="text-xs text-slate-400">Creador by Hugo Leon</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'home'
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                }`}
              >
                🏠 Inicio
              </button>
              <button
                onClick={() => setActiveTab('balance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'balance'
                    ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                }`}
              >
                💼 Balance
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'home' ? (
          <div className="space-y-6">
            {/* Week Selector */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span>📅</span>
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
                  ◀
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
                  ▶
                </button>
              </div>
              {selectedWeekOffset !== 0 && (
                <button
                  onClick={() => setSelectedWeekOffset(0)}
                  className="w-full mt-2 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-xs font-medium text-cyan-300 transition-all"
                >
                  ↺ Volver a semana actual
                </button>
              )}
            </div>

            {/* Weekly Summary */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span>📊</span>
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
                    {Math.max(0, 45 - weeklySummary.totalHours)}h
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
                  <span className="text-cyan-400 font-semibold">{Math.min(100, Math.round((weeklySummary.totalHours / 45) * 100))}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      weeklySummary.totalHours >= 45 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, (weeklySummary.totalHours / 45) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Record Form */}
            {!showRecordForm ? (
              <button
                onClick={() => setShowRecordForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-semibold text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                ➕ Registrar Asistencia
              </button>
            ) : (
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>✏️</span>
                  Nuevo Registro
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">
                      <span>📅</span> Fecha
                    </label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">
                      <span>🟢</span> Hora de Ingreso
                    </label>
                    <input
                      type="time"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">
                      <span>🔴</span> Hora de Salida
                    </label>
                    <input
                      type="time"
                      value={exitTime}
                      onChange={(e) => setExitTime(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                      required
                    />
                  </div>

                  <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Horas calculadas:</span>
                      <span className="text-xl font-bold text-cyan-400">{calculateHoursWorked(entryTime, exitTime)}h</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRecordForm(false)}
                      className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRecord}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-medium text-white shadow-lg transition-all"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Records */}
            {weeklySummary.records.length > 0 && (
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📋</span>
                  Registros de la Semana
                </h3>
                <div className="space-y-2">
                  {weeklySummary.records.map(record => (
                    <div key={record.id} className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          record.isHoliday
                            ? 'bg-amber-500/20 border border-amber-500/30'
                            : record.isWeekend 
                            ? 'bg-purple-500/20 border border-purple-500/30' 
                            : 'bg-blue-500/20 border border-blue-500/30'
                        }`}>
                          <span className="text-lg">
                            {record.isHoliday ? '🏖️' : record.isWeekend ? '🌅' : '💼'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-white">
                            {format(parseISO(record.date), "EEEE d 'de' MMMM", { locale: es })}
                            {record.isHoliday && <span className="ml-2 text-xs text-amber-400">(Feriado)</span>}
                          </div>
                          <div className="text-xs text-slate-400">
                            {record.entryTime} - {record.exitTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-cyan-400">{record.hoursWorked}h</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Balance Summary */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📊</span>
                Balance Personal - {format(new Date(), "MMMM yyyy", { locale: es })}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Gastos Totales</div>
                  <div className="text-xl font-bold text-rose-400">${totalExpenses.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Gastos Pagados</div>
                  <div className="text-xl font-bold text-green-400">${totalPaidExpenses.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Deudas Totales</div>
                  <div className="text-xl font-bold text-amber-400">${totalDebts.toFixed(2)}</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Deudas Pagadas</div>
                  <div className="text-xl font-bold text-green-400">${totalPaidDebts.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Balance Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBalanceTab('expenses')}
                className={`py-3 rounded-xl font-medium transition-all ${
                  balanceTab === 'expenses'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 border'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                }`}
              >
                📄 Gastos ({storage.personalExpenses.length})
              </button>
              <button
                onClick={() => setBalanceTab('debts')}
                className={`py-3 rounded-xl font-medium transition-all ${
                  balanceTab === 'debts'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 border'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                }`}
              >
                💳 Deudas ({storage.personalDebts.length})
              </button>
            </div>

            {/* Expenses Tab */}
            {balanceTab === 'expenses' && (
              <div className="space-y-3">
                {!showExpenseForm ? (
                  <button
                    onClick={() => setShowExpenseForm(true)}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    ➕ Agregar Gasto
                  </button>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-amber-500/30">
                    <h3 className="text-lg font-semibold mb-4">Nuevo Gasto</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        placeholder="Nombre del gasto"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      />
                      <select
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value as any)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      >
                        {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (
                          <option key={key} value={key}>{val.icon} {val.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="Monto"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowExpenseForm(false)}
                          className="flex-1 py-3 bg-slate-700 rounded-xl font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAddExpense}
                          className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl font-medium"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {storage.personalExpenses.map(expense => {
                  const categoryInfo = EXPENSE_CATEGORIES[expense.category];
                  const paidAmount = expense.paidAmount || 0;
                  const netAmount = expense.amount - paidAmount;
                  const progress = (paidAmount / expense.amount) * 100;

                  return (
                    <div key={expense.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${categoryInfo.color}20` }}>
                            <span className="text-2xl">{categoryInfo.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{expense.name}</h4>
                            <p className="text-xs text-slate-400">{categoryInfo.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: categoryInfo.color }}>
                            ${netAmount.toFixed(2)}
                          </div>
                          {paidAmount > 0 && (
                            <div className="text-xs text-slate-500">
                              Pagado: ${paidAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowPaymentModal({ type: 'expense', id: expense.id });
                            setPaymentAmount(netAmount.toFixed(2));
                          }}
                          className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-medium text-green-300 transition-all"
                        >
                          💵 Pagar
                        </button>
                        <button
                          onClick={() => {
                            const card = generateExpenseCard(expense);
                            downloadCard(card, `gasto-${expense.name}.png`);
                          }}
                          className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-300 transition-all"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => {
                            const card = generateExpenseCard(expense);
                            shareCardWhatsApp(card, expense.name);
                          }}
                          className="py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => storage.deletePersonalExpense(expense.id)}
                          className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Debts Tab */}
            {balanceTab === 'debts' && (
              <div className="space-y-3">
                {!showDebtForm ? (
                  <button
                    onClick={() => setShowDebtForm(true)}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    ➕ Agregar Deuda
                  </button>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-purple-500/30">
                    <h3 className="text-lg font-semibold mb-4">Nueva Deuda</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={debtName}
                        onChange={(e) => setDebtName(e.target.value)}
                        placeholder="Nombre de la deuda"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      />
                      <select
                        value={debtType}
                        onChange={(e) => setDebtType(e.target.value as any)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      >
                        {Object.entries(DEBT_TYPES).map(([key, val]) => (
                          <option key={key} value={key}>{val.icon} {val.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={debtTotal}
                        onChange={(e) => setDebtTotal(e.target.value)}
                        placeholder="Monto total"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      />
                      <input
                        type="number"
                        value={debtMonthly}
                        onChange={(e) => setDebtMonthly(e.target.value)}
                        placeholder="Pago mensual"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDebtForm(false)}
                          className="flex-1 py-3 bg-slate-700 rounded-xl font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAddDebt}
                          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-medium"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {storage.personalDebts.map(debt => {
                  const typeInfo = DEBT_TYPES[debt.type];
                  const pending = debt.totalAmount - debt.paidAmount;
                  const progress = (debt.paidAmount / debt.totalAmount) * 100;

                  return (
                    <div key={debt.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${typeInfo.color}20` }}>
                            <span className="text-2xl">{typeInfo.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{debt.name}</h4>
                            <p className="text-xs text-slate-400">{typeInfo.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: typeInfo.color }}>
                            ${pending.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Mensual: ${debt.monthlyPayment.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowPaymentModal({ type: 'debt', id: debt.id });
                            setPaymentAmount(debt.monthlyPayment.toFixed(2));
                          }}
                          className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-medium text-green-300 transition-all"
                        >
                          💵 Pagar
                        </button>
                        <button
                          onClick={() => {
                            const card = generateDebtCard(debt);
                            downloadCard(card, `deuda-${debt.name}.png`);
                          }}
                          className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-300 transition-all"
                        >
                          📥
                        </button>
                        <button
                          onClick={() => {
                            const card = generateDebtCard(debt);
                            shareCardWhatsApp(card, debt.name);
                          }}
                          className="py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-all"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => storage.deletePersonalDebt(debt.id)}
                          className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
            <div className="p-5 border-b border-slate-700">
              <h3 className="text-xl font-bold">💰 Registrar Pago</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Monto</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Notas</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">📷 Foto de Factura (opcional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 rounded-xl text-slate-400 transition-all"
                >
                  {paymentReceipt ? '✅ Foto cargada (clic para cambiar)' : '📷 Subir foto de factura'}
                </button>
                {paymentReceipt && (
                  <img src={paymentReceipt} alt="Factura" className="mt-2 rounded-xl max-h-48 object-cover w-full" />
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(null);
                  setPaymentAmount('');
                  setPaymentNotes('');
                  setPaymentReceipt('');
                }}
                className="flex-1 py-3 bg-slate-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl font-medium"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
