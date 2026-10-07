import { useState, useEffect } from 'react';
import { PersonalDebt, PersonalExpense, AttendanceRecord, Bonus, MonthlyBalance } from '../types';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId } from '../utils/calculations';
import { calculateNetIncome, calculateMonthlyExtraPay } from '../utils/payCalculations';

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

export function BalancePersonal(props: Props) {
  const { personalDebts, personalExpenses, records, bonuses } = props;
  const [activeTab, setActiveTab] = useState<'balance' | 'income' | 'expenses' | 'debts'>('balance');
  
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
  const totalMonthlyExpenses = personalExpenses.reduce((sum, e) => sum + (e.amount - (e.paidAmount || 0)), 0);
  const totalDebtPayments = personalDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const monthlyBalance = netoRecibir - totalMonthlyExpenses - totalDebtPayments;

  return (
    <div className="space-y-6">
      {/* Balance General - SIN Resumen de Deudas */}
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
          className={`py-3 rounded-xl font-medium transition-all ${
            activeTab === 'balance'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400'
          }`}
        >
          <i className="fas fa-chart-pie"></i> Balance
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`py-3 rounded-xl font-medium transition-all ${
            activeTab === 'income'
              ? 'bg-green-500/20 border-green-500/50 text-green-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400'
          }`}
        >
          <i className="fas fa-dollar-sign"></i> Ingresos
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-3 rounded-xl font-medium transition-all ${
            activeTab === 'expenses'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400'
          }`}
        >
          <i className="fas fa-receipt"></i> Gastos
        </button>
        <button
          onClick={() => setActiveTab('debts')}
          className={`py-3 rounded-xl font-medium transition-all ${
            activeTab === 'debts'
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400'
          }`}
        >
          <i className="fas fa-hand-holding-usd"></i> Deudas
        </button>
      </div>

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4">Resumen del Mes</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
              <span>Neto a Recibir:</span>
              <span className="font-bold text-green-400">${netoRecibir.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-rose-500/10 rounded-lg">
              <span>Gastos:</span>
              <span className="font-bold text-rose-400">-${totalMonthlyExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-amber-500/10 rounded-lg">
              <span>Deudas:</span>
              <span className="font-bold text-amber-400">-${totalDebtPayments.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-cyan-500/10 rounded-lg border-2 border-cyan-500/30">
              <span className="font-bold">Balance Final:</span>
              <span className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                ${monthlyBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4">Ingresos del Mes</h3>
          <div className="text-3xl font-bold text-green-400">${netoRecibir.toFixed(2)}</div>
          <p className="text-sm text-slate-400 mt-2">Neto a recibir después de descuentos</p>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4">Gastos del Mes</h3>
          <div className="text-3xl font-bold text-rose-400">${totalMonthlyExpenses.toFixed(2)}</div>
          <p className="text-sm text-slate-400 mt-2">{personalExpenses.length} gastos registrados</p>
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === 'debts' && (
        <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-lg font-semibold mb-4">Deudas del Mes</h3>
          <div className="text-3xl font-bold text-amber-400">${totalDebtPayments.toFixed(2)}</div>
          <p className="text-sm text-slate-400 mt-2">{personalDebts.length} deudas activas</p>
        </div>
      )}
    </div>
  );
}
