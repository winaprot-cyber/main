import { AttendanceRecord, Bonus, Discount } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, getDay, parseISO, addWeeks } from 'date-fns';

export function calculateMonthlyExtraPay(records: AttendanceRecord[], rate100: number, rate50: number, monthDate: Date = new Date(), startDate?: string, endDate?: string): number {
  const monthStart = startDate ? parseISO(startDate) : startOfMonth(monthDate);
  const monthEnd = endDate ? parseISO(endDate) : endOfMonth(monthDate);
  const monthRecords = records.filter(r => {
    const rDate = parseISO(r.date);
    return rDate >= monthStart && rDate <= monthEnd;
  });
  let extraPay = 0;
  monthRecords.forEach(record => {
    if (record.isHoliday) extraPay += record.hoursWorked * rate100;
    else if (record.isWeekend) extraPay += record.hoursWorked * rate100;
    else if (record.hoursWorked > 9) extraPay += (record.hoursWorked - 9) * rate50;
  });
  return extraPay;
}

export function calculateNetIncome(salary: number, records: AttendanceRecord[], bonuses: Bonus[], discounts: Discount[], quincena: number, rate100: number, rate50: number, monthDate: Date = new Date(), startDate?: string, endDate?: string): number {
  const monthlyExtraPay = calculateMonthlyExtraPay(records, rate100, rate50, monthDate, startDate, endDate);
  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const activeDiscounts = discounts.filter(d => d.completedPayments < d.totalPayments);
  const monthlyDiscountPayment = activeDiscounts.reduce((sum, d) => sum + d.paymentAmount, 0);
  const grossIncome = salary + monthlyExtraPay + totalBonuses;
  return grossIncome - monthlyDiscountPayment - quincena;
}
