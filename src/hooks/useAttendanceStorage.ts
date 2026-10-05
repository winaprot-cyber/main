import { useState, useEffect } from 'react';
import { AttendanceRecord, Holiday, Bonus, Discount, PersonalDebt, PersonalExpense, MonthlyBalance } from '../types';

const STORAGE_KEY = 'asistencia_hl_records';
const HOLIDAYS_KEY = 'asistencia_hl_holidays';
const BONUSES_KEY = 'asistencia_hl_bonuses';
const DISCOUNTS_KEY = 'asistencia_hl_discounts';
const DEBTS_KEY = 'asistencia_hl_personal_debts';
const EXPENSES_KEY = 'asistencia_hl_personal_expenses';
const MONTHLY_BALANCES_KEY = 'asistencia_hl_monthly_balances';

export function useAttendanceStorage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [holidays, setHolidays] = useState<Holiday[]>(() => {
    try {
      const stored = localStorage.getItem(HOLIDAYS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [bonuses, setBonuses] = useState<Bonus[]>(() => {
    try {
      const stored = localStorage.getItem(BONUSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    try {
      const stored = localStorage.getItem(DISCOUNTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [personalDebts, setPersonalDebts] = useState<PersonalDebt[]>(() => {
    try {
      const stored = localStorage.getItem(DEBTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>(() => {
    try {
      const stored = localStorage.getItem(EXPENSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [monthlyBalances, setMonthlyBalances] = useState<MonthlyBalance[]>(() => {
    try {
      const stored = localStorage.getItem(MONTHLY_BALANCES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(BONUSES_KEY, JSON.stringify(bonuses));
  }, [bonuses]);

  useEffect(() => {
    localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(discounts));
  }, [discounts]);

  useEffect(() => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(personalDebts));
  }, [personalDebts]);

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(personalExpenses));
  }, [personalExpenses]);

  useEffect(() => {
    localStorage.setItem(MONTHLY_BALANCES_KEY, JSON.stringify(monthlyBalances));
  }, [monthlyBalances]);

  const addRecord = (record: AttendanceRecord) => {
    setRecords(prev => {
      const exists = prev.find(r => r.date === record.date);
      if (exists) {
        return prev.map(r => r.date === record.date ? record : r);
      }
      return [...prev, record];
    });
  };

  const updateRecord = (id: string, updated: Partial<AttendanceRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const clearAllRecords = () => {
    setRecords([]);
  };

  const removeDuplicates = () => {
    setRecords(prev => {
      const unique: AttendanceRecord[] = [];
      prev.forEach(record => {
        if (!unique.find(r => r.date === record.date)) {
          unique.push(record);
        }
      });
      return unique;
    });
  };

  const addHoliday = (holiday: Holiday) => {
    setHolidays(prev => [...prev, holiday]);
  };

  const updateHoliday = (id: string, updated: Partial<Holiday>) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...updated } : h));
  };

  const deleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const addBonus = (bonus: Bonus) => {
    setBonuses(prev => [...prev, bonus]);
  };

  const updateBonus = (id: string, updated: Partial<Bonus>) => {
    setBonuses(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
  };

  const deleteBonus = (id: string) => {
    setBonuses(prev => prev.filter(b => b.id !== id));
  };

  const addDiscount = (discount: Discount) => {
    setDiscounts(prev => [...prev, discount]);
  };

  const updateDiscount = (id: string, updated: Partial<Discount>) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  };

  const deleteDiscount = (id: string) => {
    setDiscounts(prev => prev.filter(d => d.id !== id));
  };

  const addPersonalDebt = (debt: PersonalDebt) => {
    setPersonalDebts(prev => [...prev, debt]);
  };

  const updatePersonalDebt = (id: string, updated: Partial<PersonalDebt>) => {
    setPersonalDebts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  };

  const deletePersonalDebt = (id: string) => {
    setPersonalDebts(prev => prev.filter(d => d.id !== id));
  };

  const addPersonalExpense = (expense: PersonalExpense) => {
    setPersonalExpenses(prev => [...prev, expense]);
  };

  const updatePersonalExpense = (id: string, updated: Partial<PersonalExpense>) => {
    setPersonalExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const deletePersonalExpense = (id: string) => {
    setPersonalExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addMonthlyBalance = (balance: MonthlyBalance) => {
    setMonthlyBalances(prev => {
      const existing = prev.findIndex(b => b.month === balance.month);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = balance;
        return updated;
      }
      return [...prev, balance];
    });
  };

  const getMonthlyBalance = (month: string) => {
    return monthlyBalances.find(b => b.month === month);
  };

  return {
    records,
    holidays,
    bonuses,
    discounts,
    personalDebts,
    personalExpenses,
    monthlyBalances,
    addRecord,
    updateRecord,
    deleteRecord,
    clearAllRecords,
    removeDuplicates,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    addBonus,
    updateBonus,
    deleteBonus,
    addDiscount,
    updateDiscount,
    deleteDiscount,
    addPersonalDebt,
    updatePersonalDebt,
    deletePersonalDebt,
    addPersonalExpense,
    updatePersonalExpense,
    deletePersonalExpense,
    addMonthlyBalance,
    getMonthlyBalance,
  };
}
