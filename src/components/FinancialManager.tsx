import { useState } from 'react';
import { Bonus, Discount } from '../types';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId } from '../utils/calculations';
import { calculateMonthlyExtraPay } from '../utils/payCalculations';
import { AttendanceRecord } from '../types';

interface Props {
  records: AttendanceRecord[];
  bonuses: Bonus[];
  discounts: Discount[];
  onAddBonus: (bonus: Bonus) => void;
  onDeleteBonus: (id: string) => void;
  onAddDiscount: (discount: Discount) => void;
  onUpdateDiscount: (id: string, updated: Partial<Discount>) => void;
  onDeleteDiscount: (id: string) => void;
}

export function FinancialManager({ records, bonuses, discounts, onAddBonus, onDeleteBonus, onAddDiscount, onUpdateDiscount, onDeleteDiscount }: Props) {
  const [activeTab, setActiveTab] = useState<'bonuses' | 'discounts'>('bonuses');
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);

  // Bonus form state
  const [bonusName, setBonusName] = useState('');
  const [bonusType, setBonusType] = useState<'fixed' | 'variable' | 'fondo_reserva'>('fixed');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusDescription, setBonusDescription] = useState('');
  const [bonusStartDate, setBonusStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Discount form state
  const [discountName, setDiscountName] = useState('');
  const [discountType, setDiscountType] = useState<'loan' | 'rol' | 'quirurgico' | 'iess' | 'iess_aporte' | 'other'>('loan');
  const [discountTotal, setDiscountTotal] = useState('');
  const [discountPayments, setDiscountPayments] = useState('');
  const [discountPaymentAmount, setDiscountPaymentAmount] = useState('');
  const [discountStartDate, setDiscountStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [discountNotes, setDiscountNotes] = useState('');

  // IESS state
  const salaryBase = parseFloat(localStorage.getItem('asistencia_hl_salary') || '0');
  const payStartDate = localStorage.getItem('asistencia_hl_selected_week_start');
  const payEndDate = localStorage.getItem('asistencia_hl_selected_week_end');
  const currentMonth = new Date();
  const periodStart = payStartDate ? parseISO(payStartDate) : startOfMonth(currentMonth);
  
  const rate100 = parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39');
  const rate50 = parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29');
  const periodExtraPay = calculateMonthlyExtraPay(records, rate100, rate50, periodStart, payStartDate || undefined, payEndDate || undefined);
  const baseIngreso = salaryBase + periodExtraPay;

  const iessPercentage = 3.41;
  const iessAmount = (baseIngreso * iessPercentage) / 100;
  const iessAportePercentage = 9.45;
  const iessAporteAmount = (baseIngreso * iessAportePercentage) / 100;
  const fondoReservaPercentage = 8.33;
  const fondoReservaAmount = (baseIngreso * fondoReservaPercentage) / 100;

  const iessDiscount = discounts.find(d => d.type === 'iess');
  const iessAporteDiscount = discounts.find(d => d.type === 'iess_aporte');
  const fondoReservaBonus = bonuses.find(b => b.type === 'fondo_reserva');

  const resetBonusForm = () => {
    setBonusName('');
    setBonusType('fixed');
    setBonusAmount('');
    setBonusDescription('');
    setBonusStartDate(format(new Date(), 'yyyy-MM-dd'));
    setShowBonusForm(false);
  };

  const resetDiscountForm = () => {
    setDiscountName('');
    setDiscountType('loan');
    setDiscountTotal('');
    setDiscountPayments('');
    setDiscountPaymentAmount('');
    setDiscountStartDate(format(new Date(), 'yyyy-MM-dd'));
    setDiscountNotes('');
    setShowDiscountForm(false);
  };

  const handleAddBonus = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bonusAmount);
    if (!bonusName.trim() || isNaN(amount) || amount <= 0) return;

    const bonus: Bonus = {
      id: generateId(),
      name: bonusName.trim(),
      type: bonusType,
      amount,
      description: bonusDescription.trim() || undefined,
      startDate: bonusStartDate,
    };

    onAddBonus(bonus);
    resetBonusForm();
  };

  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(discountTotal);
    const totalPayments = parseInt(discountPayments);
    const paymentAmount = parseFloat(discountPaymentAmount) || (totalPayments > 0 ? totalAmount / totalPayments : 0);

    if (!discountName.trim() || isNaN(totalAmount) || totalAmount <= 0 || isNaN(totalPayments) || totalPayments <= 0) return;

    const discount: Discount = {
      id: generateId(),
      name: discountName.trim(),
      type: discountType,
      totalAmount,
      totalPayments,
      completedPayments: 0,
      paymentAmount: Math.round(paymentAmount * 100) / 100,
      startDate: discountStartDate,
      notes: discountNotes.trim() || undefined,
    };

    onAddDiscount(discount);
    resetDiscountForm();
  };

  const handleToggleIESS = () => {
    if (iessDiscount) {
      onDeleteDiscount(iessDiscount.id);
    } else {
      const newDiscount: Discount = {
        id: generateId(),
        name: 'EXTENSION IESS SALUD CONYUGE',
        type: 'iess',
        totalAmount: iessAmount,
        totalPayments: 1,
        completedPayments: 0,
        paymentAmount: iessAmount,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        notes: `Descuento fijo mensual del ${iessPercentage}% sobre base de ingreso $${baseIngreso.toFixed(2)}`,
        percentage: iessPercentage
      };
      onAddDiscount(newDiscount);
    }
  };

  const handleToggleIESSAporte = () => {
    if (iessAporteDiscount) {
      onDeleteDiscount(iessAporteDiscount.id);
    } else {
      const newDiscount: Discount = {
        id: generateId(),
        name: 'APORTE PERSONAL IESS',
        type: 'iess_aporte',
        totalAmount: iessAporteAmount,
        totalPayments: 1,
        completedPayments: 0,
        paymentAmount: iessAporteAmount,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        notes: `Aporte personal del ${iessAportePercentage}% sobre base de ingreso $${baseIngreso.toFixed(2)}`,
        percentage: iessAportePercentage
      };
      onAddDiscount(newDiscount);
    }
  };

  const handleToggleFondoReserva = () => {
    if (fondoReservaBonus) {
      onDeleteBonus(fondoReservaBonus.id);
    } else {
      const newBonus: Bonus = {
        id: generateId(),
        name: 'FONDO DE RESERVA MENSUAL',
        type: 'fondo_reserva',
        amount: fondoReservaAmount,
        description: `Fondo de reserva del ${fondoReservaPercentage}% sobre base de ingreso $${baseIngreso.toFixed(2)}`,
        startDate: format(new Date(), 'yyyy-MM-dd')
      };
      onAddBonus(newBonus);
    }
  };

  const handleRegisterPayment = (id: string) => {
    const discount = discounts.find(d => d.id === id);
    if (discount && discount.completedPayments < discount.totalPayments) {
      onUpdateDiscount(id, { completedPayments: discount.completedPayments + 1 });
    }
  };

  const undoPayment = (id: string) => {
    const discount = discounts.find(d => d.id === id);
    if (discount && discount.completedPayments > 0) {
      onUpdateDiscount(id, { completedPayments: discount.completedPayments - 1 });
    }
  };

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const fixedBonuses = bonuses.filter(b => b.type === 'fixed').reduce((sum, b) => sum + b.amount, 0);
  const variableBonuses = bonuses.filter(b => b.type === 'variable').reduce((sum, b) => sum + b.amount, 0);
  const fondoReservaBonuses = bonuses.filter(b => b.type === 'fondo_reserva').reduce((sum, b) => sum + b.amount, 0);
  
  const totalDebt = discounts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalPaid = discounts.reduce((sum, d) => sum + (d.completedPayments * d.paymentAmount), 0);
  const totalPending = totalDebt - totalPaid;
  const activeDiscounts = discounts.filter(d => d.completedPayments < d.totalPayments);
  const completedDiscounts = discounts.filter(d => d.completedPayments >= d.totalPayments);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500/10 to-rose-500/10 rounded-2xl p-5 border border-emerald-500/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-wallet text-emerald-400"></i>
          Resumen Financiero
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Total Bonos</div>
            <div className="text-xl font-bold text-green-400">${totalBonuses.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">Fijos: ${fixedBonuses.toFixed(2)} | Variables: ${variableBonuses.toFixed(2)} | Fondo Reserva: ${fondoReservaBonuses.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3">
            <div className="text-xs text-slate-400 mb-1">Total Descuentos</div>
            <div className="text-xl font-bold text-rose-400">${totalPending.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">Pagado: ${totalPaid.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('bonuses')}
          className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bonuses'
              ? 'bg-green-500/20 border-green-500/50 text-green-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <i className="fas fa-gift"></i>
          Bonos ({bonuses.length})
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'discounts'
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 border'
              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          <i className="fas fa-hand-holding-usd"></i>
          Descuentos ({discounts.length})
        </button>
      </div>

      {activeTab === 'bonuses' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                  <i className="fas fa-piggy-bank text-amber-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">FONDO DE RESERVA MENSUAL</h3>
                  <p className="text-xs text-slate-400 mt-1">Bono fijo del 8.33% sobre base de ingreso</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Base de Ingreso</div>
                  <div className="text-lg font-bold text-white">${baseIngreso.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Porcentaje</div>
                  <div className="text-lg font-bold text-amber-400">{fondoReservaPercentage}%</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-400 mb-1">Monto Mensual</div>
                  <div className="text-2xl font-bold text-orange-400">${fondoReservaAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleFondoReserva}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                fondoReservaBonus
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                  : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25'
              }`}
            >
              <i className={`fas ${fondoReservaBonus ? 'fa-times-circle' : 'fa-plus-circle'}`}></i>
              {fondoReservaBonus ? 'Desactivar Fondo de Reserva' : 'Activar Fondo de Reserva'}
            </button>
          </div>

          {!showBonusForm ? (
            <button
              onClick={() => setShowBonusForm(true)}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl font-semibold text-white shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Agregar Bono
            </button>
          ) : (
            <form onSubmit={handleAddBonus} className="bg-slate-800/80 rounded-2xl p-5 border border-green-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-gift text-green-400"></i>
                Nuevo Bono
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Nombre del Bono</label>
                  <input
                    type="text"
                    value={bonusName}
                    onChange={(e) => setBonusName(e.target.value)}
                    placeholder="Ej: Bono de productividad"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Tipo de Bono</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBonusType('fixed')}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        bonusType === 'fixed'
                          ? 'bg-green-500/30 border-green-500/50 text-green-300 border'
                          : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                      }`}
                    >
                      Fijo
                    </button>
                    <button
                      type="button"
                      onClick={() => setBonusType('variable')}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        bonusType === 'variable'
                          ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 border'
                          : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                      }`}
                    >
                      Variable
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetBonusForm}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl font-medium text-white shadow-lg transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          )}

          {bonuses.length === 0 ? (
            <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
              <i className="fas fa-gift text-4xl text-slate-600 mb-3"></i>
              <p className="text-slate-400">No hay bonos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bonuses.map(bonus => (
                <div key={bonus.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{bonus.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{bonus.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg font-bold text-green-400">${bonus.amount.toFixed(2)}</div>
                      <button
                        onClick={() => onDeleteBonus(bonus.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20 mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">EXTENSION IESS SALUD CONYUGE</h3>
            <p className="text-sm text-slate-400 mb-3">3.41% sobre base de ingreso</p>
            <div className="text-2xl font-bold text-cyan-400 mb-3">${iessAmount.toFixed(2)}</div>
            <button
              onClick={handleToggleIESS}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                iessDiscount
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg'
              }`}
            >
              {iessDiscount ? 'Desactivar' : 'Activar'}
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-5 border border-green-500/20 mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">APORTE PERSONAL IESS</h3>
            <p className="text-sm text-slate-400 mb-3">9.45% sobre base de ingreso</p>
            <div className="text-2xl font-bold text-emerald-400 mb-3">${iessAporteAmount.toFixed(2)}</div>
            <button
              onClick={handleToggleIESSAporte}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                iessAporteDiscount
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                  : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-lg'
              }`}
            >
              {iessAporteDiscount ? 'Desactivar' : 'Activar'}
            </button>
          </div>

          {!showDiscountForm ? (
            <button
              onClick={() => setShowDiscountForm(true)}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-500 rounded-2xl font-semibold text-white shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Agregar Descuento
            </button>
          ) : (
            <form onSubmit={handleAddDiscount} className="bg-slate-800/80 rounded-2xl p-5 border border-rose-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-hand-holding-usd text-rose-400"></i>
                Nuevo Descuento
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={discountName}
                    onChange={(e) => setDiscountName(e.target.value)}
                    placeholder="Ej: Préstamo personal"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Tipo</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                  >
                    <option value="loan">Préstamo</option>
                    <option value="rol">Rol</option>
                    <option value="quirurgico">Préstamo Quirúrgico</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Monto Total</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={discountTotal}
                      onChange={(e) => setDiscountTotal(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Cantidad de Pagos</label>
                  <input
                    type="number"
                    value={discountPayments}
                    onChange={(e) => setDiscountPayments(e.target.value)}
                    placeholder="Ej: 12"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                    min="1"
                    step="1"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetDiscountForm}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-500 rounded-xl font-medium text-white shadow-lg transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeDiscounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300">Activos ({activeDiscounts.length})</h4>
              {activeDiscounts.map(discount => {
                const paid = discount.completedPayments * discount.paymentAmount;
                const pending = discount.totalAmount - paid;
                const progress = (discount.completedPayments / discount.totalPayments) * 100;

                return (
                  <div key={discount.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{discount.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{discount.type}</p>
                      </div>
                      <button
                        onClick={() => onDeleteDiscount(discount.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-slate-700/30 rounded-lg p-2">
                        <div className="text-[10px] text-slate-500 uppercase">Total</div>
                        <div className="text-sm font-bold text-white">${discount.totalAmount.toFixed(2)}</div>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2">
                        <div className="text-[10px] text-green-400 uppercase">Pagado</div>
                        <div className="text-sm font-bold text-green-400">${paid.toFixed(2)}</div>
                      </div>
                      <div className="bg-rose-500/10 rounded-lg p-2">
                        <div className="text-[10px] text-rose-400 uppercase">Pendiente</div>
                        <div className="text-sm font-bold text-rose-400">${pending.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRegisterPayment(discount.id)}
                        className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-medium text-green-300 transition-all"
                      >
                        Pagar Cuota
                      </button>
                      {discount.completedPayments > 0 && (
                        <button
                          onClick={() => undoPayment(discount.id)}
                          className="py-2 px-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs font-medium text-slate-400 transition-all"
                        >
                          <i className="fas fa-undo"></i>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {discounts.length === 0 && !showDiscountForm && (
            <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
              <i className="fas fa-hand-holding-usd text-4xl text-slate-600 mb-3"></i>
              <p className="text-slate-400">No hay descuentos registrados</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
