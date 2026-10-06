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
  const [sharingDebtId, setSharingDebtId] = useState<string | null>(null);
  const debtCardRef = useRef<HTMLDivElement>(null);

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

  // Estados para actualización mensual
  const [showMonthlyUpdateAlert, setShowMonthlyUpdateAlert] = useState(false);
  const [showBalanceHistory, setShowBalanceHistory] = useState(false);

  // Estados para pagos parciales
  const [showExpensePaymentModal, setShowExpensePaymentModal] = useState<string | null>(null);
  const [expensePaymentAmount, setExpensePaymentAmount] = useState('');
  const [expensePaymentNotes, setExpensePaymentNotes] = useState('');
  const [expensePaymentPhoto, setExpensePaymentPhoto] = useState<string>('');
  const [showDebtPaymentModal, setShowDebtPaymentModal] = useState<string | null>(null);
  const [debtPaymentAmount, setDebtPaymentAmount] = useState('');
  const [debtPaymentNotes, setDebtPaymentNotes] = useState('');
  const [debtPaymentPhoto, setDebtPaymentPhoto] = useState<string>('');

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
        notes: debtPaymentNotes || undefined,
        receiptPhoto: debtPaymentPhoto || undefined
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
      notes: expensePaymentNotes || undefined,
      receiptPhoto: expensePaymentPhoto || undefined
    };
    
    onUpdateExpense(id, {
      paidAmount: newPaidAmount,
      payments: [...(expense.payments || []), payment],
      lastUpdated: format(new Date(), 'yyyy-MM-dd')
    });
    
    setShowExpensePaymentModal(null);
    setExpensePaymentAmount('');
    setExpensePaymentNotes('');
    setExpensePaymentPhoto('');
    
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
    setDebtPaymentPhoto('');
    
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
      {/* Contenido del componente */}
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4">Balance Personal</h3>
        {/* Aquí iría todo el contenido del componente */}
      </div>
    </div>
  );
}
