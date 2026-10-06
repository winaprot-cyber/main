import { useState } from 'react';
import { Bonus, Discount } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId } from '../utils/calculations';

interface Props {
  bonuses: Bonus[];
  discounts: Discount[];
  onAddBonus: (bonus: Bonus) => void;
  onDeleteBonus: (id: string) => void;
  onAddDiscount: (discount: Discount) => void;
  onUpdateDiscount: (id: string, updated: Partial<Discount>) => void;
  onDeleteDiscount: (id: string) => void;
}

export function FinancialManager({ bonuses, discounts, onAddBonus, onDeleteBonus, onAddDiscount, onUpdateDiscount, onDeleteDiscount }: Props) {
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
      {/* Resumen general */}
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

      {/* Tabs */}
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

      {/* Bonuses Tab */}
      {activeTab === 'bonuses' && (
        <div className="space-y-3">
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
                    placeholder="Ej: Bono de productividad, Bono navideño, etc."
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
                      className={`py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        bonusType === 'fixed'
                          ? 'bg-green-500/30 border-green-500/50 text-green-300 border'
                          : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                      }`}
                    >
                      <i className="fas fa-lock"></i>
                      Fijo
                    </button>
                    <button
                      type="button"
                      onClick={() => setBonusType('variable')}
                      className={`py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        bonusType === 'variable'
                          ? 'bg-amber-500/30 border-amber-500/50 text-amber-300 border'
                          : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                      }`}
                    >
                      <i className="fas fa-chart-line"></i>
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

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Descripción (opcional)</label>
                  <textarea
                    value={bonusDescription}
                    onChange={(e) => setBonusDescription(e.target.value)}
                    placeholder="Detalles adicionales..."
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={bonusStartDate}
                    onChange={(e) => setBonusStartDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                  />
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

          {/* Lista de bonos */}
          {bonuses.length === 0 ? (
            <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
              <i className="fas fa-gift text-4xl text-slate-600 mb-3"></i>
              <p className="text-slate-400">No hay bonos registrados</p>
              <p className="text-xs text-slate-500 mt-1">Agrega bonos fijos o variables</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 px-1">
                <i className="fas fa-list text-green-400"></i>
                Bonos Registrados
              </h4>
              {bonuses.map(bonus => (
                <div key={bonus.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        bonus.type === 'fixed' 
                          ? 'bg-green-500/20 border border-green-500/30'
                          : bonus.type === 'variable'
                          ? 'bg-amber-500/20 border border-amber-500/30'
                          : 'bg-purple-500/20 border border-purple-500/30'
                      }`}>
                        <i className={`fas ${bonus.type === 'fixed' ? 'fa-lock text-green-400' : bonus.type === 'variable' ? 'fa-chart-line text-amber-400' : 'fa-piggy-bank text-purple-400'}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm">{bonus.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            bonus.type === 'fixed'
                              ? 'bg-green-500/20 text-green-300'
                              : bonus.type === 'variable'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {bonus.type === 'fixed' ? 'Fijo' : bonus.type === 'variable' ? 'Variable' : 'Fondo Reserva'}
                          </span>
                          <span className="text-xs text-slate-500">
                            Desde {format(parseISO(bonus.startDate), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                        {bonus.description && (
                          <p className="text-xs text-slate-400 mt-1 italic">{bonus.description}</p>
                        )}
                      </div>
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

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <div className="space-y-3">
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
                    placeholder="Ej: Préstamo personal, etc."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Tipo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['loan', 'rol', 'quirurgico', 'iess', 'iess_aporte', 'other'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDiscountType(type)}
                        className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                          discountType === type
                            ? 'bg-rose-500/30 border-rose-500/50 text-rose-300 border'
                            : 'bg-slate-700/50 border border-slate-600 text-slate-400'
                        }`}
                      >
                        {type === 'loan' ? 'Préstamo' : type === 'rol' ? 'Rol' : type === 'quirurgico' ? 'Préstamo Quirúrgico' : type === 'iess' ? 'IESS Salud' : type === 'iess_aporte' ? 'Aporte IESS' : 'Otro'}
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

                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Notas (opcional)</label>
                  <textarea
                    value={discountNotes}
                    onChange={(e) => setDiscountNotes(e.target.value)}
                    placeholder="Detalles adicionales..."
                    rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none"
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

          {/* Lista de descuentos activos */}
          {activeDiscounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 px-1">
                <i className="fas fa-clock text-amber-400"></i>
                Activos ({activeDiscounts.length})
              </h4>
              {activeDiscounts.map(discount => {
                const paid = discount.completedPayments * discount.paymentAmount;
                const pending = discount.totalAmount - paid;
                const progress = (discount.completedPayments / discount.totalPayments) * 100;
                const remainingPayments = discount.totalPayments - discount.completedPayments;

                return (
                  <div key={discount.id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500/20 border border-rose-500/30">
                          <i className="fas fa-hand-holding-usd text-rose-400"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm">{discount.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                              {discount.type === 'loan' ? 'Préstamo' : discount.type === 'rol' ? 'Rol' : discount.type === 'quirurgico' ? 'Préstamo Quirúrgico' : discount.type === 'iess' ? 'IESS Salud' : discount.type === 'iess_aporte' ? 'Aporte IESS' : 'Otro'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {remainingPayments} pago{remainingPayments !== 1 ? 's' : ''} pendiente{remainingPayments !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onDeleteDiscount(discount.id)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                        >
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
                        <div className="text-sm font-bold text-green-400">${paid.toFixed(2)}</div>
                      </div>
                      <div className="bg-rose-500/10 rounded-lg p-2 border border-rose-500/20">
                        <div className="text-[10px] text-rose-400 uppercase">Pendiente</div>
                        <div className="text-sm font-bold text-rose-400">${pending.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Cuota {discount.completedPayments} / {discount.totalPayments}</span>
                        <span className="text-slate-300 font-medium">${discount.paymentAmount.toFixed(2)} / cuota</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <button
                        onClick={() => handleRegisterPayment(discount.id)}
                        className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-xs font-medium text-green-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        <i className="fas fa-check-circle"></i>
                        Pagar Cuota
                      </button>
                      {discount.completedPayments > 0 && (
                        <button
                          onClick={() => undoPayment(discount.id)}
                          className="py-2 px-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-xs font-medium text-slate-400 transition-all"
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

          {/* Lista de descuentos completados */}
          {completedDiscounts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 px-1">
                <i className="fas fa-check-double text-green-400"></i>
                Completados ({completedDiscounts.length})
              </h4>
              {completedDiscounts.map(discount => (
                <div key={discount.id} className="bg-slate-800/40 rounded-xl p-4 border border-green-500/20 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20 border border-green-500/30">
                        <i className="fas fa-check-circle text-green-400"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm line-through opacity-70">{discount.name}</h4>
                        <span className="text-xs text-green-400">
                          ✓ Pagado - ${discount.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteDiscount(discount.id)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                    >
                      <i className="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {discounts.length === 0 && !showDiscountForm && (
            <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
              <i className="fas fa-hand-holding-usd text-4xl text-slate-600 mb-3"></i>
              <p className="text-slate-400">No hay descuentos registrados</p>
              <p className="text-xs text-slate-500 mt-1">Agrega préstamos o descuentos al rol</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
