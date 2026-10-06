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
  quirurgico: { label: 'Quirúrgico', icon: 'fa-hospital', color: 'amber' },
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

  // Estados para ingresos extras manuales
  const [manualExtraIncomes, setManualExtraIncomes] = useState<Array<{id: string, name: string, amount: number}>>(() => {
    try {
      const stored = localStorage.getItem('balance_personal_manual_incomes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showManualIncomeForm, setShowManualIncomeForm] = useState(false);
  const [manualIncomeName, setManualIncomeName] = useState('');
  const [manualIncomeAmount, setManualIncomeAmount] = useState('');

  // Estados para pagos parciales
  const [showExpensePaymentModal, setShowExpensePaymentModal] = useState<string | null>(null);
  const [expensePaymentAmount, setExpensePaymentAmount] = useState('');
  const [expensePaymentNotes, setExpensePaymentNotes] = useState('');
  const [showDebtPaymentModal, setShowDebtPaymentModal] = useState<string | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
  const [debtPaymentNotes, setDebtPaymentNotes] = useState('');

  // Estado para mostrar modal de pagos del mes
  const [showMonthlyPaymentsModal, setShowMonthlyPaymentsModal] = useState(false);

  // Debt form state
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState<'bank' | 'personal' | 'credit_card' | 'quirurgico' | 'other'>('bank');
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
    let monthlyPayment = parseFloat(debtMonthly);
    const interestRate = debtInterest ? parseFloat(debtInterest) : undefined;
    const totalPayments = debtTotalPayments ? parseInt(debtTotalPayments) : undefined;

    if (!debtName.trim() || isNaN(totalAmount) || totalAmount <= 0) return;

    if (debtType === 'quirurgico' && interestRate && totalPayments && totalPayments > 0) {
      const monthlyInterestRate = interestRate / 100 / 12;
      if (monthlyInterestRate > 0) {
        monthlyPayment = totalAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
                        (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
      } else {
        monthlyPayment = totalAmount / totalPayments;
      }
    } else if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
      return;
    }

    const debt: PersonalDebt = {
      id: editingDebtId || generateId(),
      name: debtName.trim(),
      type: debtType,
      totalAmount,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
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
    
    const receiptDataUrl = generatePaymentReceipt(
      'expense',
      expense.name,
      amount,
      newPaidAmount,
      expense.amount,
      paymentDate,
      expensePaymentNotes || undefined
    );
    
    setTimeout(() => {
      const share = confirm('✅ Pago registrado exitosamente\n\n¿Deseas compartir el comprobante por WhatsApp?');
      if (share) {
        shareCardWhatsApp(receiptDataUrl, `Pago de Gasto: ${expense.name}`);
      } else {
        const download = confirm('¿Deseas descargar el comprobante como imagen?');
        if (download) {
          downloadCard(receiptDataUrl, `comprobante-gasto-${expense.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`);
        }
      }
    }, 500);
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
    
    const paymentDate = format(new Date(), 'yyyy-MM-dd');
    const newPaidAmount = debt.paidAmount + amount;
    
    const receiptDataUrl = generatePaymentReceipt(
      'debt',
      debt.name,
      amount,
      newPaidAmount,
      debt.totalAmount,
      paymentDate,
      debtPaymentNotes || undefined
    );
    
    setTimeout(() => {
      const share = confirm('✅ Pago registrado exitosamente\n\n¿Deseas compartir el comprobante por WhatsApp?');
      if (share) {
        shareCardWhatsApp(receiptDataUrl, `Pago de Deuda: ${debt.name}`);
      } else {
        const download = confirm('¿Deseas descargar el comprobante como imagen?');
        if (download) {
          downloadCard(receiptDataUrl, `comprobante-deuda-${debt.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`);
        }
      }
    }, 500);
  };

  const shareDebtWhatsApp = (debt: PersonalDebt) => {
    const typeInfo = DEBT_TYPES[debt.type];
    const pending = debt.totalAmount - debt.paidAmount;
    const progress = ((debt.paidAmount / debt.totalAmount) * 100).toFixed(1);
    const monthsRemaining = debt.totalPayments && debt.completedPayments !== undefined
      ? debt.totalPayments - debt.completedPayments
      : Math.ceil(pending / debt.monthlyPayment);

    let interestInfo = '';
    if (debt.type === 'quirurgico' && debt.interestRate && debt.totalPayments) {
      const monthlyRate = debt.interestRate / 100 / 12;
      const remainingBalance = debt.totalAmount - debt.paidAmount;
      const interestPayment = remainingBalance * monthlyRate;
      const capitalPayment = debt.monthlyPayment - interestPayment;
      const totalInterestPaid = (debt.monthlyPayment * (debt.completedPayments || 0)) - debt.paidAmount;
      
      interestInfo = `\n📊 *Desglose del Pago Mensual:*\n   • Interés: $${interestPayment.toFixed(2)}\n   • Capital: $${capitalPayment.toFixed(2)}\n   • Total Interés Pagado: $${Math.max(0, totalInterestPaid).toFixed(2)}`;
    }

    const message = `💳 *DETALLE DE DEUDA* 💳\n\n📋 *${debt.name}*\n🏷️ Tipo: ${typeInfo.label}\n💰 Monto Total: $${debt.totalAmount.toFixed(2)}\n📅 Pago Mensual: $${debt.monthlyPayment.toFixed(2)}\n${debt.interestRate ? `📊 Tasa de Interés: ${debt.interestRate}% anual\n` : ''}${debt.totalPayments ? `🔢 Número de Pagos: ${debt.completedPayments || 0}/${debt.totalPayments}\n` : ''}✅ Pagado: $${debt.paidAmount.toFixed(2)} (${progress}%)\n⏳ Pendiente: $${pending.toFixed(2)}\n📆 ${debt.totalPayments ? 'Pagos Restantes' : 'Meses Restantes'}: ${monthsRemaining}${interestInfo}\n${debt.notes ? `\n📝 Notas: ${debt.notes}` : ''}\n\n_Generado desde Control de Asistencia HL_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  // Guardar ingresos manuales en localStorage
  useEffect(() => {
    localStorage.setItem('balance_personal_manual_incomes', JSON.stringify(manualExtraIncomes));
  }, [manualExtraIncomes]);

  const handleAddManualIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(manualIncomeAmount);
    if (!manualIncomeName.trim() || isNaN(amount) || amount <= 0) return;

    const newIncome = {
      id: generateId(),
      name: manualIncomeName.trim(),
      amount
    };

    setManualExtraIncomes([...manualExtraIncomes, newIncome]);
    setManualIncomeName('');
    setManualIncomeAmount('');
    setShowManualIncomeForm(false);
  };

  const handleDeleteManualIncome = (id: string) => {
    setManualExtraIncomes(manualExtraIncomes.filter(income => income.id !== id));
  };

  const currentMonth = new Date();
  
  const getNetoRecibir = () => {
    const salary = parseFloat(localStorage.getItem('asistencia_hl_salary') || '0');
    const rate100 = parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39');
    const rate50 = parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29');
    const quincena = parseFloat(localStorage.getItem('asistencia_hl_quincena') || '0');
    const discounts = JSON.parse(localStorage.getItem('asistencia_hl_discounts') || '[]');
    
    const selectedWeekStart = localStorage.getItem('asistencia_hl_selected_week_start');
    const selectedWeekEnd = localStorage.getItem('asistencia_hl_selected_week_end');
    
    return calculateNetIncome(
      salary,
      records,
      bonuses,
      discounts,
      quincena,
      rate100,
      rate50,
      currentMonth,
      selectedWeekStart || undefined,
      selectedWeekEnd || undefined
    );
  };
  
  const netoRecibir = getNetoRecibir();
  const totalMonthlyIncome = netoRecibir + manualExtraIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalMonthlyExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount - (e.paidAmount || 0)), 0);
  const totalDebtPayments = personalDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const monthlyBalance = totalMonthlyIncome - totalMonthlyExpenses - totalDebtPayments;

  const totalDebt = personalDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = personalDebts.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalPending = totalDebt - totalPaid;

  return (
    <div className="space-y-6">
      {/* Resumen Financiero */}
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
          {manualExtraIncomes.length > 0 && (
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">Ingresos Manuales</div>
              <div className="text-xl font-bold text-amber-400">
                ${manualExtraIncomes.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
              </div>
            </div>
          )}
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
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-exchange-alt text-green-400"></i>
              Ingresos vs Gastos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-green-300 flex items-center gap-2">
                  <i className="fas fa-money-check"></i>
                  Neto a Recibir (de Pagos)
                </span>
                <span className="text-xl font-bold text-green-400">${netoRecibir.toFixed(2)}</span>
              </div>
              {manualExtraIncomes.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <span className="text-amber-300 flex items-center gap-2">
                    <i className="fas fa-coins"></i>
                    Ingresos Extras Manuales
                  </span>
                  <span className="text-xl font-bold text-amber-400">
                    +${manualExtraIncomes.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <span className="text-cyan-300 flex items-center gap-2">
                  <i className="fas fa-arrow-down"></i>
                  Total Ingresos
                </span>
                <span className="text-xl font-bold text-cyan-400">${totalMonthlyIncome.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <span className="text-rose-300 flex items-center gap-2">
                  <i className="fas fa-arrow-up"></i>
                  Gastos Mensuales
                </span>
                <span className="text-xl font-bold text-rose-400">${totalMonthlyExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <span className="text-cyan-300 flex items-center gap-2">
                  <i className="fas fa-balance-scale"></i>
                  Balance Disponible
                </span>
                <span className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                  ${monthlyBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de Realizar Pagos */}
          <button
            onClick={() => setShowMonthlyPaymentsModal(true)}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-money-check-alt"></i>
            Realizar Pagos
          </button>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-5 border border-green-500/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-money-check text-green-400"></i>
              Neto a Recibir (de Pagos)
            </h3>
            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Ingreso Neto Mensual</div>
              <div className="text-3xl font-bold text-green-400">${netoRecibir.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-2">
                Este valor proviene directamente de la pestaña de Pagos (Sueldo + Extras - Descuentos)
              </div>
            </div>
          </div>

          {/* Ingresos Extras Manuales */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <i className="fas fa-plus-circle text-amber-400"></i>
                Ingresos Extras Manuales
              </h3>
              <button
                onClick={() => setShowManualIncomeForm(!showManualIncomeForm)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-300 transition-all flex items-center gap-1.5"
              >
                <i className={`fas fa-${showManualIncomeForm ? 'times' : 'plus'}`}></i>
                {showManualIncomeForm ? 'Cancelar' : 'Agregar'}
              </button>
            </div>

            {showManualIncomeForm && (
              <form onSubmit={handleAddManualIncome} className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600/50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Nombre del Ingreso</label>
                    <input
                      type="text"
                      value={manualIncomeName}
                      onChange={(e) => setManualIncomeName(e.target.value)}
                      placeholder="Ej: Venta extra, Comisión, etc."
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">Monto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input
                        type="number"
                        value={manualIncomeAmount}
                        onChange={(e) => setManualIncomeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-300 flex items-start gap-2">
                      <i className="fas fa-info-circle mt-0.5"></i>
                      <span>Este ingreso solo se mostrará en esta pestaña y no afectará los cálculos de otras secciones.</span>
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-xl font-medium text-white transition-all"
                  >
                    Agregar Ingreso
                  </button>
                </div>
              </form>
            )}

            {manualExtraIncomes.length === 0 ? (
              <div className="text-center py-6">
                <i className="fas fa-coins text-3xl text-slate-600 mb-2"></i>
                <p className="text-slate-400 text-sm">No hay ingresos extras manuales</p>
                <p className="text-xs text-slate-500 mt-1">Agrega ingresos adicionales que no provengan del sistema</p>
              </div>
            ) : (
              <div className="space-y-2">
                {manualExtraIncomes.map(income => (
                  <div key={income.id} className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                        <i className="fas fa-coins text-amber-400"></i>
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{income.name}</div>
                        <div className="text-xs text-slate-400">Ingreso extra manual</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-amber-400">${income.amount.toFixed(2)}</div>
                      <button
                        onClick={() => handleDeleteManualIncome(income.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-300 font-semibold">Total Ingresos Manuales</span>
                    <span className="text-xl font-bold text-amber-400">
                      ${manualExtraIncomes.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Nombre del Gasto</label>
                  <input
                    type="text"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    placeholder="Ej: Luz, Internet, Arriendo, etc."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Categoría</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(EXPENSE_CATEGORIES).map(([category, info]) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setExpenseCategory(category as any)}
                        className={`py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                          expenseCategory === category
                            ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 border'
                            : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                        }`}
                      >
                        <i className={`fas ${info.icon}`}></i>
                        {info.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Frecuencia</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['monthly', 'weekly', 'yearly', 'one_time'] as const).map(freq => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setExpenseFrequency(freq)}
                        className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                          expenseFrequency === freq
                            ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 border'
                            : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                        }`}
                      >
                        {freq === 'monthly' ? 'Mensual' : freq === 'weekly' ? 'Semanal' : freq === 'yearly' ? 'Anual' : 'Único'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={expenseStartDate}
                    onChange={(e) => setExpenseStartDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">
                    Fecha Máxima de Pago (opcional)
                    <span className="text-xs text-slate-500 ml-2">Para gastos recurrentes</span>
                  </label>
                  <input
                    type="date"
                    value={expenseDueDate}
                    onChange={(e) => setExpenseDueDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Se te recordará actualizar este gasto antes de esta fecha
                  </p>
                </div>

                {/* Toggle Auto-Renovar */}
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expenseAutoRenew}
                      onChange={(e) => setExpenseAutoRenew(e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-cyan-300">
                        Adjuntar al Siguiente Mes
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Si está activo, este gasto se renovará automáticamente cada mes y se sumará al balance del siguiente período
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Notas (opcional)</label>
                  <textarea
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    placeholder="Detalles adicionales..."
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none"
                  />
                </div>

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
              </div>
            </form>
          )}

          {personalExpenses.length === 0 ? (
            <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
              <i className="fas fa-receipt text-4xl text-slate-600 mb-3"></i>
              <p className="text-slate-400">No hay gastos registrados</p>
              <p className="text-xs text-slate-500 mt-1">Agrega gastos fijos como luz, internet, arriendo, etc.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 px-1">
                <i className="fas fa-list text-amber-400"></i>
                Gastos Registrados
              </h4>
              {personalExpenses.map(expense => {
                const categoryInfo = EXPENSE_CATEGORIES[expense.category];
                const frequencyLabel = expense.frequency === 'monthly' ? 'Mensual' :
                                      expense.frequency === 'weekly' ? 'Semanal' :
                                      expense.frequency === 'yearly' ? 'Anual' : 'Único';
                
                const paidAmount = expense.paidAmount || 0;
                const netAmount = expense.amount - paidAmount;
                const paymentProgress = (paidAmount / expense.amount) * 100;

                return (
                  <div key={expense.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${categoryInfo.color}20`, border: `1px solid ${categoryInfo.color}40` }}>
                          <i className={`fas ${categoryInfo.icon}`} style={{ color: categoryInfo.color }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm">{expense.name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}>
                              {categoryInfo.label}
                            </span>
                            <span className="text-xs text-slate-500">{frequencyLabel}</span>
                            {expense.autoRenew && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                                <i className="fas fa-sync-alt mr-1"></i>
                                Auto-Renovar
                              </span>
                            )}
                          </div>
                          {expense.notes && (
                            <p className="text-xs text-slate-400 mt-1 italic">{expense.notes}</p>
                          )}
                          
                          {paidAmount > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Pagado:</span>
                                <span className="text-green-400 font-medium">${paidAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Pendiente:</span>
                                <span className="text-rose-400 font-medium">${netAmount.toFixed(2)}</span>
                              </div>
                              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                                  style={{ width: `${paymentProgress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-slate-500 text-right">
                                {paymentProgress.toFixed(1)}% pagado
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          {paidAmount > 0 ? (
                            <>
                              <div className="text-xs text-slate-500 line-through">${expense.amount.toFixed(2)}</div>
                              <div className="text-lg font-bold" style={{ color: categoryInfo.color }}>
                                ${netAmount.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="text-lg font-bold" style={{ color: categoryInfo.color }}>
                              ${expense.amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const cardDataUrl = generateExpenseCard(expense);
                              downloadCard(cardDataUrl, `gasto-${expense.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-all"
                            title="Descargar ficha"
                          >
                            <i className="fas fa-download text-xs"></i>
                          </button>
                          <button
                            onClick={() => {
                              const cardDataUrl = generateExpenseCard(expense);
                              shareCardWhatsApp(cardDataUrl, `Gasto: ${expense.name}`);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
                            title="Compartir por WhatsApp"
                          >
                            <i className="fab fa-whatsapp text-xs"></i>
                          </button>
                          <button
                            onClick={() => {
                              setShowExpensePaymentModal(expense.id);
                              setExpensePaymentAmount(netAmount.toFixed(2));
                              setExpensePaymentNotes('');
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
                            title="Registrar pago parcial"
                          >
                            <i className="fas fa-money-bill-wave text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-all"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button
                            onClick={() => onDeleteExpense(expense.id)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Nombre de la Deuda</label>
                  <input
                    type="text"
                    value={debtName}
                    onChange={(e) => setDebtName(e.target.value)}
                    placeholder="Ej: Préstamo bancario, Tarjeta de crédito, etc."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Tipo de Deuda</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(DEBT_TYPES).map(([type, info]) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDebtType(type as any)}
                        className={`py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                          debtType === type
                            ? 'bg-purple-500/30 border-purple-500/50 text-purple-300 border'
                            : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                        }`}
                      >
                        <i className={`fas ${info.icon}`}></i>
                        {info.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Monto Total</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={debtTotal}
                      onChange={(e) => setDebtTotal(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">
                    Pago Mensual
                    {debtType === 'quirurgico' && debtInterest && debtTotalPayments && (
                      <span className="text-xs text-amber-400 ml-2">(Se calculará automáticamente)</span>
                    )}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={debtMonthly}
                      onChange={(e) => setDebtMonthly(e.target.value)}
                      placeholder={debtType === 'quirurgico' && debtInterest && debtTotalPayments ? 'Automático' : '0.00'}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      min="0"
                      step="0.01"
                      required={debtType !== 'quirurgico' || !debtInterest || !debtTotalPayments}
                      disabled={debtType === 'quirurgico' && !!debtInterest && !!debtTotalPayments}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">
                    Tasa de Interés (% anual)
                    {debtType === 'quirurgico' && <span className="text-xs text-amber-400 ml-2">(Opcional)</span>}
                  </label>
                  <input
                    type="number"
                    value={debtInterest}
                    onChange={(e) => setDebtInterest(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    min="0"
                    step="0.01"
                  />
                </div>

                {debtType === 'quirurgico' && (
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5">
                      Número de Pagos
                      <span className="text-xs text-amber-400 ml-2">(Para calcular con interés)</span>
                    </label>
                    <input
                      type="number"
                      value={debtTotalPayments}
                      onChange={(e) => setDebtTotalPayments(e.target.value)}
                      placeholder="Ej: 12"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      min="1"
                      step="1"
                    />
                    {debtInterest && debtTotalPayments && debtTotal && (
                      <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs text-amber-300">
                          <i className="fas fa-calculator mr-1"></i>
                          Pago mensual calculado: $
                          {(() => {
                            const total = parseFloat(debtTotal);
                            const rate = parseFloat(debtInterest);
                            const payments = parseInt(debtTotalPayments);
                            const monthlyRate = rate / 100 / 12;
                            if (monthlyRate > 0 && payments > 0) {
                              const payment = total * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
                                            (Math.pow(1 + monthlyRate, payments) - 1);
                              return payment.toFixed(2);
                            }
                            return (total / payments).toFixed(2);
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={debtStartDate}
                    onChange={(e) => setDebtStartDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Notas (opcional)</label>
                  <textarea
                    value={debtNotes}
                    onChange={(e) => setDebtNotes(e.target.value)}
                    placeholder="Detalles adicionales..."
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                  />
                </div>

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
              </div>
            </form>
          )}

          {personalDebts.length === 0 ? (
            <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
              <i className="fas fa-hand-holding-usd text-4xl text-slate-600 mb-3"></i>
              <p className="text-slate-400">No hay deudas registradas</p>
              <p className="text-xs text-slate-500 mt-1">Agrega deudas bancarias, personales o tarjetas de crédito</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 px-1">
                <i className="fas fa-list text-purple-400"></i>
                Deudas Registradas
              </h4>
              {personalDebts.map(debt => {
                const typeInfo = DEBT_TYPES[debt.type];
                const pending = debt.totalAmount - debt.paidAmount;
                const progress = (debt.paidAmount / debt.totalAmount) * 100;

                return (
                  <div key={debt.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-${typeInfo.color}-500/20 border border-${typeInfo.color}-500/30`}>
                          <i className={`fas ${typeInfo.icon} text-${typeInfo.color}-400`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm">{debt.name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-${typeInfo.color}-500/20 text-${typeInfo.color}-300`}>
                              {typeInfo.label}
                            </span>
                            {debt.interestRate && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                <i className="fas fa-percentage mr-1"></i>
                                {debt.interestRate}% interés anual
                              </span>
                            )}
                            {debt.totalPayments && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                                <i className="fas fa-calendar-check mr-1"></i>
                                {debt.completedPayments || 0}/{debt.totalPayments} pagos
                              </span>
                            )}
                          </div>
                          {debt.notes && (
                            <p className="text-xs text-slate-400 mt-1 italic">{debt.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const cardDataUrl = generateDebtCard(debt);
                            downloadCard(cardDataUrl, `deuda-${debt.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 transition-all"
                          title="Descargar ficha"
                        >
                          <i className="fas fa-download text-xs"></i>
                        </button>
                        <button
                          onClick={() => {
                            const cardDataUrl = generateDebtCard(debt);
                            shareCardWhatsApp(cardDataUrl, `Deuda: ${debt.name}`);
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
                          title="Compartir ficha por WhatsApp"
                        >
                          <i className="fas fa-image text-xs"></i>
                        </button>
                        <button
                          onClick={() => {
                            setShowDebtPaymentModal(debt.id);
                            setDebtPaymentAmount(pending.toFixed(2));
                            setDebtPaymentNotes('');
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
                          title="Registrar pago parcial"
                        >
                          <i className="fas fa-money-bill-wave text-xs"></i>
                        </button>
                        <button
                          onClick={() => shareDebtWhatsApp(debt)}
                          className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all"
                          title="Compartir texto por WhatsApp"
                        >
                          <i className="fab fa-whatsapp text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-all"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button
                          onClick={() => onDeleteDebt(debt.id)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-700/30 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500 uppercase">Total</div>
                        <div className="text-sm font-bold text-white">${debt.totalAmount.toFixed(2)}</div>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                        <div className="text-[10px] text-green-400 uppercase">Pagado</div>
                        <div className="text-sm font-bold text-green-400">${debt.paidAmount.toFixed(2)}</div>
                      </div>
                      <div className="bg-rose-500/10 rounded-lg p-2 border border-rose-500/20">
                        <div className="text-[10px] text-rose-400 uppercase">Pendiente</div>
                        <div className="text-sm font-bold text-rose-400">${pending.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Pago mensual</span>
                        <span className="text-slate-300 font-medium">${debt.monthlyPayment.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">{progress.toFixed(1)}% completado</span>
                        <span className="text-slate-500">
                          {debt.totalPayments && debt.completedPayments !== undefined
                            ? `${debt.totalPayments - debt.completedPayments} pagos restantes`
                            : `${Math.ceil(pending / debt.monthlyPayment)} meses restantes`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => {
                          setShowDebtPaymentModal(debt.id);
                          setDebtPaymentAmount(debt.monthlyPayment.toFixed(2));
                          setDebtPaymentNotes('');
                        }}
                        className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-medium text-green-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        <i className="fas fa-check-circle"></i>
                        Registrar Pago Mensual
                      </button>
                      <button
                        onClick={() => shareDebtWhatsApp(debt)}
                        className="py-2 px-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg text-xs font-medium text-green-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        <i className="fab fa-whatsapp"></i>
                        Compartir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
