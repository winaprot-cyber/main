import { AttendanceRecord, Bonus, Discount } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, getDay, parseISO, addWeeks } from 'date-fns';

export function calculateMonthlyExtraPay(
  records: AttendanceRecord[],
  rate100: number,
  rate50: number,
  monthDate: Date = new Date(),
  selectedWeekStart?: string,
  selectedWeekEnd?: string
): number {
  const monthStart = selectedWeekStart ? parseISO(selectedWeekStart) : startOfMonth(monthDate);
  const monthEnd = selectedWeekEnd ? parseISO(selectedWeekEnd) : endOfMonth(monthDate);
  
  const monthlyWeeks: {
    normalOvertimePay: number;
    holidayPay: number;
    weekendPay: number;
    weekendHolidayPay: number;
  }[] = [];

  let current = startOfWeek(monthStart, { weekStartsOn: 1 });
  const finalWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  while (current <= finalWeekEnd) {
    const wStart = current;
    const wEnd = endOfWeek(current, { weekStartsOn: 1 });
    
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
    const wWeekdayHolidayHours = wWeekdayHoliday.reduce((sum, r) => sum + r.hoursWorked, 0);
    const wWeekendHolidayHours = wWeekendHoliday.reduce((sum, r) => sum + r.hoursWorked, 0);
    
    const wEffectiveWeekday = wWeekdayHours + wWeekdayHolidayHours;
    const wTotalOvertime = Math.max(0, wEffectiveWeekday - 45);
    
    const wHolidayPayHours = wWeekdayHolidayHours;
    const wNormalOvertime = wTotalOvertime;
    
    const wMetTarget = wEffectiveWeekday >= 45;
    const wWeekendRate = wMetTarget ? rate100 : rate50;
    
    const wNormalOvertimePay = wNormalOvertime * rate50;
    const wHolidayPay = wHolidayPayHours * rate100;
    const wWeekendPay = wWeekendHours * wWeekendRate;
    const wWeekendHolidayPay = wWeekendHolidayHours * rate100;

    monthlyWeeks.push({
      normalOvertimePay: wNormalOvertimePay,
      holidayPay: wHolidayPay,
      weekendPay: wWeekendPay,
      weekendHolidayPay: wWeekendHolidayPay
    });

    current = addWeeks(current, 1);
  }

  const monthlyNormalOvertimePay = monthlyWeeks.reduce((sum, w) => sum + w.normalOvertimePay, 0);
  const monthlyHolidayPay = monthlyWeeks.reduce((sum, w) => sum + w.holidayPay, 0);
  const monthlyWeekendPay = monthlyWeeks.reduce((sum, w) => sum + w.weekendPay, 0);
  const monthlyWeekendHolidayPay = monthlyWeeks.reduce((sum, w) => sum + w.weekendHolidayPay, 0);

  return monthlyNormalOvertimePay + monthlyHolidayPay + monthlyWeekendPay + monthlyWeekendHolidayPay;
}

export function calculateNetIncome(
  salary: number,
  records: AttendanceRecord[],
  bonuses: Bonus[],
  discounts: Discount[],
  quincena: number,
  rate100: number,
  rate50: number,
  monthDate: Date = new Date(),
  selectedWeekStart?: string,
  selectedWeekEnd?: string
): number {
  const monthStart = selectedWeekStart ? parseISO(selectedWeekStart) : startOfMonth(monthDate);
  const monthEnd = selectedWeekEnd ? parseISO(selectedWeekEnd) : endOfMonth(monthDate);
  
  const monthlyExtraPay = calculateMonthlyExtraPay(records, rate100, rate50, monthDate, selectedWeekStart, selectedWeekEnd);
  
  const fixedBonuses = bonuses.filter(b => b.type === 'fixed').reduce((sum, b) => sum + b.amount, 0);
  const variableBonuses = bonuses.filter(b => b.type === 'variable').reduce((sum, b) => sum + b.amount, 0);
  const fondoReservaBonuses = bonuses.filter(b => b.type === 'fondo_reserva').reduce((sum, b) => sum + b.amount, 0);
  const totalBonuses = fixedBonuses + variableBonuses + fondoReservaBonuses;
  
  const activeDiscounts = discounts.filter(d => d.completedPayments < d.totalPayments);
  const monthlyDiscountPayment = activeDiscounts.reduce((sum, d) => {
    if (d.customPayments && d.customPayments.length > d.completedPayments) {
      return sum + d.customPayments[d.completedPayments];
    }
    return sum + d.paymentAmount;
  }, 0);
  
  const grossIncome = salary + monthlyExtraPay + totalBonuses;
  const netIncome = grossIncome - monthlyDiscountPayment - quincena;
  
  return netIncome;
}
