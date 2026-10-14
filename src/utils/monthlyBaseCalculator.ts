import { AttendanceRecord } from '../types';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export const processMonthChange = (salary: number, records: AttendanceRecord[]) => {
  const today = new Date();
  if (today.getDate() !== 1) return { processed: false };
  
  const lastProcessed = localStorage.getItem('asistencia_hl_last_month_processed');
  const currentMonth = format(today, 'yyyy-MM');
  if (lastProcessed === currentMonth) return { processed: false };
  
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const monthStart = startOfMonth(previousMonth);
  const monthEnd = endOfMonth(previousMonth);
  
  const monthRecords = records.filter(r => {
    const rDate = parseISO(r.date);
    return rDate >= monthStart && rDate <= monthEnd;
  });
  
  let extraPay = 0;
  const rate100 = parseFloat(localStorage.getItem('asistencia_hl_rate100') || '4.39');
  const rate50 = parseFloat(localStorage.getItem('asistencia_hl_rate50') || '3.29');
  
  monthRecords.forEach(record => {
    if (record.isHoliday) extraPay += record.hoursWorked * rate100;
    else if (record.isWeekend) extraPay += record.hoursWorked * rate100;
    else if (record.hoursWorked > 9) extraPay += (record.hoursWorked - 9) * rate50;
  });
  
  const baseAmount = salary + extraPay;
  
  const bases = JSON.parse(localStorage.getItem('asistencia_hl_decimo_monthly_bases') || '[]');
  bases.push({ month: format(previousMonth, 'yyyy-MM'), baseAmount, calculatedAt: new Date().toISOString() });
  localStorage.setItem('asistencia_hl_decimo_monthly_bases', JSON.stringify(bases));
  localStorage.setItem('asistencia_hl_last_month_processed', currentMonth);
  
  return { processed: true, previousMonth: format(previousMonth, 'yyyy-MM'), baseAmount };
};
