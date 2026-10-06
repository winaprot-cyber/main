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

  // Cálculo semanal actual
  const getWeekRecords = () => {
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    return records.filter(r => {
      const rDate = parseISO(r.date);
      return isWithinInterval(rDate, { start: weekStart, end: weekEnd });
    });
  };

  const weekRecords = getWeekRecords();
  
  const weekdayRecords = weekRecords.filter(r => {
    const day = getDay(parseISO(r.date));
    return day >= 1 && day <= 5 && !r.isHoliday;
  });
  
  const weekendRecords = weekRecords.filter(r => {
    const day = getDay(parseISO(r.date));
    return (day === 0 || day === 6) && !r.isHoliday;
  });

  const holidayRecords = weekRecords.filter(r => r.isHoliday);

  const weekdayHours = weekdayRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  const weekendHours = weekendRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  const holidayHours = holidayRecords.reduce((sum, r) => sum + r.hoursWorked, 0);

  const weekdayHolidayHours = holidayRecords
    .filter(r => {
      const day = getDay(parseISO(r.date));
      return day >= 1 && day <= 5;
    })
    .reduce((sum, r) => sum + r.hoursWorked, 0);

  const weekendHolidayHours = holidayHours - weekdayHolidayHours;

  const effectiveWeekdayHours = weekdayHours + weekdayHolidayHours;
  const weekdayOvertimeHours = Math.max(0, effectiveWeekdayHours - 45);

  const metWeeklyTarget = effectiveWeekdayHours >= 45;
  const weekendPayRate = metWeeklyTarget ? rate100 : rate50;
  const weekendPayType = metWeeklyTarget ? '100%' : '50%';

  const holidayPay = holidayHours * rate100;

  const weeklyWeekdayOvertimePay = weekdayOvertimeHours * rate50;
  const weeklyWeekendPay = weekendHours * weekendPayRate;
  const weeklyExtraPay = weeklyWeekdayOvertimePay + weeklyWeekendPay + holidayPay;

  // Cálculo mensual
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
    
    const wHolidayPayHours = wWeekdayHolidayHours;
    const wNormalOvertime = wTotalOvertime;
    
    const wMetTarget = wEffectiveWeekday >= 45;
    const wWeekendRate = wMetTarget ? rate100 : rate50;
    const wWeekendType = wMetTarget ? '100%' : '50%';
    
    const wNormalOvertimePay = wNormalOvertime * rate50;
    const wHolidayPay = wHolidayPayHours * rate100;
    const wWeekendPay = wWeekendHours * wWeekendRate;
    const wWeekendHolidayPay = wWeekendHolidayHours * rate100;

    monthlyWeeks.push({
      weekdayHours: wWeekdayHours,
      weekendHours: wWeekendHours,
      holidayHours: wHolidayHours,
      weekdayHolidayHours: wWeekdayHolidayHours,
      weekendHolidayHours: wWeekendHolidayHours,
      normalOvertimeHours: wNormalOvertime,
      holidayPayHours: wHolidayPayHours,
      normalOvertimePay: wNormalOvertimePay,
      holidayPay: wHolidayPay,
      weekendPay: wWeekendPay,
      weekendHolidayPay: wWeekendHolidayPay,
      weekendPayType: wWeekendType,
      totalExtraPay: wNormalOvertimePay + wHolidayPay + wWeekendPay + wWeekendHolidayPay,
      weekNumber: weekNum,
      weekStart: wStart,
      weekEnd: wEnd
    });

    current = addWeeks(current, 1);
  }

  const monthlyNormalOvertimeHours = monthlyWeeks.reduce((sum, w) => sum + w.normalOvertimeHours, 0);
  const monthlyHolidayPayHours = monthlyWeeks.reduce((sum, w) => sum + w.holidayPayHours, 0);
  const monthlyNormalOvertimePay = monthlyWeeks.reduce((sum, w) => sum + w.normalOvertimePay, 0);
  const monthlyHolidayPay = monthlyWeeks.reduce((sum, w) => sum + w.holidayPay, 0);
  const monthlyWeekendPay = monthlyWeeks.reduce((sum, w) => sum + w.weekendPay, 0);
  const monthlyWeekendHolidayPay = monthlyWeeks.reduce((sum, w) => sum + w.weekendHolidayPay, 0);
  const monthlyExtraPay = monthlyNormalOvertimePay + monthlyHolidayPay + monthlyWeekendPay + monthlyWeekendHolidayPay;

  // Base de ingreso = Sueldo + Horas Extras
  const baseIngreso = salary + monthlyExtraPay;

  // Cálculo final
  const grossIncome = salary + monthlyExtraPay + totalBonuses;
  const netIncome = grossIncome - monthlyDiscountPayment - quincena;

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-slate-500 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Este monto se descuenta del total mensual. Es el pago fijo que recibes cada 15.
            </p>
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
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-calculator text-emerald-400"></i>
              Resumen de Ingresos y Descuentos
            </h3>
            <div className="space-y-2">
              {totalBonuses > 0 && (
                <div className="flex justify-between text-sm bg-green-500/10 rounded-lg p-2">
                  <span className="text-green-300 flex items-center gap-2">
                    <i className="fas fa-gift"></i>
                    Bonos ({bonuses.filter(b => b.type === 'fixed').length} fijos, {bonuses.filter(b => b.type === 'variable').length} variables{fondoReservaBonuses > 0 ? `, ${bonuses.filter(b => b.type === 'fondo_reserva').length} fondo reserva` : ''})
                  </span>
                  <span className="text-green-400 font-semibold">+${totalBonuses.toFixed(2)}</span>
                </div>
              )}
              {quincena > 0 && (
                <div className="flex justify-between text-sm bg-purple-500/10 rounded-lg p-2">
                  <span className="text-purple-300 flex items-center gap-2">
                    <i className="fas fa-calendar-check"></i>
                    Quincena (pago del 15)
                  </span>
                  <span className="text-purple-400 font-semibold">-${quincena.toFixed(2)}</span>
                </div>
              )}
              {discounts.find(d => d.type === 'iess') && (
                <div className="flex justify-between text-sm bg-blue-500/10 rounded-lg p-2">
                  <span className="text-blue-300 flex items-center gap-2">
                    <i className="fas fa-hospital"></i>
                    IESS Salud Cónyuge (3.41% de base ingreso)
                  </span>
                  <span className="text-blue-400 font-semibold">-${((baseIngreso * 3.41) / 100).toFixed(2)}</span>
                </div>
              )}
              {discounts.find(d => d.type === 'iess_aporte') && (
                <div className="flex justify-between text-sm bg-green-500/10 rounded-lg p-2">
                  <span className="text-green-300 flex items-center gap-2">
                    <i className="fas fa-user-shield"></i>
                    Aporte Personal IESS (9.45% de base ingreso)
                  </span>
                  <span className="text-green-400 font-semibold">-${((baseIngreso * 9.45) / 100).toFixed(2)}</span>
                </div>
              )}
              {monthlyDiscountPayment > 0 && (
                <div className="flex justify-between text-sm bg-rose-500/10 rounded-lg p-2">
                  <span className="text-rose-300 flex items-center gap-2">
                    <i className="fas fa-hand-holding-usd"></i>
                    Descuentos ({activeDiscounts.length} activos)
                  </span>
                  <span className="text-rose-400 font-semibold">-${monthlyDiscountPayment.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <i className="fas fa-calendar text-purple-400"></i>
              Proyección Mensual - {format(now, "MMMM yyyy", { locale: es })}
            </h3>
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
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
                          {week.holidayHours > 0 && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                              {week.holidayHours.toFixed(1)}h feriado
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-green-400 font-semibold">${week.totalExtraPay.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Lun-Vie:</span>
                          <span className="text-white ml-1">{week.weekdayHours.toFixed(1)}h</span>
                        </div>
                        <div>
                          <span className="text-amber-400">Extra 50%:</span>
                          <span className="text-amber-400 ml-1">{week.normalOvertimeHours.toFixed(1)}h</span>
                        </div>
                        <div>
                          <span className={week.weekendPayType === '100%' ? 'text-blue-400' : 'text-amber-400'}>
                            Sáb-Dom {week.weekendPayType}:
                          </span>
                          <span className={`ml-1 ${week.weekendPayType === '100%' ? 'text-blue-400' : 'text-amber-400'}`}>
                            {week.weekendHours.toFixed(1)}h
                          </span>
                        </div>
                        <div>
                          <span className="text-amber-400">Feriados:</span>
                          <span className="text-amber-400 ml-1">{week.holidayHours.toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="bg-slate-700/40 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total extras Lun-Vie al 50% ({monthlyNormalOvertimeHours.toFixed(1)}h):</span>
                  <span className="text-amber-400 font-semibold">${monthlyNormalOvertimePay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-300">Total horas feriados Lun-Vie al 100% ({monthlyHolidayPayHours.toFixed(1)}h):</span>
                  <span className="text-green-400 font-semibold">${monthlyHolidayPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total Sáb-Dom:</span>
                  <span className={`font-semibold ${monthlyWeekendPay > 0 ? 'text-blue-400' : 'text-slate-400'}`}>${monthlyWeekendPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Total Feriados Sáb-Dom (100%):</span>
                  <span className="text-amber-400 font-semibold">${monthlyWeekendHolidayPay.toFixed(2)}</span>
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
                      <span className="text-green-300">Bonos (fijos + variables{fondoReservaBonuses > 0 ? ' + fondo reserva' : ''}):</span>
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
                        Quincena (descuento):
                      </span>
                      <span className="text-purple-400 font-semibold">-${quincena.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {activeDiscounts.length > 0 && (
                  <div className="border-t border-slate-600/50 pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-rose-300 font-medium flex items-center gap-1">
                        <i className="fas fa-hand-holding-usd"></i>
                        Descuentos ({activeDiscounts.length} activos):
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
