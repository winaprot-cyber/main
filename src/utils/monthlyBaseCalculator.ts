import { AttendanceRecord, Bonus, Discount } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, getDay, parseISO, addWeeks, format } from 'date-fns';

const STORAGE_KEY_DECIMO_MONTHLY_BASES = 'asistencia_hl_decimo_monthly_bases';
const STORAGE_KEY_LAST_MONTH_PROCESSED = 'asistencia_hl_last_month_processed';

interface MonthlyBase {
  month: string;
  baseAmount: number;
  calculatedAt: string;
}

export function calculateMonthlyBaseForDecimo(
  salary: number,
  records: AttendanceRecord[],
  monthDate: Date
): number {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  const monthRecords = records.filter(r => {
    const rDate = parseISO(r.date);
    return rDate >= monthStart && rDate <= monthEnd;
  });

  let extraPay = 0;
  const rate100 = parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39');
  const rate50 = parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29');

  const weeksMap = new Map<string, typeof monthRecords>();
  
  monthRecords.forEach(record => {
    const rDate = parseISO(record.date);
    const weekStart = startOfWeek(rDate, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');
    
    if (!weeksMap.has(weekKey)) {
      weeksMap.set(weekKey, []);
    }
    weeksMap.get(weekKey)!.push(record);
  });

  weeksMap.forEach((weekRecords) => {
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
    const totalOvertimeHours = Math.max(0, effectiveWeekdayHours - 45);

    extraPay += totalOvertimeHours * rate50;
    extraPay += weekdayHolidayHours * rate100;

    const metWeeklyTarget = effectiveWeekdayHours >= 45;
    const weekendPayRate = metWeeklyTarget ? rate100 : rate50;
    extraPay += weekendHours * weekendPayRate;
    extraPay += weekendHolidayHours * rate100;
  });

  return salary + extraPay;
}

export function getDecimoMonthlyBases(): MonthlyBase[] {
  const stored = localStorage.getItem(STORAGE_KEY_DECIMO_MONTHLY_BASES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveDecimoMonthlyBase(month: string, baseAmount: number): void {
  const bases = getDecimoMonthlyBases();
  const existingIndex = bases.findIndex(b => b.month === month);
  
  const newBase: MonthlyBase = {
    month,
    baseAmount,
    calculatedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    bases[existingIndex] = newBase;
  } else {
    bases.push(newBase);
  }
  
  localStorage.setItem(STORAGE_KEY_DECIMO_MONTHLY_BASES, JSON.stringify(bases));
}

export function getLastMonthProcessed(): string | null {
  return localStorage.getItem(STORAGE_KEY_LAST_MONTH_PROCESSED);
}

export function setLastMonthProcessed(month: string): void {
  localStorage.setItem(STORAGE_KEY_LAST_MONTH_PROCESSED, month);
}

export function shouldProcessMonthChange(): boolean {
  const today = new Date();
  const currentDay = today.getDate();
  
  if (currentDay !== 1) {
    return false;
  }
  
  const currentMonth = format(today, 'yyyy-MM');
  const lastProcessed = getLastMonthProcessed();
  
  return lastProcessed !== currentMonth;
}

export function processMonthChange(
  salary: number,
  records: AttendanceRecord[]
): { processed: boolean; previousMonth?: string; baseAmount?: number } {
  if (!shouldProcessMonthChange()) {
    return { processed: false };
  }
  
  const today = new Date();
  const currentMonth = format(today, 'yyyy-MM');
  
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonth = format(previousMonthDate, 'yyyy-MM');
  
  const baseAmount = calculateMonthlyBaseForDecimo(salary, records, previousMonthDate);
  
  saveDecimoMonthlyBase(previousMonth, baseAmount);
  setLastMonthProcessed(currentMonth);
  
  return {
    processed: true,
    previousMonth,
    baseAmount
  };
}

export function getDecimoBaseForMonth(month: string): number {
  const bases = getDecimoMonthlyBases();
  const base = bases.find(b => b.month === month);
  return base?.baseAmount || 0;
}

export function getDecimoMonthIndex(month: string): number {
  const [year, monthNum] = month.split('-').map(Number);
  
  const currentYear = new Date().getFullYear();
  
  if (monthNum === 12) {
    return 0;
  } else {
    return monthNum;
  }
}

export function updateDecimoWithSavedBases(): number[] {
  const bases = getDecimoMonthlyBases();
  const amounts: number[] = new Array(12).fill(0);
  
  bases.forEach(base => {
    const index = getDecimoMonthIndex(base.month);
    if (index >= 0 && index < 12) {
      amounts[index] = base.baseAmount;
    }
  });
  
  return amounts;
}
