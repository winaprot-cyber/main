import { useState, useRef, useEffect } from 'react';
import { PersonalDebt, PersonalExpense, AttendanceRecord, Bonus, MonthlyBalance } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId } from '../utils/calculations';
import { calculateNetIncome, calculateMonthlyExtraPay } from '../utils/payCalculations';
import { generateExpenseCard, generateDebtCard, generatePaymentReceipt, downloadCard, shareCardWhatsApp } from '../utils/cardGenerator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  personalDebts: PersonalDebt[];
  personalExpenses: PersonalExpense[];
  records: AttendanceRecord[];
  bonuses: Bonus[];
  monthlyBalances: MonthlyBalance[];
  onAddDebt: (debt: PersonalDebt) => void;
  onUpdateDebt: (id: string, updated: Partial<PersonalDebt>) => void;
  onDeleteDebt: (id: string) => void;
  onAddExpense: (expense: PersonalExpense) => void;
  onUpdateExpense: (id: string, updated: Partial<PersonalExpense>) => void;
  onDeleteExpense: (id: string) => void;
  onAddMonthlyBalance: (balance: MonthlyBalance) => void;
  getMonthlyBalance: (month: string) => MonthlyBalance | undefined;
}

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
  bank: { label: 'Bancaria', icon: 'fa-university', color: 'blue' },
  personal: { label: 'Particular', icon: 'fa-user', color: 'purple' },
  credit_card: { label: 'Tarjeta', icon: 'fa-credit-card', color: 'red' },
  quirografario: { label: 'Quirografario', icon: 'fa-file-invoice-dollar', color: 'amber' },
  other: { label: 'Otro', icon: 'fa-question', color: 'gray' }
};

export function BalancePersonal({
  personalDebts,
  personalExpenses,
  records,
  bonuses,
  monthlyBalances,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddMonthlyBalance,
  getMonthlyBalance
}: Props) {
  const [activeTab, setActiveTab] = useState<'balance' | 'income' | 'expenses' | 'debts'>('balance');
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showMonthlyPaymentsModal, setShowMonthlyPaymentsModal] = useState(false);

  // Estados para pagos parciales
  const [showExpensePaymentModal, setShowExpensePaymentModal] = useState<string | null>(null);
  const [expensePaymentAmount, setExpensePaymentAmount] = useState('');
  const [expensePaymentNotes, setExpensePaymentNotes] = useState('');
  const [showDebtPaymentModal, setShowDebtPaymentModal] = useState<string | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
  const [debtPaymentNotes, setDebtPaymentNotes] = useState('');

  // Debt form state
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState<'bank' | 'personal' | 'credit_card' | 'quirografario' | 'other'>('bank');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  const [debtInterest, setDebtInterest] = useState('');
  const [debtTotalPayments, setDebtTotalPayments] = useState('');
  const [debtStartDate, setDebtStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [debtNotes, setDebtNotes] = useState('');

  // Expense form state
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<keyof typeof EXPENSE_CATEGORIES>('utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseFrequency, setExpenseFrequency] = useState<'monthly' | 'weekly' | 'yearly' | 'one_time'>('monthly');
  const [expenseStartDate, setExpenseStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expenseDueDate, setExpenseDueDate] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseAutoRenew, setExpenseAutoRenew] = useState(false);

  const resetDebtForm = () => {
    setDebtName('');
    setDebtType('bank');
    setDebtTotal('');
    setDebtMonthly('');
    setDebtInterest('');
    setDebtTotalPayments('');
    setDebtStartDate(format(new Date(), 'yyyy-MM-dd'));
    setDebtNotes('');
    setShowDebtForm(false);
    setEditingDebtId(null);
  };

  const resetExpenseForm = () => {
    setExpenseName('');
    setExpenseCategory('utilities');
    setExpenseAmount('');
    setExpenseFrequency('monthly');
    setExpenseStartDate(format(new Date(), 'yyyy-MM-dd'));
    setExpenseDueDate('');
    setExpenseNotes('');
    setExpenseAutoRenew(false);
    setShowExpenseForm(false);
    setEditingExpenseId(null);
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(debtTotal);
    const monthlyPayment = parseFloat(debtMonthly);
    const interestRate = debtInterest ? parseFloat(debtInterest) : undefined;
    const totalPayments = debtTotalPayments ? parseInt(debtTotalPayments) : undefined;

    if (!debtName.trim() || isNaN(totalAmount) || totalAmount <= 0 || isNaN(monthlyPayment) || monthlyPayment <= 0) return;

    const debt: PersonalDebt = {
      id: editingDebtId || generateId(),
      name: debtName.trim(),
      type: debtType,
      totalAmount,
      monthlyPayment,
      interestRate,
      totalPayments,
      completedPayments: 0,
      startDate: debtStartDate,
      paidAmount: 0,
      notes: debtNotes.trim() || undefined
    };

    if (editingDebtId) {
      onUpdateDebt(editingDebtId, debt);
    } else {
      onAddDebt(debt);
    }

    resetDebtForm();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);

    if (!expenseName.trim() || isNaN(amount) || amount <= 0) return;

    const expense: PersonalExpense = {
      id: editingExpenseId || generateId(),
      name: expenseName.trim(),
      category: expenseCategory,
      amount,
      frequency: expenseFrequency,
      startDate: expenseStartDate,
      dueDate: expenseDueDate || undefined,
      isActive: true,
      lastUpdated: format(new Date(), 'yyyy-MM-dd'),
      notes: expenseNotes.trim() || undefined,
      autoRenew: expenseAutoRenew
    };

    if (editingExpenseId) {
      onUpdateExpense(editingExpenseId, expense);
    } else {
      onAddExpense(expense);
    }

    resetExpenseForm();
  };

  const handleEditDebt = (debt: PersonalDebt) => {
    setDebtName(debt.name);
    setDebtType(debt.type);
    setDebtTotal(debt.totalAmount.toString());
    setDebtMonthly(debt.monthlyPayment.toString());
    setDebtInterest(debt.interestRate?.toString() || '');
    setDebtTotalPayments(debt.totalPayments?.toString() || '');
    setDebtStartDate(debt.startDate);
    setDebtNotes(debt.notes || '');
    setEditingDebtId(debt.id);
    setShowDebtForm(true);
  };

  const handleEditExpense = (expense: PersonalExpense) => {
    setExpenseName(expense.name);
    setExpenseCategory(expense.category);
    setExpenseAmount(expense.amount.toString());
    setExpenseFrequency(expense.frequency);
    setExpenseStartDate(expense.startDate);
    setExpenseDueDate(expense.dueDate || '');
    setExpenseNotes(expense.notes || '');
    setExpenseAutoRenew(expense.autoRenew || false);
    setEditingExpenseId(expense.id);
    setShowExpenseForm(true);
  };

  const handleDebtPayment = (id: string, amount: number) => {
    const debt = personalDebts.find(d => d.id === id);
    if (debt) {
      const updateData: Partial<PersonalDebt> = { 
        paidAmount: debt.paidAmount + amount 
      };
      
      if (debt.totalPayments !== undefined) {
        updateData.completedPayments = (debt.completedPayments || 0) + 1;
      }
      
      const payment = {
        id: generateId(),
        amount: amount,
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: debtPaymentNotes || undefined
      };
      updateData.payments = [...(debt.payments || []), payment];
      
      onUpdateDebt(id, updateData);
    }
  };

  const handleExpensePartialPayment = (id: string) => {
    const expense = personalExpenses.find(e => e.id === id);
    const amount = parseFloat(expensePaymentAmount);
    
    if (!expense || isNaN(amount) || amount <= 0) return;
    
    const currentPaid = expense.paidAmount || 0;
    const newPaidAmount = currentPaid + amount;
    
    if (newPaidAmount > expense.amount) {
      alert(`El pago excede el total del gasto. Monto máximo: $${(expense.amount - currentPaid).toFixed(2)}`);
      return;
    }
    
    const paymentDate = format(new Date(), 'yyyy-MM-dd');
    const payment = {
      id: generateId(),
      amount: amount,
      date: paymentDate,
      notes: expensePaymentNotes || undefined
    };
    
    onUpdateExpense(id, {
      paidAmount: newPaidAmount,
      payments: [...(expense.payments || []), payment],
      lastUpdated: format(new Date(), 'yyyy-MM-dd')
    });
    
    setShowExpensePaymentModal(null);
    setExpensePaymentAmount('');
    setExpensePaymentNotes('');
  };

  const handleDebtPartialPayment = (id: string) => {
    const debt = personalDebts.find(d => d.id === id);
    const amount = parseFloat(debtPaymentAmount);
    
    if (!debt || isNaN(amount) || amount <= 0) return;
    
    const pending = debt.totalAmount - debt.paidAmount;
    
    if (amount > pending) {
      alert(`El pago excede el monto pendiente. Monto máximo: $${pending.toFixed(2)}`);
      return;
    }
    
    handleDebtPayment(id, amount);
    
    setShowDebtPaymentModal(null);
    setDebtPaymentAmount('');
    setDebtPaymentNotes('');
  };

  const currentMonth = new Date();
  const netoRecibir = calculateNetIncome(
    parseFloat(localStorage.getItem('asistencia_hl_salary') || '0'),
    records,
    bonuses,
    JSON.parse(localStorage.getItem('asistencia_hl_discounts') || '[]'),
    parseFloat(localStorage.getItem('asistencia_hl_quincena') || '0'),
    parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39'),
    parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29'),
    currentMonth,
    localStorage.getItem('asistencia_hl_selected_week_start') || undefined,
    localStorage.getItem('asistencia_hl_selected_week_end') || undefined
  );

  const totalMonthlyExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount - (e.paidAmount || 0)), 0);
  const totalDebtPayments = personalDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const monthlyBalance = netoRecibir - totalMonthlyExpenses - totalDebtPayments;

  const totalDebt = personalDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = personalDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalPending = totalDebt - totalPaid;

  return (
    <div className="space-y-6">
      {/* Balance General */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-5 border border-cyan-500/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-chart-line text-cyan-400"></i>
          Balance Personal - {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Neto a Recibir</div>
            <div className="text-xl font-bold text-green-400">${netoRecibir.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Gastos</div>
            <div className="text-xl font-bold text-rose-400">${totalMonthlyExpenses.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Deudas (Pago Mes)</div>
            <div className="text-xl font-bold text-amber-400">${totalDebtPayments.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Balance Final</div>
            <div className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
              ${monthlyBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('balance')}
          className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'balance'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <i className="fas fa-chart-pie"></i>
          <span className="hidden sm:inline">Balance</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'income'
              ? 'bg-green-500/20 border-green-500/50 text-green-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <i className="fas fa-dollar-sign"></i>
          <span className="hidden sm:inline">Ingresos</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'expenses'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <i className="fas fa-receipt"></i>
          <span className="hidden sm:inline">Gastos</span>
        </button>
        <button
          onClick={() => setActiveTab('debts')}
          className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'debts'
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <i className="fas fa-hand-holding-usd"></i>
          <span className="hidden sm:inline">Deudas</span>
        </button>
      </div>

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          {/* Resumen de Deudas */}
          {personalDebts.length > 0 && (
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-hand-holding-usd text-purple-400"></i>
                Resumen de Deudas
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700/40 rounded-xl p-3">
                  <div className="text-xs text-slate-400 mb-1">Total</div>
                  <div className="text-lg font-bold text-white">${totalDebt.toFixed(2)}</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                  <div className="text-xs text-green-400 mb-1">Pagado</div>
                  <div className="text-lg font-bold text-green-400">${totalPaid.toFixed(2)}</div>
                </div>
                <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
                  <div className="text-xs text-rose-400 mb-1">Pendiente</div>
                  <div className="text-lg font-bold text-rose-400">${totalPending.toFixed(2)}</div>
                </div>
              </div>
              {totalDebt > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Progreso general</span>
                    <span className="text-cyan-400 font-semibold">{((totalPaid / totalDebt) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${(totalPaid / totalDebt) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-3">
                <span className="text-amber-300 flex items-center gap-2">
                  <i className="fas fa-calendar"></i>
                  Pago Mensual Total
                </span>
                <span className="text-xl font-bold text-amber-400">${totalDebtPayments.toFixed(2)}</span>
              </div>
              
              {/* Botón de Realizar Pagos */}
              <button
                onClick={() => setShowMonthlyPaymentsModal(true)}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 mt-3"
              >
                <i className="fas fa-money-check-alt"></i>
                Realizar Pagos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-3">
          {!showExpenseForm ? (
            <button
              onClick={() => setShowExpenseForm(true)}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl font-semibold text-white shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Agregar Gasto
            </button>
          ) : (
            <form onSubmit={handleAddExpense} className="bg-slate-800/80 rounded-2xl p-5 border border-amber-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-receipt text-amber-400"></i>
                {editingExpenseId ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h3>
              {/* Form content here */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetExpenseForm}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-500 rounded-xl font-medium text-white shadow-lg transition-all"
                >
                  {editingExpenseId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="space-y-3">
          {!showDebtForm ? (
            <button
              onClick={() => setShowDebtForm(true)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl font-semibold text-white shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Agregar Deuda
            </button>
          ) : (
            <form onSubmit={handleAddDebt} className="bg-slate-800/80 rounded-2xl p-5 border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-hand-holding-usd text-purple-400"></i>
                {editingDebtId ? 'Editar Deuda' : 'Nueva Deuda'}
              </h3>
              {/* Form content here */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetDebtForm}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-medium text-white shadow-lg transition-all"
                >
                  {editingDebtId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
