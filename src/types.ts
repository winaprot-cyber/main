export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: number;
  entryTime: string;
  exitTime: string;
  hoursWorked: number;
  isWeekend: boolean;
  isHoliday: boolean;
  entryPhoto?: string;
  exitPhoto?: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  weekdayHours: number;
  weekendHours: number;
  holidayHours: number;
  percentage: number;
  records: AttendanceRecord[];
}

export interface Projection {
  weekly: number;
  monthly: number;
  quarterly: number;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  year: number;
}

export interface Bonus {
  id: string;
  name: string;
  type: 'fixed' | 'variable' | 'fondo_reserva';
  amount: number;
  description?: string;
  startDate: string;
  endDate?: string;
}

export interface Discount {
  id: string;
  name: string;
  type: 'loan' | 'rol' | 'quirurgico' | 'iess' | 'iess_aporte' | 'other';
  totalAmount: number;
  totalPayments: number;
  completedPayments: number;
  paymentAmount: number;
  customPayments?: number[];
  startDate: string;
  notes?: string;
  percentage?: number;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  receiptPhoto?: string;
}

export interface PersonalDebt {
  id: string;
  name: string;
  type: 'bank' | 'personal' | 'credit_card' | 'quirurgico' | 'other';
  totalAmount: number;
  monthlyPayment: number;
  interestRate?: number;
  totalPayments?: number;
  completedPayments?: number;
  startDate: string;
  endDate?: string;
  paidAmount: number;
  notes?: string;
  payments?: DebtPayment[];
}

export interface ExpensePayment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  receiptPhoto?: string;
}

export interface PersonalExpense {
  id: string;
  name: string;
  category: 'utilities' | 'rent' | 'food' | 'transport' | 'entertainment' | 'health' | 'education' | 'other';
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly' | 'one_time';
  startDate: string;
  dueDate?: string;
  isActive: boolean;
  lastUpdated?: string;
  notes?: string;
  paidAmount?: number;
  payments?: ExpensePayment[];
  autoRenew?: boolean;
}

export interface MonthlyPaymentRecord {
  id: string;
  type: 'expense' | 'debt';
  referenceId: string;
  name: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface MonthlyBalance {
  id: string;
  month: string;
  netIncome: number;
  manualIncomes: number;
  totalIncome: number;
  totalExpenses: number;
  totalDebtPayments: number;
  balance: number;
  expenses: PersonalExpense[];
  debts: PersonalDebt[];
  monthlyPayments: MonthlyPaymentRecord[];
  createdAt: string;
  updatedAt: string;
}
