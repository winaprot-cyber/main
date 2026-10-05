import { useState, useEffect, useRef } from 'react';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { AttendanceRecord, PersonalExpense, PersonalDebt, Holiday, Bonus, Discount } from './types';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addWeeks, getISOWeek, isWithinInterval, getDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateHoursWorked, isWeekend, isHoliday, getDayOfWeekName, getWeekNumber, generateId } from './utils/calculations';
import { generateExpenseCard, generateDebtCard, generatePaymentReceipt, downloadCard, shareCardWhatsApp } from './utils/cardGenerator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const EXPENSE_CATEGORIES = {
  utilities: { label: 'Servicios', icon: 'fa-bolt', color: '#f59e0b' },
  rent: { label: 'Arriendo', icon: 'fa-home', color: '#ef4444' },
  food: { label: 'Alimentación', icon: 'fa-utensils', color: '#10b981' },
  transport: { label: 'Transporte', icon: 'fa-car', color: '#3b82f6' },
  entertainment: { label: 'Entretenimiento', icon: 'fa-film', color: '#8b5cf6' },
  health: { label: 'Salud', icon: 'fa-heartbeat', color: '#ec4899' },
  education: { label: 'Educación', icon: 'fa-graduation-cap', color: '#06b6d4' },
  other: { label: 'Otros', icon: 'fa-ellipsis-h', color: '#64748b' }
};

const DEBT_TYPES = {
  bank: { label: 'Bancaria', icon: 'fa-university', color: '#3b82f6' },
  personal: { label: 'Particular', icon: 'fa-user', color: '#8b5cf6' },
  credit_card: { label: 'Tarjeta', icon: 'fa-credit-card', color: '#ef4444' },
  quirurgico: { label: 'Quirúrgico', icon: 'fa-hospital', color: '#f59e0b' },
  other: { label: 'Otro', icon: 'fa-question', color: '#64748b' }
};

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#64748b'];

export default function App() {
  const storage = useAttendanceStorage();
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'reports' | 'pay' | 'finance' | 'balance' | 'decimo'>('home');
  const [balanceTab, setBalanceTab] = useState<'expenses' | 'debts'>('expenses');
  
  // Home states
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
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
  
  // Finance states
  const [financeTab, setFinanceTab] = useState<'bonuses' | 'discounts'>('bonuses');
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusName, setBonusName] = useState('');
  const [bonusType, setBonusType] = useState<'fixed' | 'variable' | 'fondo_reserva'>('fixed');
  const [bonusAmount, setBonusAmount] = useState('');
  
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountName, setDiscountName] = useState('');
  const [discountType, setDiscountType] = useState<'loan' | 'rol' | 'quirurgico' | 'iess' | 'iess_aporte' | 'other'>('loan');
  const [discountTotal, setDiscountTotal] = useState('');
  const [discountPayments, setDiscountPayments] = useState('');
  const [discountPaymentAmount, setDiscountPaymentAmount] = useState('');
  
  // Pay states
  const [salary, setSalary] = useState(() => parseFloat(localStorage.getItem('asistencia_hl_salary') || '0'));
  const [rate100, setRate100] = useState(() => parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39'));
  const [rate50, setRate50] = useState(() => parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29'));
  const [quincena, setQuincena] = useState(() => parseFloat(localStorage.getItem('asistencia_hl_quincena') || '0'));
  
  // Decimo states
  const DECIMO_MONTHS = ['Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
  const [decimoValues, setDecimoValues] = useState<number[]>(() => {
    const stored = localStorage.getItem('asistencia_hl_decimo');
    return stored ? JSON.parse(stored) : Array(12).fill(0);
  });
  
  // Calculate current week
  const currentDate = new Date();
  const selectedDate = addWeeks(currentDate, selectedWeekOffset);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekNumber = getWeekNumber(selectedDate);
  
  // Save settings to localStorage
  useEffect(() => { localStorage.setItem('asistencia_hl_salary', salary.toString()); }, [salary]);
  useEffect(() => { localStorage.setItem('asistencia_hl_rate100', rate100.toString()); }, [rate100]);
  useEffect(() => { localStorage.setItem('asistencia_hl_rate50', rate50.toString()); }, [rate50]);
  useEffect(() => { localStorage.setItem('asistencia_hl_quincena', quincena.toString()); }, [quincena]);
  useEffect(() => { localStorage.setItem('asistencia_hl_decimo', JSON.stringify(decimoValues)); }, [decimoValues]);
  
  // Get weekly summary
  const weeklySummary = storage.records.length > 0 
    ? (() => {
        const weekRecords = storage.records.filter(r => isWithinInterval(parseISO(r.date), { start: weekStart, end: weekEnd }));
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
        return { weekStart: format(weekStart, 'yyyy-MM-dd'), weekEnd: format(weekEnd, 'yyyy-MM-dd'), totalHours: Math.round(totalHours * 100) / 100, weekdayHours: Math.round(weekdayHours * 100) / 100, weekendHours: Math.round(weekendHours * 100) / 100, holidayHours: Math.round(holidayHours * 100) / 100, percentage, records: weekRecords };
      })()
    : { weekStart: format(weekStart, 'yyyy-MM-dd'), weekEnd: format(weekEnd, 'yyyy-MM-dd'), totalHours: 0, weekdayHours: 0, weekendHours: 0, holidayHours: 0, percentage: 0, records: [] };
  
  // Handlers
  const handleSaveRecord = () => {
    const hoursWorked = calculateHoursWorked(entryTime, exitTime);
    const weekend = isWeekend(recordDate);
    const holiday = isHoliday(recordDate, storage.holidays);
    const record: AttendanceRecord = { id: generateId(), date: recordDate, dayOfWeek: new Date(recordDate + 'T00:00:00').getDay(), entryTime, exitTime, hoursWorked, isWeekend: weekend, isHoliday: holiday };
    storage.addRecord(record);
    setShowRecordForm(false);
    setEntryTime('08:00');
    setExitTime('17:00');
  };
  
  const handleAddHoliday = () => {
    if (!holidayName || !holidayDate) return;
    const holiday: Holiday = { id: generateId(), date: holidayDate, name: holidayName, year: new Date(holidayDate).getFullYear() };
    storage.addHoliday(holiday);
    setHolidayName('');
    setHolidayDate(format(new Date(), 'yyyy-MM-dd'));
    setShowHolidayForm(false);
  };
  
  const handleAddExpense = () => {
    if (!expenseName || !expenseAmount) return;
    const expense: PersonalExpense = { id: generateId(), name: expenseName, category: expenseCategory, amount: parseFloat(expenseAmount), frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd'), isActive: true, paidAmount: 0, payments: [] };
    storage.addPersonalExpense(expense);
    setExpenseName('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };
  
  const handleAddDebt = () => {
    if (!debtName || !debtTotal || !debtMonthly) return;
    const debt: PersonalDebt = { id: generateId(), name: debtName, type: debtType, totalAmount: parseFloat(debtTotal), monthlyPayment: parseFloat(debtMonthly), startDate: format(new Date(), 'yyyy-MM-dd'), paidAmount: 0, payments: [] };
    storage.addPersonalDebt(debt);
    setDebtName('');
    setDebtTotal('');
    setDebtMonthly('');
    setShowDebtForm(false);
  };
  
  const handleAddBonus = () => {
    if (!bonusName || !bonusAmount) return;
    const bonus: Bonus = { id: generateId(), name: bonusName, type: bonusType, amount: parseFloat(bonusAmount), startDate: format(new Date(), 'yyyy-MM-dd') };
    storage.addBonus(bonus);
    setBonusName('');
    setBonusAmount('');
    setShowBonusForm(false);
  };
  
  const handleAddDiscount = () => {
    if (!discountName || !discountTotal || !discountPayments) return;
    const totalAmount = parseFloat(discountTotal);
    const totalPaymentsNum = parseInt(discountPayments);
    const paymentAmount = parseFloat(discountPaymentAmount) || (totalAmount / totalPaymentsNum);
    const discount: Discount = { id: generateId(), name: discountName, type: discountType, totalAmount, totalPayments: totalPaymentsNum, completedPayments: 0, paymentAmount: Math.round(paymentAmount * 100) / 100, startDate: format(new Date(), 'yyyy-MM-dd') };
    storage.addDiscount(discount);
    setDiscountName('');
    setDiscountTotal('');
    setDiscountPayments('');
    setDiscountPaymentAmount('');
    setShowDiscountForm(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setPaymentReceipt(event.target?.result as string); };
    reader.readAsDataURL(file);
  };
  
  const handlePayment = () => {
    if (!showPaymentModal || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    const paymentDate = format(new Date(), 'yyyy-MM-dd');
    if (showPaymentModal.type === 'expense') {
      const expense = storage.personalExpenses.find(e => e.id === showPaymentModal.id);
      if (!expense) return;
      const newPaidAmount = (expense.paidAmount || 0) + amount;
      storage.updatePersonalExpense(expense.id, { paidAmount: newPaidAmount, payments: [...(expense.payments || []), { id: generateId(), amount, date: paymentDate, notes: paymentNotes || undefined, receiptPhoto: paymentReceipt || undefined }] });
      const receiptDataUrl = generatePaymentReceipt('expense', expense.name, amount, newPaidAmount, expense.amount, paymentDate, paymentNotes, paymentReceipt);
      setTimeout(() => { if (confirm('✅ Pago registrado\n\n¿Compartir comprobante por WhatsApp?')) shareCardWhatsApp(receiptDataUrl, `Pago: ${expense.name}`); }, 500);
    } else {
      const debt = storage.personalDebts.find(d => d.id === showPaymentModal.id);
      if (!debt) return;
      const newPaidAmount = debt.paidAmount + amount;
      storage.updatePersonalDebt(debt.id, { paidAmount: newPaidAmount, payments: [...(debt.payments || []), { id: generateId(), amount, date: paymentDate, notes: paymentNotes || undefined, receiptPhoto: paymentReceipt || undefined }] });
      const receiptDataUrl = generatePaymentReceipt('debt', debt.name, amount, newPaidAmount, debt.totalAmount, paymentDate, paymentNotes, paymentReceipt);
      setTimeout(() => { if (confirm('✅ Pago registrado\n\n¿Compartir comprobante por WhatsApp?')) shareCardWhatsApp(receiptDataUrl, `Pago: ${debt.name}`); }, 500);
    }
    setShowPaymentModal(null);
    setPaymentAmount('');
    setPaymentNotes('');
    setPaymentReceipt('');
  };
  
  // Calculate monthly extra pay
  const calculateMonthlyExtraPay = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthRecords = storage.records.filter(r => { const rDate = parseISO(r.date); return rDate >= monthStart && rDate <= monthEnd; });
    let extraPay = 0;
    monthRecords.forEach(record => {
      const day = parseISO(record.date).getDay();
      const isWeekday = day >= 1 && day <= 5;
      if (record.isHoliday) extraPay += record.hoursWorked * rate100;
      else if (!isWeekday) extraPay += record.hoursWorked * rate100;
      else if (record.hoursWorked > 9) extraPay += (record.hoursWorked - 9) * rate50;
    });
    return extraPay;
  };
  
  const monthlyExtraPay = calculateMonthlyExtraPay();
  const baseIngreso = salary + monthlyExtraPay;
  const totalBonuses = storage.bonuses.reduce((sum, b) => sum + b.amount, 0);
  const grossIncome = baseIngreso + totalBonuses;
  const totalDiscounts = storage.discounts.reduce((sum, d) => sum + d.paymentAmount, 0);
  const netIncome = grossIncome - totalDiscounts - quincena;
  
  // Chart data
  const weeklyChartData = (() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRecord = storage.records.find(r => r.date === dateStr);
      return { day, hours: dayRecord ? dayRecord.hoursWorked : 0, target: index < 5 ? 9 : 0 };
    });
  })();
  
  // Monthly chart data
  const monthlyChartData = (() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weeks: { week: string; hours: number; target: number }[] = [];
    let current = monthStart;
    let weekNum = 1;
    while (current <= monthEnd) {
      const wStart = startOfWeek(current, { weekStartsOn: 1 });
      const wEnd = endOfWeek(current, { weekStartsOn: 1 });
      const weekRecords = storage.records.filter(r => {
        const rDate = parseISO(r.date);
        return isWithinInterval(rDate, { start: wStart, end: wEnd });
      });
      const hours = weekRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
      weeks.push({ week: `Sem ${weekNum}`, hours: Math.round(hours * 100) / 100, target: 45 });
      current = addWeeks(current, 1);
      weekNum++;
    }
    return weeks;
  })();
  
  // Quarterly chart data
  const quarterlyChartData = (() => {
    const now = new Date();
    const months: { month: string; hours: number; target: number }[] = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthRecords = storage.records.filter(r => {
        const rDate = parseISO(r.date);
        return isWithinInterval(rDate, { start: monthStart, end: monthEnd });
      });
      const hours = monthRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
      months.push({ month: format(date, 'MMM', { locale: es }), hours: Math.round(hours * 100) / 100, target: 180 });
    }
    return months;
  })();
  
  // Auto-update decimo on day 1 of each month
  useEffect(() => {
    const today = new Date();
    if (today.getDate() === 1) {
      const lastProcessed = localStorage.getItem('asistencia_hl_decimo_last_processed');
      const currentMonth = format(today, 'yyyy-MM');
      if (lastProcessed !== currentMonth) {
        // Calculate previous month net income
        const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthStart = startOfMonth(prevMonth);
        const prevMonthEnd = endOfMonth(prevMonth);
        const prevMonthRecords = storage.records.filter(r => {
          const rDate = parseISO(r.date);
          return rDate >= prevMonthStart && rDate <= prevMonthEnd;
        });
        let prevExtraPay = 0;
        prevMonthRecords.forEach(record => {
          const day = parseISO(record.date).getDay();
          const isWeekday = day >= 1 && day <= 5;
          if (record.isHoliday) prevExtraPay += record.hoursWorked * rate100;
          else if (!isWeekday) prevExtraPay += record.hoursWorked * rate100;
          else if (record.hoursWorked > 9) prevExtraPay += (record.hoursWorked - 9) * rate50;
        });
        const prevNetIncome = salary + prevExtraPay;
        // Update decimo values
        const prevMonthIndex = prevMonth.getMonth();
        const decimoIndex = prevMonthIndex === 11 ? 0 : prevMonthIndex + 1;
        const newValues = [...decimoValues];
        newValues[decimoIndex] = prevNetIncome;
        setDecimoValues(newValues);
        localStorage.setItem('asistencia_hl_decimo_last_processed', currentMonth);
      }
    }
  }, [salary, rate100, rate50, storage.records, decimoValues]);
  
  // Totals
  const totalExpenses = storage.personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaidExpenses = storage.personalExpenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
  const totalDebts = storage.personalDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaidDebts = storage.personalDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  
  // Decimo total
  const decimoTotal = decimoValues.reduce((sum, val) => sum + val, 0);
  const decimoCuarto = decimoTotal / 12;
  const decimoChartData = DECIMO_MONTHS.map((month, index) => ({ name: month.substring(0, 3), value: decimoValues[index] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <i className="fas fa-clock text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Control de Asistencia</h1>
                <p className="text-xs text-slate-400">Creador by Hugo Leon</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Semana {weekNumber}</div>
              <div className="text-sm font-semibold text-cyan-300">{weeklySummary.totalHours}h / 45h</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Week Selector */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2"><i className="fas fa-calendar-week text-cyan-400"></i>Seleccionar Semana</h3>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30">Semana {weekNumber} del año</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedWeekOffset(prev => prev - 1)} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center"><i className="fas fa-chevron-left"></i></button>
                <div className="flex-1 text-center">
                  <div className="text-sm font-semibold">{format(weekStart, 'dd MMM', { locale: es })} - {format(weekEnd, 'dd MMM yyyy', { locale: es })}</div>
                  <div className="text-xs text-slate-400">{selectedWeekOffset === 0 ? 'Semana actual' : `${Math.abs(selectedWeekOffset)} semanas ${selectedWeekOffset < 0 ? 'atrás' : 'adelante'}`}</div>
                </div>
                <button onClick={() => setSelectedWeekOffset(prev => prev + 1)} className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center justify-center"><i className="fas fa-chevron-right"></i></button>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-calendar-week text-blue-400"></i>Resumen Semanal</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${weeklySummary.percentage >= 100 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : weeklySummary.percentage >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-600/40 text-slate-300 border border-slate-500/30'}`}>{weeklySummary.percentage}%</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Horas semanales</div>
                  <div className="text-2xl font-bold text-white">{weeklySummary.totalHours}h</div>
                  <div className="text-xs text-slate-500 mt-1">Meta: 45h</div>
                </div>
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Horas restantes</div>
                  <div className="text-2xl font-bold text-cyan-400">{Math.max(0, 45 - weeklySummary.totalHours)}h</div>
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
                <div className="flex justify-between text-xs"><span className="text-slate-400">Progreso semanal</span><span className="text-cyan-400 font-semibold">{Math.min(100, Math.round((weeklySummary.totalHours / 45) * 100))}%</span></div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${weeklySummary.totalHours >= 45 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`} style={{ width: `${Math.min(100, (weeklySummary.totalHours / 45) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Holiday Manager */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-umbrella-beach text-amber-400"></i>Días Feriados {new Date().getFullYear()}</h3>
                <button onClick={() => setShowHolidayForm(!showHolidayForm)} className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-300 flex items-center gap-1.5">
                  <i className={`fas fa-${showHolidayForm ? 'times' : 'plus'}`}></i>{showHolidayForm ? 'Cancelar' : 'Agregar'}
                </button>
              </div>
              {showHolidayForm && (
                <div className="bg-slate-700/30 rounded-xl p-4 mb-4 space-y-3">
                  <input type="text" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="Nombre del feriado" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white" />
                  <input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white" />
                  <button onClick={handleAddHoliday} className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl font-medium">Guardar Feriado</button>
                </div>
              )}
              {storage.holidays.length === 0 ? (
                <div className="text-center py-6"><i className="fas fa-calendar-day text-3xl text-slate-600 mb-2"></i><p className="text-slate-400 text-sm">No hay feriados registrados</p></div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {storage.holidays.map(holiday => (
                    <div key={holiday.id} className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30"><i className="fas fa-umbrella-beach text-amber-400"></i></div>
                        <div>
                          <div className="font-medium text-sm text-white">{holiday.name}</div>
                          <div className="text-xs text-slate-400">{format(parseISO(holiday.date), "EEEE d 'de' MMMM", { locale: es })}</div>
                        </div>
                      </div>
                      <button onClick={() => storage.deleteHoliday(holiday.id)} className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Chart */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-chart-bar text-blue-400"></i>Horas por Día (Semana Actual)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value: number) => [`${value}h`, 'Horas']} />
                    <ReferenceLine y={9} stroke="#f59e0b" strokeDasharray="3 3" />
                    <Bar dataKey="hours" fill="url(#barGradientHome)" radius={[6, 6, 0, 0]} />
                    <defs><linearGradient id="barGradientHome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Record Form */}
            {!showRecordForm ? (
              <button onClick={() => setShowRecordForm(true)} className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl font-semibold shadow-lg flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Registrar Asistencia</button>
            ) : (
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-blue-500/30">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-edit text-blue-400"></i>Nuevo Registro</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm text-slate-300 mb-1.5"><i className="fas fa-calendar mr-1 text-blue-400"></i>Fecha</label><input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" /></div>
                  <div><label className="block text-sm text-slate-300 mb-1.5"><i className="fas fa-sign-in-alt mr-1 text-green-400"></i>Hora de Ingreso</label><input type="time" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" /></div>
                  <div><label className="block text-sm text-slate-300 mb-1.5"><i className="fas fa-sign-out-alt mr-1 text-red-400"></i>Hora de Salida</label><input type="time" value={exitTime} onChange={(e) => setExitTime(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" /></div>
                  <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50"><div className="flex justify-between"><span className="text-sm text-slate-300">Horas calculadas:</span><span className="text-xl font-bold text-cyan-400">{calculateHoursWorked(entryTime, exitTime)}h</span></div></div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowRecordForm(false)} className="flex-1 py-3 bg-slate-700 rounded-xl">Cancelar</button>
                    <button onClick={handleSaveRecord} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl">Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-history text-cyan-400"></i>Historial de Asistencia</h2>
            {storage.records.length === 0 ? (
              <div className="bg-slate-800/60 rounded-2xl p-8 text-center"><i className="fas fa-clipboard-list text-4xl text-slate-600 mb-3"></i><p className="text-slate-400">No hay registros de asistencia</p></div>
            ) : (
              <div className="space-y-2">
                {storage.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                  <div key={record.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.isHoliday ? 'bg-amber-500/20 border border-amber-500/30' : record.isWeekend ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
                        <i className={`fas ${record.isHoliday ? 'fa-umbrella-beach text-amber-400' : record.isWeekend ? 'fa-sun text-purple-400' : 'fa-briefcase text-blue-400'}`}></i>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{format(parseISO(record.date), "EEEE d 'de' MMMM", { locale: es })}{record.isHoliday && <span className="ml-2 text-xs text-amber-400">(Feriado)</span>}</div>
                        <div className="text-xs text-slate-400">{record.entryTime} - {record.exitTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-cyan-400">{record.hoursWorked}h</div>
                      <button onClick={() => storage.deleteRecord(record.id)} className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-chart-bar text-cyan-400"></i>Reportes</h2>
            
            {/* Proyección de Horas */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-chart-line text-purple-400"></i>Proyección de Horas</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20 text-center">
                  <div className="text-2xl font-bold text-blue-400">{weeklySummary.totalHours}h</div>
                  <div className="text-xs text-slate-400 mt-1">Semanal</div>
                  <div className="text-xs text-slate-500">Meta: 45h</div>
                </div>
                <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{storage.records.filter(r => isSameMonth(parseISO(r.date), new Date())).reduce((sum, r) => sum + r.hoursWorked, 0).toFixed(1)}h</div>
                  <div className="text-xs text-slate-400 mt-1">Mensual</div>
                  <div className="text-xs text-slate-500">Meta: 180h</div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20 text-center">
                  <div className="text-2xl font-bold text-purple-400">{storage.records.filter(r => isWithinInterval(parseISO(r.date), { start: startOfMonth(addWeeks(new Date(), -8)), end: endOfMonth(new Date()) })).reduce((sum, r) => sum + r.hoursWorked, 0).toFixed(1)}h</div>
                  <div className="text-xs text-slate-400 mt-1">Trimestral</div>
                  <div className="text-xs text-slate-500">Meta: 540h</div>
                </div>
              </div>
            </div>
            
            {/* Gráfico Semanal */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-chart-bar text-blue-400"></i>Gráfico Semanal</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value: number) => [`${value}h`, 'Horas']} />
                    <ReferenceLine y={9} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Meta', fill: '#f59e0b', fontSize: 10 }} />
                    <Bar dataKey="hours" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico Mensual */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-chart-area text-cyan-400"></i>Gráfico Mensual</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value: number) => [`${value}h`, 'Horas']} />
                    <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="hours" stroke="#06b6d4" fill="url(#areaGradient)" strokeWidth={2} />
                    <defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} /><stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} /></linearGradient></defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico Trimestral */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-chart-bar text-purple-400"></i>Gráfico Trimestral</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px', color: '#e2e8f0' }} formatter={(value: number) => [`${value}h`, 'Horas']} />
                    <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="3 3" />
                    <Bar dataKey="hours" fill="url(#barGradientQuarter)" radius={[6, 6, 0, 0]} />
                    <defs><linearGradient id="barGradientQuarter" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* PAY TAB */}
        {activeTab === 'pay' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-money-bill-wave text-green-400"></i>Configuración de Pago</h2>
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 space-y-4">
              <div><label className="block text-sm text-slate-300 mb-1.5">Sueldo Base Mensual</label><input type="number" value={salary || ''} onChange={(e) => setSalary(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm text-slate-300 mb-1.5"><span className="text-amber-400">●</span> Valor/hora 50%</label><input type="number" value={rate50 || ''} onChange={(e) => setRate50(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700/50 border border-amber-500/30 rounded-xl px-4 py-3 text-white" step="0.01" /></div>
                <div><label className="block text-sm text-slate-300 mb-1.5"><span className="text-blue-400">●</span> Valor/hora 100%</label><input type="number" value={rate100 || ''} onChange={(e) => setRate100(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700/50 border border-blue-500/30 rounded-xl px-4 py-3 text-white" step="0.01" /></div>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <label className="block text-sm text-slate-300 mb-1.5 flex items-center gap-2"><i className="fas fa-calendar-check text-purple-400"></i>Quincena (Pago fijo del 15)</label>
                <input type="number" value={quincena || ''} onChange={(e) => setQuincena(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                <p className="text-xs text-slate-500 mt-2"><i className="fas fa-info-circle mr-1"></i>Este monto se descuenta del total mensual</p>
              </div>
            </div>
            
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-calculator text-emerald-400"></i>Resumen de Pago del Mes</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm bg-slate-700/30 rounded-lg p-2"><span className="text-slate-300">Sueldo Base:</span><span className="text-white font-semibold">${salary.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm bg-green-500/10 rounded-lg p-2"><span className="text-green-300 flex items-center gap-2"><i className="fas fa-clock"></i>Horas Extras del Mes:</span><span className="text-green-400 font-semibold">+${monthlyExtraPay.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm bg-cyan-500/10 rounded-lg p-2"><span className="text-cyan-300 font-semibold">Base de Ingreso:</span><span className="text-cyan-400 font-bold">${baseIngreso.toFixed(2)}</span></div>
                {totalBonuses > 0 && <div className="flex justify-between text-sm bg-green-500/10 rounded-lg p-2"><span className="text-green-300 flex items-center gap-2"><i className="fas fa-gift"></i>Bonos ({storage.bonuses.length}):</span><span className="text-green-400 font-semibold">+${totalBonuses.toFixed(2)}</span></div>}
                <div className="flex justify-between text-sm border-t border-slate-700 pt-2"><span className="text-white font-semibold">Ingreso Bruto:</span><span className="text-emerald-400 font-semibold">${grossIncome.toFixed(2)}</span></div>
                {quincena > 0 && <div className="flex justify-between text-sm bg-purple-500/10 rounded-lg p-2"><span className="text-purple-300 flex items-center gap-2"><i className="fas fa-calendar-check"></i>Quincena (descuento):</span><span className="text-purple-400 font-semibold">-${quincena.toFixed(2)}</span></div>}
                {totalDiscounts > 0 && <div className="flex justify-between text-sm bg-rose-500/10 rounded-lg p-2"><span className="text-rose-300 flex items-center gap-2"><i className="fas fa-hand-holding-usd"></i>Descuentos ({storage.discounts.length}):</span><span className="text-rose-400 font-semibold">-${totalDiscounts.toFixed(2)}</span></div>}
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2"><span className="text-white font-bold text-lg">Neto a Recibir:</span><span className={`text-2xl font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${netIncome.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-wallet text-emerald-400"></i>Finanzas</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setFinanceTab('bonuses')} className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${financeTab === 'bonuses' ? 'bg-green-500/20 border-green-500/50 text-green-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-gift"></i>Bonos ({storage.bonuses.length})</button>
              <button onClick={() => setFinanceTab('discounts')} className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${financeTab === 'discounts' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-hand-holding-usd"></i>Descuentos ({storage.discounts.length})</button>
            </div>
            
            {financeTab === 'bonuses' && (
              <div className="space-y-3">
                {!showBonusForm ? (
                  <button onClick={() => setShowBonusForm(true)} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl font-semibold flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Agregar Bono</button>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-green-500/30 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-gift text-green-400"></i>Nuevo Bono</h3>
                    <input type="text" value={bonusName} onChange={(e) => setBonusName(e.target.value)} placeholder="Nombre del bono" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setBonusType('fixed')} className={`py-2.5 rounded-xl text-xs font-medium ${bonusType === 'fixed' ? 'bg-green-500/30 border-green-500/50 text-green-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-lock mr-1"></i>Fijo</button>
                      <button onClick={() => setBonusType('variable')} className={`py-2.5 rounded-xl text-xs font-medium ${bonusType === 'variable' ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-chart-line mr-1"></i>Variable</button>
                      <button onClick={() => setBonusType('fondo_reserva')} className={`py-2.5 rounded-xl text-xs font-medium ${bonusType === 'fondo_reserva' ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-piggy-bank mr-1"></i>Fondo Reserva</button>
                    </div>
                    <input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} placeholder="Monto" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <div className="flex gap-3">
                      <button onClick={() => setShowBonusForm(false)} className="flex-1 py-3 bg-slate-700 rounded-xl">Cancelar</button>
                      <button onClick={handleAddBonus} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl">Guardar</button>
                    </div>
                  </div>
                )}
                {storage.bonuses.map(bonus => (
                  <div key={bonus.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bonus.type === 'fixed' ? 'bg-green-500/20 border border-green-500/30' : bonus.type === 'variable' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
                        <i className={`fas ${bonus.type === 'fixed' ? 'fa-lock text-green-400' : bonus.type === 'variable' ? 'fa-chart-line text-amber-400' : 'fa-piggy-bank text-amber-400'}`}></i>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{bonus.name}</div>
                        <div className="text-xs text-slate-400">{bonus.type === 'fixed' ? 'Fijo' : bonus.type === 'variable' ? 'Variable' : 'Fondo de Reserva'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-green-400">${bonus.amount.toFixed(2)}</div>
                      <button onClick={() => storage.deleteBonus(bonus.id)} className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {financeTab === 'discounts' && (
              <div className="space-y-3">
                {!showDiscountForm ? (
                  <button onClick={() => setShowDiscountForm(true)} className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-500 rounded-2xl font-semibold flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Agregar Descuento</button>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-rose-500/30 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-hand-holding-usd text-rose-400"></i>Nuevo Descuento</h3>
                    <input type="text" value={discountName} onChange={(e) => setDiscountName(e.target.value)} placeholder="Nombre" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      {(['loan', 'rol', 'quirurgico', 'iess', 'iess_aporte', 'other'] as const).map(type => (
                        <button key={type} onClick={() => setDiscountType(type)} className={`py-2.5 rounded-xl text-xs font-medium ${discountType === type ? 'bg-rose-500/30 border-rose-500/50 text-rose-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}>
                          {type === 'loan' ? 'Préstamo' : type === 'rol' ? 'Rol' : type === 'quirurgico' ? 'Quirúrgico' : type === 'iess' ? 'IESS Salud' : type === 'iess_aporte' ? 'Aporte IESS' : 'Otro'}
                        </button>
                      ))}
                    </div>
                    <input type="number" value={discountTotal} onChange={(e) => setDiscountTotal(e.target.value)} placeholder="Monto total" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <input type="number" value={discountPayments} onChange={(e) => setDiscountPayments(e.target.value)} placeholder="Cantidad de pagos" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <input type="number" value={discountPaymentAmount} onChange={(e) => setDiscountPaymentAmount(e.target.value)} placeholder="Monto por pago (opcional)" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <div className="flex gap-3">
                      <button onClick={() => setShowDiscountForm(false)} className="flex-1 py-3 bg-slate-700 rounded-xl">Cancelar</button>
                      <button onClick={handleAddDiscount} className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-500 rounded-xl">Guardar</button>
                    </div>
                  </div>
                )}
                {storage.discounts.map(discount => {
                  const progress = (discount.completedPayments / discount.totalPayments) * 100;
                  const pending = discount.totalAmount - (discount.completedPayments * discount.paymentAmount);
                  return (
                    <div key={discount.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/20 border border-rose-500/30">
                            <i className="fas fa-hand-holding-usd text-rose-400"></i>
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{discount.name}</div>
                            <div className="text-xs text-slate-400">{discount.type}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              const newCompleted = discount.completedPayments + 1;
                              if (newCompleted <= discount.totalPayments) {
                                storage.updateDiscount(discount.id, { completedPayments: newCompleted });
                              }
                            }}
                            disabled={discount.completedPayments >= discount.totalPayments}
                            className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Registrar pago"
                          >
                            <i className="fas fa-check text-xs"></i>
                          </button>
                          <button onClick={() => storage.deleteDiscount(discount.id)} className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-slate-700/30 rounded-lg p-2">
                          <div className="text-[10px] text-slate-500 uppercase">Total</div>
                          <div className="text-sm font-bold text-white">${discount.totalAmount.toFixed(2)}</div>
                        </div>
                        <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                          <div className="text-[10px] text-green-400 uppercase">Pagado</div>
                          <div className="text-sm font-bold text-green-400">${(discount.completedPayments * discount.paymentAmount).toFixed(2)}</div>
                        </div>
                        <div className="bg-rose-500/10 rounded-lg p-2 border border-rose-500/20">
                          <div className="text-[10px] text-rose-400 uppercase">Pendiente</div>
                          <div className="text-sm font-bold text-rose-400">${pending.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Pago mensual</span>
                          <span className="text-slate-300 font-medium">${discount.paymentAmount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{discount.completedPayments}/{discount.totalPayments} pagos ({progress.toFixed(1)}%)</span>
                          <span className="text-slate-500">{discount.totalPayments - discount.completedPayments} restantes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BALANCE TAB */}
        {activeTab === 'balance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-chart-line text-cyan-400"></i>Balance Personal - {format(new Date(), "MMMM yyyy", { locale: es })}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-800/60 rounded-xl p-3"><div className="text-xs text-slate-400 mb-1">Gastos Totales</div><div className="text-xl font-bold text-rose-400">${totalExpenses.toFixed(2)}</div></div>
                <div className="bg-slate-800/60 rounded-xl p-3"><div className="text-xs text-slate-400 mb-1">Gastos Pagados</div><div className="text-xl font-bold text-green-400">${totalPaidExpenses.toFixed(2)}</div></div>
                <div className="bg-slate-800/60 rounded-xl p-3"><div className="text-xs text-slate-400 mb-1">Deudas Totales</div><div className="text-xl font-bold text-amber-400">${totalDebts.toFixed(2)}</div></div>
                <div className="bg-slate-800/60 rounded-xl p-3"><div className="text-xs text-slate-400 mb-1">Deudas Pagadas</div><div className="text-xl font-bold text-green-400">${totalPaidDebts.toFixed(2)}</div></div>
              </div>
              
              {/* Gráficos de Balance */}
              {storage.personalExpenses.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Distribución de Gastos</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => ({
                              name: val.label,
                              value: storage.personalExpenses.filter(e => e.category === key).reduce((sum, e) => sum + e.amount, 0),
                              color: val.color
                            })).filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {Object.entries(EXPENSE_CATEGORIES).map(([key, val], index) => (
                              <Cell key={`cell-${index}`} fill={val.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px' }} formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Progreso de Pagos</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Gastos</span>
                          <span className="text-green-400">{totalExpenses > 0 ? ((totalPaidExpenses / totalExpenses) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${totalExpenses > 0 ? (totalPaidExpenses / totalExpenses) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Deudas</span>
                          <span className="text-purple-400">{totalDebts > 0 ? ((totalPaidDebts / totalDebts) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${totalDebts > 0 ? (totalPaidDebts / totalDebts) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-600/50">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Total Pagado:</span>
                          <span className="text-green-400 font-bold">${(totalPaidExpenses + totalPaidDebts).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-slate-300">Total Pendiente:</span>
                          <span className="text-rose-400 font-bold">${((totalExpenses + totalDebts) - (totalPaidExpenses + totalPaidDebts)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setBalanceTab('expenses')} className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${balanceTab === 'expenses' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-receipt"></i>Gastos</button>
              <button onClick={() => setBalanceTab('debts')} className={`py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${balanceTab === 'debts' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 border' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}><i className="fas fa-hand-holding-usd"></i>Deudas</button>
            </div>

            {balanceTab === 'expenses' && (
              <div className="space-y-3">
                {!showExpenseForm ? (
                  <button onClick={() => setShowExpenseForm(true)} className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl font-semibold flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Agregar Gasto</button>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-amber-500/30 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-receipt text-amber-400"></i>Nuevo Gasto</h3>
                    <input type="text" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Nombre" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value as any)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white">
                      {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (<option key={key} value={key}><i className={`fas ${val.icon}`}></i> {val.label}</option>))}
                    </select>
                    <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Monto" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <div className="flex gap-3">
                      <button onClick={() => setShowExpenseForm(false)} className="flex-1 py-3 bg-slate-700 rounded-xl">Cancelar</button>
                      <button onClick={handleAddExpense} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl">Guardar</button>
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
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${categoryInfo.color}20`, border: `1px solid ${categoryInfo.color}40` }}>
                            <i className={`fas ${categoryInfo.icon} text-xl`} style={{ color: categoryInfo.color }}></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{expense.name}</h4>
                            <p className="text-xs text-slate-400">{categoryInfo.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: categoryInfo.color }}>${netAmount.toFixed(2)}</div>
                          {paidAmount > 0 && <div className="text-xs text-slate-500">Pagado: ${paidAmount.toFixed(2)}</div>}
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowPaymentModal({ type: 'expense', id: expense.id }); setPaymentAmount(netAmount.toFixed(2)); }} className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs text-green-300 flex items-center justify-center gap-1.5"><i className="fas fa-money-bill-wave"></i>Pagar</button>
                        <button onClick={() => downloadCard(generateExpenseCard(expense), `gasto-${expense.name}.png`)} className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-300"><i className="fas fa-download"></i></button>
                        <button onClick={() => shareCardWhatsApp(generateExpenseCard(expense), expense.name)} className="py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300"><i className="fab fa-whatsapp"></i></button>
                        <button onClick={() => storage.deletePersonalExpense(expense.id)} className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {balanceTab === 'debts' && (
              <div className="space-y-3">
                {!showDebtForm ? (
                  <button onClick={() => setShowDebtForm(true)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl font-semibold flex items-center justify-center gap-2"><i className="fas fa-plus"></i>Agregar Deuda</button>
                ) : (
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-purple-500/30 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-hand-holding-usd text-purple-400"></i>Nueva Deuda</h3>
                    <input type="text" value={debtName} onChange={(e) => setDebtName(e.target.value)} placeholder="Nombre" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <select value={debtType} onChange={(e) => setDebtType(e.target.value as any)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white">
                      {Object.entries(DEBT_TYPES).map(([key, val]) => (<option key={key} value={key}>{val.icon} {val.label}</option>))}
                    </select>
                    <input type="number" value={debtTotal} onChange={(e) => setDebtTotal(e.target.value)} placeholder="Monto total" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <input type="number" value={debtMonthly} onChange={(e) => setDebtMonthly(e.target.value)} placeholder="Pago mensual" className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" />
                    <div className="flex gap-3">
                      <button onClick={() => setShowDebtForm(false)} className="flex-1 py-3 bg-slate-700 rounded-xl">Cancelar</button>
                      <button onClick={handleAddDebt} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl">Guardar</button>
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
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${typeInfo.color}20`, border: `1px solid ${typeInfo.color}40` }}>
                            <i className={`fas ${typeInfo.icon} text-xl`} style={{ color: typeInfo.color }}></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{debt.name}</h4>
                            <p className="text-xs text-slate-400">{typeInfo.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: typeInfo.color }}>${pending.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">Mensual: ${debt.monthlyPayment.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowPaymentModal({ type: 'debt', id: debt.id }); setPaymentAmount(debt.monthlyPayment.toFixed(2)); }} className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs text-green-300 flex items-center justify-center gap-1.5"><i className="fas fa-money-bill-wave"></i>Pagar</button>
                        <button onClick={() => downloadCard(generateDebtCard(debt), `deuda-${debt.name}.png`)} className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-300"><i className="fas fa-download"></i></button>
                        <button onClick={() => shareCardWhatsApp(generateDebtCard(debt), debt.name)} className="py-2 px-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300"><i className="fab fa-whatsapp"></i></button>
                        <button onClick={() => storage.deletePersonalDebt(debt.id)} className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300"><i className="fas fa-trash"></i></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DECIMO TAB */}
        {activeTab === 'decimo' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><i className="fas fa-gift text-emerald-400"></i></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-300">14to Sueldo - Aguinaldo</h3>
                  <p className="text-sm text-slate-400 mt-1">Ingresa los sueldos de <strong className="text-white">diciembre a noviembre</strong></p>
                </div>
              </div>
              
              {/* Información sobre cálculo automático */}
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
                <h3 className="text-lg font-semibold flex items-center gap-2"><i className="fas fa-calendar-alt text-cyan-400"></i>Sueldos Mensuales</h3>
                <button onClick={() => setDecimoValues(Array(12).fill(0))} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5"><i className="fas fa-eraser"></i>Limpiar</button>
              </div>
              <div className="space-y-2">
                {DECIMO_MONTHS.map((month, index) => {
                  const lastProcessed = localStorage.getItem('asistencia_hl_decimo_last_processed');
                  const currentMonth = format(new Date(), 'yyyy-MM');
                  const prevMonth = new Date();
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  const prevMonthStr = format(prevMonth, 'yyyy-MM');
                  const isAutoCalculated = lastProcessed === currentMonth && decimoValues[index] > 0;
                  
                  return (
                    <div key={month} className={`flex items-center gap-3 rounded-xl p-3 border ${isAutoCalculated ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-700/30 border-slate-600/30'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isAutoCalculated ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-600/50 text-slate-300'}`}>{index + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">{month}</span>
                          {isAutoCalculated && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <i className="fas fa-robot mr-1"></i>Automático
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input type="number" value={decimoValues[index] || ''} onChange={(e) => { const newValues = [...decimoValues]; newValues[index] = parseFloat(e.target.value) || 0; setDecimoValues(newValues); }} placeholder="0.00" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-3 py-2 text-white text-sm" min="0" step="0.01" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {decimoTotal > 0 && (
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-emerald-500/30">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><i className="fas fa-trophy text-yellow-400"></i>Resultado</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700/40 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">Meses registrados:</span>
                      <span className="text-white font-semibold">{decimoValues.filter(v => v > 0).length} / 12</span>
                    </div>
                    <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${(decimoValues.filter(v => v > 0).length / 12) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-700/40 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Total acumulado:</span>
                      <span className="text-cyan-400 font-semibold">${decimoTotal.toFixed(2)}</span>
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
                  <div className="bg-slate-700/40 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Progreso por Mes</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={decimoChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '12px' }} />
                          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {decimoTotal === 0 && (
              <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
                <i className="fas fa-gift text-4xl text-slate-600 mb-3"></i>
                <p className="text-slate-400">Ingresa los sueldos mensuales</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/50 z-40">
        <div className="max-w-4xl mx-auto flex">
          <button onClick={() => setActiveTab('home')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400'}`}><i className="fas fa-home text-base"></i><span className="text-[10px] font-medium">Inicio</span></button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-400'}`}><i className="fas fa-history text-base"></i><span className="text-[10px] font-medium">Historial</span></button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'reports' ? 'text-cyan-400' : 'text-slate-400'}`}><i className="fas fa-chart-bar text-base"></i><span className="text-[10px] font-medium">Reportes</span></button>
          <button onClick={() => setActiveTab('pay')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'pay' ? 'text-green-400' : 'text-slate-400'}`}><i className="fas fa-money-bill-wave text-base"></i><span className="text-[10px] font-medium">Pagos</span></button>
          <button onClick={() => setActiveTab('finance')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'finance' ? 'text-emerald-400' : 'text-slate-400'}`}><i className="fas fa-wallet text-base"></i><span className="text-[10px] font-medium">Finanzas</span></button>
          <button onClick={() => setActiveTab('balance')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'balance' ? 'text-purple-400' : 'text-slate-400'}`}><i className="fas fa-balance-scale text-base"></i><span className="text-[10px] font-medium">Balance</span></button>
          <button onClick={() => setActiveTab('decimo')} className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 ${activeTab === 'decimo' ? 'text-amber-400' : 'text-slate-400'}`}><i className="fas fa-gift text-base"></i><span className="text-[10px] font-medium">Décimo</span></button>
        </div>
      </nav>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
            <div className="p-5 border-b border-slate-700"><h3 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-money-bill-wave text-green-400"></i>Registrar Pago</h3></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm text-slate-300 mb-1.5">Monto</label><input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" /></div>
              <div><label className="block text-sm text-slate-300 mb-1.5">Notas</label><textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white" rows={2} /></div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5"><i className="fas fa-camera mr-1 text-purple-400"></i>Foto de Factura (opcional)</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 rounded-xl text-slate-400">{paymentReceipt ? '✅ Foto cargada (clic para cambiar)' : '📷 Subir foto de factura'}</button>
                {paymentReceipt && <img src={paymentReceipt} alt="Factura" className="mt-2 rounded-xl max-h-48 object-cover w-full" />}
              </div>
            </div>
            <div className="p-5 border-t border-slate-700 flex gap-3">
              <button onClick={() => { setShowPaymentModal(null); setPaymentAmount(''); setPaymentNotes(''); setPaymentReceipt(''); }} className="flex-1 py-3 bg-slate-700 rounded-xl">Cancelar</button>
              <button onClick={handlePayment} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl">Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
