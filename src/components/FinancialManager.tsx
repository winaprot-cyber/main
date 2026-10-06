import { useState, useEffect } from 'react';
import { AttendanceRecord, Bonus, Discount } from '../types';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId } from '../utils/calculations';
import { calculateMonthlyExtraPay } from '../utils/payCalculations';

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
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);

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
  const [customPaymentsList, setCustomPaymentsList] = useState<string[]>([]);
  const [useCustomPayments, setUseCustomPayments] = useState(false);

  // IESS Discount state
  const [salaryBase, setSalaryBase] = useState<number>(() => {
    const stored = localStorage.getItem('asistencia_hl_salary');
    return stored ? parseFloat(stored) : 0;
  });

  // Calcular horas extras del periodo seleccionado
  const payStartDate = localStorage.getItem('asistencia_hl_selected_week_start');
  const payEndDate = localStorage.getItem('asistencia_hl_selected_week_end');
  const currentMonth = new Date();
  const periodStart = payStartDate ? parseISO(payStartDate) : startOfMonth(currentMonth);
  
  const rate100 = parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39');
  const rate50 = parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29');
  const periodExtraPay = calculateMonthlyExtraPay(records, rate100, rate50, periodStart, payStartDate || undefined, payEndDate || undefined);

  // Base de ingreso = Sueldo + Horas Extras del periodo seleccionado
  const baseIngreso = salaryBase + periodExtraPay;

  // IESS Salud Cónyuge: 3.41% de la base de ingreso
  const iessPercentage = 3.41;
  const iessAmount = (baseIngreso * iessPercentage) / 100;

  // Aporte Personal IESS: 9.45% de la base de ingreso
  const iessAportePercentage = 9.45;
  const iessAporteAmount = (baseIngreso * iessAportePercentage) / 100;

  // Fondo de Reserva Mensual: 8.33% de la base de ingreso
  const fondoReservaPercentage = 8.33;
  const fondoReservaAmount = (baseIngreso * fondoReservaPercentage) / 100;

  // Verificar si los descuentos IESS y Fondo de Reserva ya existen
  const iessDiscount = discounts.find(d => d.type === 'iess');
  const iessAporteDiscount = discounts.find(d => d.type === 'iess_aporte');
  const fondoReservaBonus = bonuses.find(b => b.type === 'fondo_reserva');

  const handleToggleIESS = () => {
    if (iessDiscount) {
      onDeleteDiscount(iessDiscount.id);
    } else {
      const newIESSDiscount: Discount = {
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
      onAddDiscount(newIESSDiscount);
    }
  };

  const handleToggleIESSAporte = () => {
    if (iessAporteDiscount) {
      onDeleteDiscount(iessAporteDiscount.id);
    } else {
      const newIESSAporteDiscount: Discount = {
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
      onAddDiscount(newIESSAporteDiscount);
    }
  };

  const handleToggleFondoReserva = () => {
    if (fondoReservaBonus) {
      onDeleteBonus(fondoReservaBonus.id);
    } else {
      const newFondoReservaBonus: Bonus = {
        id: generateId(),
        name: 'FONDO DE RESERVA MENSUAL',
        type: 'fondo_reserva',
        amount: fondoReservaAmount,
        description: `Fondo de reserva del ${fondoReservaPercentage}% sobre base de ingreso $${baseIngreso.toFixed(2)}`,
        startDate: format(new Date(), 'yyyy-MM-dd')
      };
      onAddBonus(newFondoReservaBonus);
    }
  };

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
    setEditingDiscountId(null);
    setCustomPaymentsList([]);
    setUseCustomPayments(false);
  };

  const handleEditDiscount = (discount: Discount) => {
    setDiscountName(discount.name);
    setDiscountType(discount.type);
    setDiscountTotal(discount.totalAmount.toString());
    setDiscountPayments(discount.totalPayments.toString());
    setDiscountPaymentAmount(discount.paymentAmount.toString());
    setDiscountStartDate(discount.startDate);
    setDiscountNotes(discount.notes || '');
    setEditingDiscountId(discount.id);
    
    if (discount.customPayments && discount.customPayments.length > 0) {
      setCustomPaymentsList(discount.customPayments.map(p => p.toString()));
      setUseCustomPayments(true);
    } else {
      setCustomPaymentsList([]);
      setUseCustomPayments(false);
    }
    
    setShowDiscountForm(true);
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

    let customPayments: number[] | undefined;
    if (useCustomPayments && customPaymentsList.length === totalPayments) {
      customPayments = customPaymentsList.map(p => parseFloat(p) || 0);
      
      const customTotal = customPayments.reduce((sum, p) => sum + p, 0);
      if (Math.abs(customTotal - totalAmount) > 0.01) {
        alert(`La suma de los pagos personalizados ($${customTotal.toFixed(2)}) debe ser igual al monto total ($${totalAmount.toFixed(2)})`);
        return;
      }
    }

    if (editingDiscountId) {
      const existingDiscount = discounts.find(d => d.id === editingDiscountId);
      if (existingDiscount) {
        const updatedDiscount: Discount = {
          ...existingDiscount,
          name: discountName.trim(),
          type: discountType,
          totalAmount,
          totalPayments,
          paymentAmount: Math.round(paymentAmount * 100) / 100,
          customPayments: customPayments,
          startDate: discountStartDate,
          notes: discountNotes.trim() || undefined,
        };
        onUpdateDiscount(editingDiscountId, updatedDiscount);
      }
    } else {
      const discount: Discount = {
        id: generateId(),
        name: discountName.trim(),
        type: discountType,
        totalAmount,
        totalPayments,
        completedPayments: 0,
        paymentAmount: Math.round(paymentAmount * 100) / 100,
        customPayments: customPayments,
        startDate: discountStartDate,
        notes: discountNotes.trim() || undefined,
      };
      onAddDiscount(discount);
    }

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
          {/* Fondo de Reserva Mensual */}
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

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-300 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <span>
                  Fórmula: ${baseIngreso.toFixed(2)} × {fondoReservaPercentage}% = ${fondoReservaAmount.toFixed(2)} mensuales
                </span>
              </p>
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

            {fondoReservaBonus && (
              <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs text-amber-300 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  <span>Fondo de Reserva activo - Se agregará ${fondoReservaAmount.toFixed(2)} mensuales</span>
                </p>
              </div>
            )}
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
          {/* Base de Ingreso */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-purple-500/20 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                <i className="fas fa-calculator text-purple-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Base de Ingreso Mensual</h3>
                <p className="text-xs text-slate-400 mt-1">Sueldo base + Horas extras del periodo</p>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Sueldo Base</div>
                  <div className="text-lg font-bold text-white">${salaryBase.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Horas Extras (Periodo)</div>
                  <div className="text-lg font-bold text-green-400">${periodExtraPay.toFixed(2)}</div>
                </div>
                <div className="col-span-2 border-t border-slate-700 pt-3 mt-2">
                  <div className="text-xs text-slate-400 mb-1">Base de Ingreso Total</div>
                  <div className="text-2xl font-bold text-purple-400">${baseIngreso.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-purple-300 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <span>
                  Fórmula: ${salaryBase.toFixed(2)} + ${periodExtraPay.toFixed(2)} = ${baseIngreso.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {/* IESS Salud Cónyuge */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                  <i className="fas fa-hospital text-blue-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">EXTENSION IESS SALUD CONYUGE</h3>
                  <p className="text-xs text-slate-400 mt-1">Descuento fijo mensual del 3.41% sobre base de ingreso</p>
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
                  <div className="text-lg font-bold text-blue-400">{iessPercentage}%</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-400 mb-1">Monto Mensual</div>
                  <div className="text-2xl font-bold text-cyan-400">${iessAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-300 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <span>
                  Fórmula: ${baseIngreso.toFixed(2)} × {iessPercentage}% = ${iessAmount.toFixed(2)} mensuales
                </span>
              </p>
            </div>

            <button
              onClick={handleToggleIESS}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                iessDiscount
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              <i className={`fas ${iessDiscount ? 'fa-times-circle' : 'fa-plus-circle'}`}></i>
              {iessDiscount ? 'Desactivar IESS Salud Cónyuge' : 'Activar IESS Salud Cónyuge'}
            </button>

            {iessDiscount && (
              <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs text-green-300 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  <span>IESS Salud Cónyuge activo - Se descontará ${iessAmount.toFixed(2)} mensuales</span>
                </p>
              </div>
            )}
          </div>

          {/* Aporte Personal IESS */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-5 border border-green-500/20 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/30">
                  <i className="fas fa-user-shield text-green-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">APORTE PERSONAL IESS</h3>
                  <p className="text-xs text-slate-400 mt-1">Aporte personal del 9.45% sobre base de ingreso</p>
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
                  <div className="text-lg font-bold text-green-400">{iessAportePercentage}%</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-400 mb-1">Monto Mensual</div>
                  <div className="text-2xl font-bold text-emerald-400">${iessAporteAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-green-300 flex items-start gap-2">
                <i className="fas fa-info-circle mt-0.5"></i>
                <span>
                  Fórmula: ${baseIngreso.toFixed(2)} × {iessAportePercentage}% = ${iessAporteAmount.toFixed(2)} mensuales
                </span>
              </p>
            </div>

            <button
              onClick={handleToggleIESSAporte}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                iessAporteDiscount
                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
                  : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white shadow-lg shadow-green-500/25'
              }`}
            >
              <i className={`fas ${iessAporteDiscount ? 'fa-times-circle' : 'fa-plus-circle'}`}></i>
              {iessAporteDiscount ? 'Desactivar Aporte Personal IESS' : 'Activar Aporte Personal IESS'}
            </button>

            {iessAporteDiscount && (
              <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-xs text-green-300 flex items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  <span>Aporte Personal IESS activo - Se descontará ${iessAporteAmount.toFixed(2)} mensuales</span>
                </p>
              </div>
            )}
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
                {editingDiscountId ? 'Editar Descuento' : 'Nuevo Descuento'}
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
                    {(['loan', 'rol', 'quirurgico', 'other'] as const).map(type => (
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
                        {type === 'loan' ? 'Préstamo' : type === 'rol' ? 'Rol' : type === 'quirurgico' ? 'Préstamo Quirúrgico' : 'Otro'}
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
                    {editingDiscountId ? 'Actualizar' : 'Guardar'}
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
                          onClick={() => handleEditDiscount(discount)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-all"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
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
