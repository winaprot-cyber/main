import { useState, useEffect } from 'react';
import { AttendanceRecord, Holiday, Bonus, Discount, PersonalDebt, PersonalExpense, MonthlyBalance } from '../types';

const STORAGE_KEYS = {
  records: 'asistencia_hl_records',
  holidays: 'asistencia_hl_holidays',
  bonuses: 'asistencia_hl_bonuses',
  discounts: 'asistencia_hl_discounts',
  personalDebts: 'asistencia_hl_personal_debts',
  personalExpenses: 'asistencia_hl_personal_expenses',
  monthlyBalances: 'asistencia_hl_monthly_balances',
};

export function useAttendanceStorage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [personalDebts, setPersonalDebts] = useState<PersonalDebt[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [monthlyBalances, setMonthlyBalances] = useState<MonthlyBalance[]>([]);

  useEffect(() => {
    const storedRecords = localStorage.getItem(STORAGE_KEYS.records);
    if (storedRecords) setRecords(JSON.parse(storedRecords));

    const storedHolidays = localStorage.getItem(STORAGE_KEYS.holidays);
    if (storedHolidays) setHolidays(JSON.parse(storedHolidays));

    const storedBonuses = localStorage.getItem(STORAGE_KEYS.bonuses);
    if (storedBonuses) setBonuses(JSON.parse(storedBonuses));

    const storedDiscounts = localStorage.getItem(STORAGE_KEYS.discounts);
    if (storedDiscounts) setDiscounts(JSON.parse(storedDiscounts));

    const storedDebts = localStorage.getItem(STORAGE_KEYS.personalDebts);
    if (storedDebts) setPersonalDebts(JSON.parse(storedDebts));

    const storedExpenses = localStorage.getItem(STORAGE_KEYS.personalExpenses);
    if (storedExpenses) setPersonalExpenses(JSON.parse(storedExpenses));

    const storedBalances = localStorage.getItem(STORAGE_KEYS.monthlyBalances);
    if (storedBalances) setMonthlyBalances(JSON.parse(storedBalances));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.holidays, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bonuses, JSON.stringify(bonuses));
  }, [bonuses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.discounts, JSON.stringify(discounts));
  }, [discounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.personalDebts, JSON.stringify(personalDebts));
  }, [personalDebts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.personalExpenses, JSON.stringify(personalExpenses));
  }, [personalExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.monthlyBalances, JSON.stringify(monthlyBalances));
  }, [monthlyBalances]);

  const addRecord = (record: AttendanceRecord) => {
    setRecords([...records, record]);
  };

  const updateRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setRecords(records.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const clearAllRecords = () => {
    setRecords([]);
  };

  const removeDuplicates = () => {
    const unique = records.filter((record, index, self) =>
      index === self.findIndex(r => r.date === record.date)
    );
    setRecords(unique);
  };

  const addHoliday = (holiday: Holiday) => {
    setHolidays([...holidays, holiday]);
  };

  const updateHoliday = (id: string, updates: Partial<Holiday>) => {
    setHolidays(holidays.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const addBonus = (bonus: Bonus) => {
    setBonuses([...bonuses, bonus]);
  };

  const updateBonus = (id: string, updates: Partial<Bonus>) => {
    setBonuses(bonuses.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBonus = (id: string) => {
    setBonuses(bonuses.filter(b => b.id !== id));
  };

  const addDiscount = (discount: Discount) => {
    setDiscounts([...discounts, discount]);
  };

  const updateDiscount = (id: string, updates: Partial<Discount>) => {
    setDiscounts(discounts.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const addPersonalDebt = (debt: PersonalDebt) => {
    setPersonalDebts([...personalDebts, debt]);
  };

  const updatePersonalDebt = (id: string, updates: Partial<PersonalDebt>) => {
    setPersonalDebts(personalDebts.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deletePersonalDebt = (id: string) => {
    setPersonalDebts(personalDebts.filter(d => d.id !== id));
  };

  const addPersonalExpense = (expense: PersonalExpense) => {
    setPersonalExpenses([...personalExpenses, expense]);
  };

  const updatePersonalExpense = (id: string, updates: Partial<PersonalExpense>) => {
    setPersonalExpenses(personalExpenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deletePersonalExpense = (id: string) => {
    setPersonalExpenses(personalExpenses.filter(e => e.id !== id));
  };

  const addMonthlyBalance = (balance: MonthlyBalance) => {
    const existing = monthlyBalances.findIndex(b => b.month === balance.month);
    if (existing >= 0) {
      const updated = [...monthlyBalances];
      updated[existing] = balance;
      setMonthlyBalances(updated);
    } else {
      setMonthlyBalances([...monthlyBalances, balance]);
    }
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
