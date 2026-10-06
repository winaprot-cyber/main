import { AttendanceRecord, Holiday, Bonus, Discount, PersonalDebt, PersonalExpense, MonthlyBalance } from '../types';

interface BackupData {
  version: string;
  exportDate: string;
  records: AttendanceRecord[];
  holidays: Holiday[];
  bonuses: Bonus[];
  discounts: Discount[];
  personalDebts: PersonalDebt[];
  personalExpenses: PersonalExpense[];
  monthlyBalances: MonthlyBalance[];
  manualExtraIncomes: Array<{id: string, name: string, amount: number}>;
  decimoMonthlyBases: Array<{month: string, baseAmount: number, calculatedAt: string}>;
  settings: {
    salary: string | null;
    rate100: string | null;
    rate50: string | null;
    quincena: string | null;
    selectedWeekStart: string | null;
    selectedWeekEnd: string | null;
    selectedTheme: string | null;
    lastMonthProcessed: string | null;
  };
}

export const exportDatabase = () => {
  try {
    const data: BackupData = {
      version: '1.4.9',
      exportDate: new Date().toISOString(),
      records: JSON.parse(localStorage.getItem('asistencia_hl_records') || '[]'),
      holidays: JSON.parse(localStorage.getItem('asistencia_hl_holidays') || '[]'),
      bonuses: JSON.parse(localStorage.getItem('asistencia_hl_bonuses') || '[]'),
      discounts: JSON.parse(localStorage.getItem('asistencia_hl_discounts') || '[]'),
      personalDebts: JSON.parse(localStorage.getItem('asistencia_hl_personal_debts') || '[]'),
      personalExpenses: JSON.parse(localStorage.getItem('asistencia_hl_personal_expenses') || '[]'),
      monthlyBalances: JSON.parse(localStorage.getItem('asistencia_hl_monthly_balances') || '[]'),
      manualExtraIncomes: JSON.parse(localStorage.getItem('balance_personal_manual_incomes') || '[]'),
      decimoMonthlyBases: JSON.parse(localStorage.getItem('asistencia_hl_decimo_monthly_bases') || '[]'),
      settings: {
        salary: localStorage.getItem('asistencia_hl_salary'),
        rate100: localStorage.getItem('asistencia_hl_rate100'),
        rate50: localStorage.getItem('asistencia_hl_rate50'),
        quincena: localStorage.getItem('asistencia_hl_quincena'),
        selectedWeekStart: localStorage.getItem('asistencia_hl_selected_week_start'),
        selectedWeekEnd: localStorage.getItem('asistencia_hl_selected_week_end'),
        selectedTheme: localStorage.getItem('selectedTheme'),
        lastMonthProcessed: localStorage.getItem('asistencia_hl_last_month_processed'),
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control-asistencia-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error al exportar:', error);
    return false;
  }
};

export const importDatabase = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as BackupData;

          if (!data.records || !Array.isArray(data.records)) {
            alert('Error: El archivo no tiene el formato correcto');
            resolve(false);
            return;
          }

          const confirmImport = confirm(
            `¿Estás seguro de importar esta base de datos?\n\n` +
            `📋 DATOS DE ASISTENCIA:\n` +
            `• Registros: ${data.records.length}\n` +
            `• Feriados: ${data.holidays?.length || 0}\n` +
            `• Bonos: ${data.bonuses?.length || 0}\n` +
            `• Descuentos: ${data.discounts?.length || 0}\n\n` +
            `💰 DATOS DE BALANCE:\n` +
            `• Deudas: ${data.personalDebts?.length || 0}\n` +
            `• Gastos: ${data.personalExpenses?.length || 0}\n` +
            `• Balances Mensuales: ${data.monthlyBalances?.length || 0}\n` +
            `• Ingresos Manuales: ${data.manualExtraIncomes?.length || 0}\n\n` +
            `🎁 DATOS DE DÉCIMO:\n` +
            `• Bases Mensuales: ${data.decimoMonthlyBases?.length || 0}\n\n` +
            `⚠️ Esto reemplazará TODOS los datos actuales.`
          );

          if (!confirmImport) {
            resolve(false);
            return;
          }

          localStorage.setItem('asistencia_hl_records', JSON.stringify(data.records));
          
          if (data.holidays) {
            localStorage.setItem('asistencia_hl_holidays', JSON.stringify(data.holidays));
          }
          
          if (data.bonuses) {
            localStorage.setItem('asistencia_hl_bonuses', JSON.stringify(data.bonuses));
          }
          
          if (data.discounts) {
            localStorage.setItem('asistencia_hl_discounts', JSON.stringify(data.discounts));
          }

          if (data.personalDebts) {
            localStorage.setItem('asistencia_hl_personal_debts', JSON.stringify(data.personalDebts));
          }
          
          if (data.personalExpenses) {
            localStorage.setItem('asistencia_hl_personal_expenses', JSON.stringify(data.personalExpenses));
          }
          
          if (data.monthlyBalances) {
            localStorage.setItem('asistencia_hl_monthly_balances', JSON.stringify(data.monthlyBalances));
          }
          
          if (data.manualExtraIncomes) {
            localStorage.setItem('balance_personal_manual_incomes', JSON.stringify(data.manualExtraIncomes));
          }

          if (data.decimoMonthlyBases) {
            localStorage.setItem('asistencia_hl_decimo_monthly_bases', JSON.stringify(data.decimoMonthlyBases));
          }

          if (data.settings) {
            if (data.settings.salary) localStorage.setItem('asistencia_hl_salary', data.settings.salary);
            if (data.settings.rate100) localStorage.setItem('asistencia_hl_rate100', data.settings.rate100);
            if (data.settings.rate50) localStorage.setItem('asistencia_hl_rate50', data.settings.rate50);
            if (data.settings.quincena) localStorage.setItem('asistencia_hl_quincena', data.settings.quincena);
            if (data.settings.selectedWeekStart) localStorage.setItem('asistencia_hl_selected_week_start', data.settings.selectedWeekStart);
            if (data.settings.selectedWeekEnd) localStorage.setItem('asistencia_hl_selected_week_end', data.settings.selectedWeekEnd);
            if (data.settings.selectedTheme) localStorage.setItem('selectedTheme', data.settings.selectedTheme);
            if (data.settings.lastMonthProcessed) localStorage.setItem('asistencia_hl_last_month_processed', data.settings.lastMonthProcessed);
          }

          alert('✅ Base de datos importada exitosamente!\n\nLa página se recargará para aplicar los cambios.');
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);

          resolve(true);
        } catch (error) {
          console.error('Error al importar:', error);
          alert('Error: El archivo está corrupto o no tiene el formato correcto');
          resolve(false);
        }
      };

      reader.onerror = () => {
        alert('Error al leer el archivo');
        resolve(false);
      };

      reader.readAsText(file);
    };

    input.click();
  });
};

export const downloadOfflineApp = async () => {
  alert('Función de descarga de app offline - Implementación completa disponible en versión anterior');
  return true;
};
