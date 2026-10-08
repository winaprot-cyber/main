import { AttendanceRecord, Bonus, Discount } from '../types';

export const exportDatabase = () => {
  try {
    const data = {
      version: '1.4.9',
      exportDate: new Date().toISOString(),
      records: JSON.parse(localStorage.getItem('asistencia_hl_records') || '[]'),
      holidays: JSON.parse(localStorage.getItem('asistencia_hl_holidays') || '[]'),
      bonuses: JSON.parse(localStorage.getItem('asistencia_hl_bonuses') || '[]'),
      discounts: JSON.parse(localStorage.getItem('asistencia_hl_discounts') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error al exportar:', error);
    return false;
  }
};

export const importDatabase = async () => {
  return new Promise<boolean>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { resolve(false); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.records) localStorage.setItem('asistencia_hl_records', JSON.stringify(data.records));
          if (data.holidays) localStorage.setItem('asistencia_hl_holidays', JSON.stringify(data.holidays));
          if (data.bonuses) localStorage.setItem('asistencia_hl_bonuses', JSON.stringify(data.bonuses));
          if (data.discounts) localStorage.setItem('asistencia_hl_discounts', JSON.stringify(data.discounts));
          alert('✅ Datos importados. Recargando...');
          setTimeout(() => window.location.reload(), 1000);
          resolve(true);
        } catch (error) {
          alert('❌ Error al importar');
          resolve(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};

export const downloadOfflineApp = async () => {
  alert('📦 Descarga de app offline disponible en versión completa');
  return true;
};
