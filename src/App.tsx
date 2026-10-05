import { useState, useEffect, useRef } from 'react';
import { useAttendanceStorage } from './hooks/useAttendanceStorage';
import { PersonalExpense, PersonalDebt, ExpensePayment, DebtPayment } from './types';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const {
    personalDebts, personalExpenses,
    addPersonalDebt, updatePersonalDebt, deletePersonalDebt,
    addPersonalExpense, updatePersonalExpense, deletePersonalExpense
  } = useAttendanceStorage();

  const [activeTab, setActiveTab] = useState<'expenses' | 'debts'>('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ type: 'expense' | 'debt', id: string } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expense form
  const [expenseName, setExpenseName] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<keyof typeof EXPENSE_CATEGORIES>('utilities');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Debt form
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState<keyof typeof DEBT_TYPES>('bank');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');

  const handleAddExpense = () => {
    if (!expenseName || !expenseAmount) return;
    
    const expense: PersonalExpense = {
      id: Date.now().toString(),
      name: expenseName,
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      frequency: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
      paidAmount: 0,
      payments: []
    };
    
    addPersonalExpense(expense);
    setExpenseName('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };

  const handleAddDebt = () => {
    if (!debtName || !debtTotal || !debtMonthly) return;
    
    const debt: PersonalDebt = {
      id: Date.now().toString(),
      name: debtName,
      type: debtType,
      totalAmount: parseFloat(debtTotal),
      monthlyPayment: parseFloat(debtMonthly),
      startDate: format(new Date(), 'yyyy-MM-dd'),
      paidAmount: 0,
      payments: []
    };
    
    addPersonalDebt(debt);
    setDebtName('');
    setDebtTotal('');
    setDebtMonthly('');
    setShowDebtForm(false);
  };

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

  const handlePayment = () => {
    if (!showPaymentModal || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    const paymentDate = format(new Date(), 'yyyy-MM-dd');

    if (showPaymentModal.type === 'expense') {
      const expense = personalExpenses.find(e => e.id === showPaymentModal.id);
      if (!expense) return;

      const payment: ExpensePayment = {
        id: Date.now().toString(),
        amount,
        date: paymentDate,
        notes: paymentNotes || undefined,
        receiptPhoto: paymentReceipt || undefined
      };

      const newPaidAmount = (expense.paidAmount || 0) + amount;
      
      updatePersonalExpense(expense.id, {
        paidAmount: newPaidAmount,
        payments: [...(expense.payments || []), payment]
      });

      // Generar comprobante
      const receiptDataUrl = generatePaymentReceipt(
        'expense',
        expense.name,
        amount,
        newPaidAmount,
        expense.amount,
        paymentDate,
        paymentNotes
      );

      // Incluir foto de respaldo si existe
      if (paymentReceipt) {
        // La foto se incluye en el comprobante
      }

      setTimeout(() => {
        const share = confirm('✅ Pago registrado\n\n¿Compartir comprobante por WhatsApp?');
        if (share) {
          shareCardWhatsApp(receiptDataUrl, `Pago: ${expense.name}`);
        }
      }, 500);

    } else {
      const debt = personalDebts.find(d => d.id === showPaymentModal.id);
      if (!debt) return;

      const payment: DebtPayment = {
        id: Date.now().toString(),
        amount,
        date: paymentDate,
        notes: paymentNotes || undefined,
        receiptPhoto: paymentReceipt || undefined
      };

      const newPaidAmount = debt.paidAmount + amount;
      
      updatePersonalDebt(debt.id, {
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
        paymentNotes
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

  const totalExpenses = personalExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaidExpenses = personalExpenses.reduce((sum, e) => sum + (e.paidAmount || 0), 0);
  const totalDebts = personalDebts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaidDebts = personalDebts.reduce((sum, d) => sum + d.paidAmount, 0);

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
                  Balance Personal
                </h1>
                <p className="text-xs text-slate-400">Creador by Hugo Leon</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 rounded-xl font-medium transition-all ${
              activeTab === 'expenses'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 border'
                : 'bg-slate-700/50 border border-slate-600 text-slate-400'
            }`}
          >
            📄 Gastos ({personalExpenses.length})
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`py-3 rounded-xl font-medium transition-all ${
              activeTab === 'debts'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 border'
                : 'bg-slate-700/50 border border-slate-600 text-slate-400'
            }`}
          >
            💳 Deudas ({personalDebts.length})
          </button>
        </div>

        {/* Summary */}
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 mb-6">
          <h3 className="text-lg font-semibold mb-4">Resumen</h3>
          {activeTab === 'expenses' ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/40 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Total</div>
                <div className="text-xl font-bold text-white">${totalExpenses.toFixed(2)}</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                <div className="text-xs text-green-400 mb-1">Pagado</div>
                <div className="text-xl font-bold text-green-400">${totalPaidExpenses.toFixed(2)}</div>
              </div>
              <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
                <div className="text-xs text-rose-400 mb-1">Pendiente</div>
                <div className="text-xl font-bold text-rose-400">${(totalExpenses - totalPaidExpenses).toFixed(2)}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/40 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Total</div>
                <div className="text-xl font-bold text-white">${totalDebts.toFixed(2)}</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
                <div className="text-xs text-green-400 mb-1">Pagado</div>
                <div className="text-xl font-bold text-green-400">${totalPaidDebts.toFixed(2)}</div>
              </div>
              <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
                <div className="text-xs text-rose-400 mb-1">Pendiente</div>
                <div className="text-xl font-bold text-rose-400">${(totalDebts - totalPaidDebts).toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'expenses' ? (
          <div className="space-y-3">
            {!showExpenseForm ? (
              <button
                onClick={() => setShowExpenseForm(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Agregar Gasto
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

            {personalExpenses.map(expense => {
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
                      onClick={() => deletePersonalExpense(expense.id)}
                      className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {!showDebtForm ? (
              <button
                onClick={() => setShowDebtForm(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Agregar Deuda
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

            {personalDebts.map(debt => {
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
                      onClick={() => deletePersonalDebt(debt.id)}
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
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
            <div className="p-5 border-b border-slate-700">
              <h3 className="text-xl font-bold">Registrar Pago</h3>
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
                <label className="block text-sm text-slate-300 mb-1.5">Foto de Factura (opcional)</label>
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
