import { AttendanceRecord, WeeklySummary, Projection, Holiday } from '../types';
import { startOfWeek, endOfWeek, addWeeks, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, format, isWithinInterval, parseISO, getDay, isSameWeek, isSameMonth, isSameQuarter, getISOWeek } from 'date-fns';

export function calculateHoursWorked(entryTime: string, exitTime: string): number {
  const [entryH, entryM] = entryTime.split(':').map(Number);
  const [exitH, exitM] = exitTime.split(':').map(Number);
  
  const entryMinutes = entryH * 60 + entryM;
  const exitMinutes = exitH * 60 + exitM;
  
  let diff = exitMinutes - entryMinutes;
  if (diff < 0) diff += 24 * 60;
  
  return Math.round((diff / 60) * 100) / 100;
}

export function isWeekend(date: string): boolean {
  const day = getDay(parseISO(date));
  return day === 0 || day === 6;
}

export function isHoliday(date: string, holidays: Holiday[]): boolean {
  return holidays.some(h => h.date === date);
}

export function getDayOfWeekName(date: string): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const day = getDay(parseISO(date));
  return days[day];
}

export function getWeeklySummary(records: AttendanceRecord[], referenceDate: Date = new Date()): WeeklySummary {
  const weekRecords = records.filter(r => isSameWeek(parseISO(r.date), referenceDate, { weekStartsOn: 1 }));
  
  const weekdayHours = weekRecords
    .filter(r => !r.isWeekend && !r.isHoliday)
    .reduce((sum, r) => sum + r.hoursWorked, 0);
  
  const weekendHours = weekRecords
    .filter(r => r.isWeekend && !r.isHoliday)
    .reduce((sum, r) => sum + r.hoursWorked, 0);
  
  const holidayHours = weekRecords
    .filter(r => r.isHoliday)
    .reduce((sum, r) => sum + r.hoursWorked, 0);
  
  const weekdayHolidayHours = weekRecords
    .filter(r => r.isHoliday)
    .filter(r => {
      const day = getDay(parseISO(r.date));
      return day >= 1 && day <= 5;
    })
    .reduce((sum, r) => sum + r.hoursWorked, 0);
  
  const totalHours = weekdayHours + weekendHours + holidayHours;
  const effectiveWeekdayHours = weekdayHours + weekdayHolidayHours;
  
  let percentage = 0;
  if (effectiveWeekdayHours >= 45) {
    percentage = 100;
  } else if (weekendHours > 0 || holidayHours > 0) {
    percentage = 50;
  } else {
    percentage = Math.round((effectiveWeekdayHours / 45) * 100);
  }
  
  const weekStart = format(startOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(referenceDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  return {
    weekStart,
    weekEnd,
    totalHours: Math.round(totalHours * 100) / 100,
    weekdayHours: Math.round(weekdayHours * 100) / 100,
    weekendHours: Math.round(weekendHours * 100) / 100,
    holidayHours: Math.round(holidayHours * 100) / 100,
    percentage,
    records: weekRecords
  };
}

export function getProjection(records: AttendanceRecord[]): Projection {
  const now = new Date();
  
  const currentWeek = getWeeklySummary(records, now);
  const weeklyHours = currentWeek.totalHours;
  
  const monthRecords = records.filter(r => isSameMonth(parseISO(r.date), now));
  const monthlyHours = monthRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  
  const quarterRecords = records.filter(r => isSameQuarter(parseISO(r.date), now));
  const quarterlyHours = quarterRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
  
  return {
    weekly: Math.round(weeklyHours * 100) / 100,
    monthly: Math.round(monthlyHours * 100) / 100,
    quarterly: Math.round(quarterlyHours * 100) / 100
  };
}

export function getWeeklyDataForChart(records: AttendanceRecord[], referenceDate: Date = new Date()): { day: string; hours: number; target: number }[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  return days.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayRecord = records.find(r => r.date === dateStr);
    const hours = dayRecord ? dayRecord.hoursWorked : 0;
    const target = index < 5 ? 9 : 0;
    
    return { day, hours, target };
  });
}

export function getMonthlyDataForChart(
  records: AttendanceRecord[],
  startDate?: string,
  endDate?: string
): { week: string; hours: number; target: number }[] {
  const now = new Date();
  const monthStart = startDate ? parseISO(startDate) : startOfMonth(now);
  const monthEnd = endDate ? parseISO(endDate) : endOfMonth(now);
  
  const weeks: { week: string; hours: number; target: number }[] = [];
  let current = startOfWeek(monthStart, { weekStartsOn: 1 });
  const finalWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  while (current <= finalWeekEnd) {
    const wStart = current;
    const wEnd = endOfWeek(current, { weekStartsOn: 1 });
    const weekNum = getISOWeek(current);
    
    const weekRecords = records.filter(r => {
      const rDate = parseISO(r.date);
      return isWithinInterval(rDate, { start: wStart, end: wEnd });
    });
    
    const hours = weekRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
    
    weeks.push({
      week: `Sem ${weekNum}`,
      hours: Math.round(hours * 100) / 100,
      target: 45
    });
    
    current = addWeeks(current, 1);
  }
  
  return weeks;
}

export function getWeekNumber(date: Date): number {
  return getISOWeek(date);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
