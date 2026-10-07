import { useState, useEffect } from 'react';
import { AttendanceRecord, Holiday, Bonus, Discount } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, getDay, getISOWeek, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  records: AttendanceRecord[];
  bonuses: Bonus[];
  discounts: Discount[];
  holidays: Holiday[];
}

const STORAGE_KEY_SALARY = 'asistencia_hl_salary';
const STORAGE_KEY_RATE100 = 'asistencia_hl_rate100';
const STORAGE_KEY_RATE50 = 'asistencia_hl_rate50';
const STORAGE_KEY_QUINCE = 'asistencia_hl_quincena';

export function ProjectionPay({ records, bonuses, discounts, holidays }: Props) {
  const now = new Date();

  const [salary, setSalary] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_SALARY);
    return stored ? parseFloat(stored) : 0;
  });

  const [rate100, setRate100] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_RATE100);
    return stored ? parseFloat(stored) : 4.39;
  });

  const [rate50, setRate50] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_RATE50);
    return stored ? parseFloat(stored) : 3.29;
  });

  const [quincena, setQuincena] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_QUINCE);
    return stored ? parseFloat(stored) : 0;
  });

  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => {
    const stored = localStorage.getItem('asistencia_hl_selected_week_start');
    return stored || format(startOfMonth(now), 'yyyy-MM-dd');
  });

  const [selectedWeekEnd, setSelectedWeekEnd] = useState<string>(() => {
    const stored = localStorage.getItem('asistencia_hl_selected_week_end');
    return stored || format(endOfMonth(now), 'yyyy-MM-dd');
  });

  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [showBonusesDetail, setShowBonusesDetail] = useState(false);
  const [showDiscountsDetail, setShowDiscountsDetail] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_SALARY, salary.toString()); }, [salary]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_RATE100, rate100.toString()); }, [rate100]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_RATE50, rate50.toString()); }, [rate50]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_QUINCE, quincena.toString()); }, [quincena]);
  useEffect(() => { localStorage.setItem('asistencia_hl_selected_week_start', selectedWeekStart); }, [selectedWeekStart]);
  useEffect(() => { localStorage.setItem('asistencia_hl_selected_week_end', selectedWeekEnd); }, [selectedWeekEnd]);

  const hourlyRate = salary > 0 ? salary / 30 / 8 : 0;

  // Bonuses
  const fixedBonuses = bonuses.filter(b => b.type === 'fixed').reduce((sum, b) => sum + b.amount, 0);
  const variableBonuses = bonuses.filter(b => b.type === 'variable').reduce((sum, b) => sum + b.amount, 0);
  const fondoReservaBonuses = bonuses.filter(b => b.type === 'fondo_reserva').reduce((sum, b) => sum + b.amount, 0);
  const totalBonuses = fixedBonuses + variableBonuses + fondoReservaBonuses;

  // Descuentos activos
  const activeDiscounts = discounts.filter(d => d.completedPayments < d.totalPayments);
  const monthlyDiscountPayment = activeDiscounts.reduce((sum, d) => {
    if (d.customPayments && d.customPayments.length > d.completedPayments) {
      return sum + d.customPayments[d.completedPayments];
    }
    return sum + d.paymentAmount;
  }, 0);

  // Cálculo mensual - SOLO semanas seleccionadas
  const monthStart = parseISO(selectedWeekStart);
  const monthEnd = parseISO(selectedWeekEnd);

  const monthlyWeeks: any[] = [];

  let current = startOfWeek(monthStart, { weekStartsOn: 1 });
  const finalWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  while (current <= finalWeekEnd) {
    const wStart = current;
    const wEnd = endOfWeek(current, { weekStartsOn: 1 });
    const weekNum = getISOWeek(current);
    
    const wRecords = records.filter(r => {
      const rDate = parseISO(r.date);
      return isWithinInterval(rDate, { start: wStart, end: wEnd });
    });

    const wWeekday = wRecords.filter(r => {
      const day = getDay(parseISO(r.date));
      return day >= 1 && day <= 5 && !r.isHoliday;
    });
    
    const wWeekend = wRecords.filter(r => {
      const day = getDay(parseISO(r.date));
      return (day === 0 || day === 6) && !r.isHoliday;
    });

    const wHoliday = wRecords.filter(r => r.isHoliday);
    const wWeekdayHoliday = wHoliday.filter(r => {
      const day = getDay(parseISO(r.date));
      return day >= 1 && day <= 5;
    });
    const wWeekendHoliday = wHoliday.filter(r => {
      const day = getDay(parseISO(r.date));
      return day === 0 || day === 6;
    });

    const wWeekdayHours = wWeekday.reduce((sum, r) => sum + r.hoursWorked, 0);
    const wWeekendHours = wWeekend.reduce((sum, r) => sum + r.hoursWorked, 0);
    const wHolidayHours = wHoliday.reduce((sum, r) => sum + r.hoursWorked, 0);
    const wWeekdayHolidayHours = wWeekdayHoliday.reduce((sum, r) => sum + r.hoursWorked, 0);
    const wWeekendHolidayHours = wWeekendHoliday.reduce((sum, r) => sum + r.hoursWorked, 0);
    
    const wEffectiveWeekday = wWeekdayHours + wWeekdayHolidayHours;
    const wTotalOvertime = Math.max(0, wEffectiveWeekday - 45);
    
    // Horas al 50%: extras normales de lunes a viernes
    const wHours50 = wTotalOvertime;
    
    // Horas al 100%: feriados de lunes a viernes + fin de semana si se cumplieron 45h + feriados de fin de semana
    const wMetTarget = wEffectiveWeekday >= 45;
    const wHours100 = wWeekdayHolidayHours + (wMetTarget ? wWeekendHours : 0) + wWeekendHolidayHours;
    
    const wPay50 = wHours50 * rate50;
    const wPay100 = wHours100 * rate100;

    monthlyWeeks.push({
      weekdayHours: wWeekdayHours,
      weekendHours: wWeekendHours,
      holidayHours: wHolidayHours,
      weekdayHolidayHours: wWeekdayHolidayHours,
      weekendHolidayHours: wWeekendHolidayHours,
      hours50: wHours50,
      hours100: wHours100,
      pay50: wPay50,
      pay100: wPay100,
      metTarget: wMetTarget,
      totalExtraPay: wPay50 + wPay100,
      weekNumber: weekNum,
      weekStart: wStart,
      weekEnd: wEnd
    });

    current = addWeeks(current, 1);
  }

  const monthlyHours50 = monthlyWeeks.reduce((sum, w) => sum + w.hours50, 0);
  const monthlyHours100 = monthlyWeeks.reduce((sum, w) => sum + w.hours100, 0);
  const monthlyPay50 = monthlyWeeks.reduce((sum, w) => sum + w.pay50, 0);
  const monthlyPay100 = monthlyWeeks.reduce((sum, w) => sum + w.pay100, 0);
  const monthlyExtraPay = monthlyPay50 + monthlyPay100;

  // Base de ingreso = Sueldo + Horas Extras
  const baseIngreso = salary + monthlyExtraPay;

  // Cálculo final
  const grossIncome = salary + monthlyExtraPay + totalBonuses;
  const netIncome = grossIncome - monthlyDiscountPayment - quincena;

  return (
    <div className="space-y-6">
      {/* Configuración */}
      <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <i className="fas fa-cog text-green-400"></i>
          Configuración de Pago
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Sueldo Base Mensual</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={salary || ''}
                onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                placeholder="Ingrese su sueldo mensual"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
            <label className="block text-sm text-slate-300 mb-1.5 flex items-center gap-2">
              <i className="fas fa-calendar-check text-purple-400"></i>
              Quincena (Pago fijo del 15)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                value={quincena || ''}
                onChange={(e) => setQuincena(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                <span className="text-amber-400">●</span> Valor/hora 50%
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={rate50 || ''}
                  onChange={(e) => setRate50(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700/50 border border-amber-500/30 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                <span className="text-blue-400">●</span> Valor/hora 100%
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={rate100 || ''}
                  onChange={(e) => setRate100(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700/50 border border-blue-500/30 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                <i className="fas fa-calendar-week mr-1 text-cyan-400"></i>
                Semana inicial
              </label>
              <select
                value={selectedWeekStart}
                onChange={(e) => setSelectedWeekStart(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              >
                {Array.from({ length: 52 }, (_, i) => {
                  const weekDate = new Date(now.getFullYear(), 0, 1 + (i * 7));
                  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
                  const weekNum = getISOWeek(weekStart);
                  return (
                    <option key={i} value={format(weekStart, 'yyyy-MM-dd')}>
                      Sem {weekNum}: {format(weekStart, 'dd MMM', { locale: es })}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">
                <i className="fas fa-calendar-check mr-1 text-purple-400"></i>
                Semana final
              </label>
              <select
                value={selectedWeekEnd}
                onChange={(e) => setSelectedWeekEnd(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                {Array.from({ length: 52 }, (_, i) => {
                  const weekDate = new Date(now.getFullYear(), 0, 1 + (i * 7));
                  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
                  const weekNum = getISOWeek(weekEnd);
                  return (
                    <option key={i} value={format(weekEnd, 'yyyy-MM-dd')}>
                      Sem {weekNum}: {format(weekEnd, 'dd MMM', { locale: es })}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {salary > 0 && (
        <>
          {/* Botones interactivos de Bonos y Descuentos */}
          <div className="space-y-3">
            {/* Botón de Bonos */}
            {totalBonuses > 0 && (
              <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
                <button
                  onClick={() => setShowBonusesDetail(!showBonusesDetail)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <i className="fas fa-gift text-green-400"></i>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">Bonos Activos</div>
                      <div className="text-xs text-slate-400">
                        {bonuses.filter(b => b.type === 'fixed').length} fijos, {bonuses.filter(b => b.type === 'variable').length} variables{fondoReservaBonuses > 0 ? `, ${bonuses.filter(b => b.type === 'fondo_reserva').length} fondo reserva` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-green-400">+${totalBonuses.toFixed(2)}</span>
                    <i className={`fas fa-chevron-${showBonusesDetail ? 'up' : 'down'} text-slate-400`}></i>
                  </div>
                </button>
                
                {showBonusesDetail && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-700/50">
                    {bonuses.map(bonus => (
                      <div key={bonus.id} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className={`fas ${bonus.type === 'fixed' ? 'fa-lock text-green-400' : bonus.type === 'variable' ? 'fa-chart-line text-amber-400' : 'fa-piggy-bank text-purple-400'}`}></i>
                          <div>
                            <div className="text-sm font-medium text-white">{bonus.name}</div>
                            <div className="text-xs text-slate-400">
                              {bonus.type === 'fixed' ? 'Fijo' : bonus.type === 'variable' ? 'Variable' : 'Fondo de Reserva'}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-400">${bonus.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botón de Descuentos */}
            {(monthlyDiscountPayment > 0 || discounts.find(d => d.type === 'iess') || discounts.find(d => d.type === 'iess_aporte')) && (
              <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden">
                <button
                  onClick={() => setShowDiscountsDetail(!showDiscountsDetail)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                      <i className="fas fa-hand-holding-usd text-rose-400"></i>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">Descuentos Activos</div>
                      <div className="text-xs text-slate-400">
                        {activeDiscounts.length} préstamos + IESS
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-rose-400">
                      -${(monthlyDiscountPayment + (discounts.find(d => d.type === 'iess') ? (baseIngreso * 3.41) / 100 : 0) + (discounts.find(d => d.type === 'iess_aporte') ? (baseIngreso * 9.45) / 100 : 0) + quincena).toFixed(2)}
                    </span>
                    <i className={`fas fa-chevron-${showDiscountsDetail ? 'up' : 'down'} text-slate-400`}></i>
                  </div>
                </button>
                
                {showDiscountsDetail && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-700/50">
                    {/* IESS Salud Cónyuge */}
                    {discounts.find(d => d.type === 'iess') && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-hospital text-blue-400"></i>
                          <div>
                            <div className="text-sm font-medium text-white">IESS Salud Cónyuge</div>
                            <div className="text-xs text-slate-400">3.41% de base ingreso</div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-blue-400">-${((baseIngreso * 3.41) / 100).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Aporte Personal IESS */}
                    {discounts.find(d => d.type === 'iess_aporte') && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-user-shield text-green-400"></i>
                          <div>
                            <div className="text-sm font-medium text-white">Aporte Personal IESS</div>
                            <div className="text-xs text-slate-400">9.45% de base ingreso</div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-400">-${((baseIngreso * 9.45) / 100).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Quincena */}
                    {quincena > 0 && (
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-calendar-check text-purple-400"></i>
                          <div>
                            <div className="text-sm font-medium text-white">Quincena</div>
                            <div className="text-xs text-slate-400">Pago fijo del 15</div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-purple-400">-${quincena.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Préstamos y otros descuentos */}
                    {activeDiscounts.filter(d => d.type !== 'iess' && d.type !== 'iess_aporte').map(discount => (
                      <div key={discount.id} className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-hand-holding-usd text-rose-400"></i>
                          <div>
                            <div className="text-sm font-medium text-white">{discount.name}</div>
                            <div className="text-xs text-slate-400">
                              {discount.completedPayments}/{discount.totalPayments} pagos
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-rose-400">-${discount.paymentAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proyección Mensual - SOLO semanas seleccionadas */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <i className="fas fa-calendar text-purple-400"></i>
              Proyección Mensual - {format(now, "MMMM yyyy", { locale: es })}
            </h3>
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <i className="fas fa-info-circle text-cyan-400"></i>
                  Periodo de cobro:
                </span>
                <span className="text-sm font-semibold text-cyan-400">
                  {format(monthStart, "dd MMM", { locale: es })} - {format(monthEnd, "dd MMM yyyy", { locale: es })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {monthlyWeeks.map((week, index) => {
                const isExpanded = expandedWeek === index;
                return (
                  <div key={index} className="bg-slate-700/30 rounded-xl border border-slate-600/30 overflow-hidden">
                    <div 
                      className="p-3 cursor-pointer hover:bg-slate-700/50 transition-all"
                      onClick={() => setExpandedWeek(isExpanded ? null : index)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs text-slate-500`}></i>
                          Semana {week.weekNumber}
                          <span className="text-xs text-slate-500">
                            ({format(week.weekStart, "dd MMM", { locale: es })} - {format(week.weekEnd, "dd MMM", { locale: es })})
                          </span>
                        </span>
                        <span className="text-sm text-green-400 font-semibold">${week.totalExtraPay.toFixed(2)}</span>
                      </div>
                      
                      {/* Resumen de horas al 50% y 100% */}
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                          <div className="text-xs text-amber-300 mb-1">Horas al 50%</div>
                          <div className="text-lg font-bold text-amber-400">{week.hours50.toFixed(1)}h</div>
                          <div className="text-xs text-slate-500">${week.pay50.toFixed(2)}</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                          <div className="text-xs text-blue-300 mb-1">Horas al 100%</div>
                          <div className="text-lg font-bold text-blue-400">{week.hours100.toFixed(1)}h</div>
                          <div className="text-xs text-slate-500">${week.pay100.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-600/30 bg-slate-800/50 p-4 space-y-3">
                        <div className="text-xs text-slate-400 mb-2">
                          <i className="fas fa-calendar-alt mr-1"></i>
                          {format(week.weekStart, 'dd MMM', { locale: es })} - {format(week.weekEnd, 'dd MMM yyyy', { locale: es })}
                        </div>

                        {/* Detalle de horas al 50% */}
                        {week.hours50 > 0 && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
                              <i className="fas fa-percentage"></i>
                              Horas al 50% (Extras Lun-Vie)
                            </h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Horas extras después de 45h:</span>
                                <span className="text-amber-400 font-semibold">{week.hours50.toFixed(1)}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Tarifa:</span>
                                <span className="text-amber-400 font-semibold">${rate50}/h</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-amber-500/20">
                                <span className="text-amber-300 font-semibold">Total a pagar:</span>
                                <span className="text-amber-400 font-bold">${week.pay50.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detalle de horas al 100% */}
                        {week.hours100 > 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                              <i className="fas fa-percentage"></i>
                              Horas al 100%
                            </h4>
                            <div className="space-y-2 text-xs">
                              {week.weekdayHolidayHours > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Feriados Lun-Vie:</span>
                                  <span className="text-blue-400 font-semibold">{week.weekdayHolidayHours.toFixed(1)}h</span>
                                </div>
                              )}
                              {week.metTarget && week.weekendHours > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Sáb-Dom (meta 45h cumplida):</span>
                                  <span className="text-blue-400 font-semibold">{week.weekendHours.toFixed(1)}h</span>
                                </div>
                              )}
                              {week.weekendHolidayHours > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Feriados Sáb-Dom:</span>
                                  <span className="text-blue-400 font-semibold">{week.weekendHolidayHours.toFixed(1)}h</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-400">Total horas al 100%:</span>
                                <span className="text-blue-400 font-semibold">{week.hours100.toFixed(1)}h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Tarifa:</span>
                                <span className="text-blue-400 font-semibold">${rate100}/h</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-blue-500/20">
                                <span className="text-blue-300 font-semibold">Total a pagar:</span>
                                <span className="text-blue-400 font-bold">${week.pay100.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Total de la semana */}
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-white">Total extras semana:</span>
                            <span className="text-xl font-bold text-green-400">${week.totalExtraPay.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Resumen mensual */}
              <div className="bg-slate-700/40 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-300">Total horas al 50% ({monthlyHours50.toFixed(1)}h × ${rate50}):</span>
                  <span className="text-amber-400 font-semibold">${monthlyPay50.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-300">Total horas al 100% ({monthlyHours100.toFixed(1)}h × ${rate100}):</span>
                  <span className="text-blue-400 font-semibold">${monthlyPay100.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-600/50 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total extras mes:</span>
                    <span className="text-xl font-bold text-green-400">${monthlyExtraPay.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-slate-600/50 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Sueldo base:</span>
                    <span className="text-white font-semibold">${salary.toFixed(2)}</span>
                  </div>
                  {totalBonuses > 0 && (
                    <div className="flex justify-between mt-1">
                      <span className="text-green-300">Bonos:</span>
                      <span className="text-green-400 font-semibold">+${totalBonuses.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between mt-1">
                    <span className="text-white font-semibold">Ingreso bruto:</span>
                    <span className="text-emerald-400 font-semibold">${grossIncome.toFixed(2)}</span>
                  </div>
                </div>

                {quincena > 0 && (
                  <div className="border-t border-slate-600/50 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300 flex items-center gap-1">
                        <i className="fas fa-calendar-check"></i>
                        Quincena:
                      </span>
                      <span className="text-purple-400 font-semibold">-${quincena.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {monthlyDiscountPayment > 0 && (
                  <div className="border-t border-slate-600/50 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-rose-300 flex items-center gap-1">
                        <i className="fas fa-hand-holding-usd"></i>
                        Descuentos:
                      </span>
                      <span className="text-rose-400 font-semibold">-${monthlyDiscountPayment.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-600/50 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">Neto a recibir:</span>
                    <span className={`text-2xl font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${netIncome.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {salary === 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
          <i className="fas fa-calculator text-4xl text-slate-600 mb-3"></i>
          <p className="text-slate-400">Ingrese su sueldo base mensual</p>
          <p className="text-xs text-slate-500 mt-1">para ver la proyección de pago</p>
        </div>
      )}
    </div>
  );
}
