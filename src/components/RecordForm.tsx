import { useState, useEffect } from 'react';
import { AttendanceRecord, Holiday } from '../types';
import { calculateHoursWorked, isWeekend, isHoliday, generateId, getDayOfWeekName } from '../utils/calculations';
import { format } from 'date-fns';

interface Props {
  onSave: (record: AttendanceRecord) => void;
  onCancel: () => void;
  editingRecord: AttendanceRecord | null;
  existingRecords?: AttendanceRecord[];
  holidays: Holiday[];
}

export function RecordForm({ onSave, onCancel, editingRecord, existingRecords = [], holidays }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [entryTime, setEntryTime] = useState('08:00');
  const [exitTime, setExitTime] = useState('17:00');
  const [isTodayRecord, setIsTodayRecord] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setEntryTime(editingRecord.entryTime);
      setExitTime(editingRecord.exitTime);
      setIsTodayRecord(editingRecord.date === today);
    } else {
      const todayRecord = existingRecords.find(r => r.date === today);
      if (todayRecord) {
        setDate(todayRecord.date);
        setEntryTime(todayRecord.entryTime);
        setExitTime(todayRecord.exitTime);
        setIsTodayRecord(true);
      } else {
        setIsTodayRecord(false);
      }
    }
  }, [editingRecord, existingRecords, today]);

  const hoursWorked = calculateHoursWorked(entryTime, exitTime);
  const weekend = isWeekend(date);
  const holiday = isHoliday(date, holidays);
  const dayName = getDayOfWeekName(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingTodayRecord = !editingRecord && isTodayRecord 
      ? existingRecords.find(r => r.date === today)
      : null;
    
    const record: AttendanceRecord = {
      id: editingRecord?.id || existingTodayRecord?.id || generateId(),
      date,
      dayOfWeek: new Date(date + 'T00:00:00').getDay(),
      entryTime,
      exitTime,
      hoursWorked,
      isWeekend: weekend,
      isHoliday: holiday
    };

    onSave(record);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/80 rounded-2xl p-5 border border-blue-500/30 shadow-lg shadow-blue-500/10">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="fas fa-edit text-blue-400"></i>
        {editingRecord ? 'Editar Registro' : isTodayRecord ? 'Editar Día Actual' : 'Nuevo Registro'}
        {isTodayRecord && !editingRecord && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
            Hoy
          </span>
        )}
      </h3>

      {isTodayRecord && !editingRecord && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
            <div className="text-xs text-blue-300">
              <p className="font-semibold mb-1">Editando registro del día actual</p>
              <p className="text-blue-200/70">Puedes modificar tanto la hora de ingreso como la hora de salida.</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            <i className="fas fa-calendar mr-1 text-blue-400"></i> Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            required
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-slate-400">{dayName}</span>
            {weekend && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
                Fin de semana
              </span>
            )}
            {holiday && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                Feriado
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            <i className="fas fa-sign-in-alt mr-1 text-green-400"></i> Hora de Ingreso
          </label>
          <input
            type="time"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            <i className="fas fa-sign-out-alt mr-1 text-red-400"></i> Hora de Salida
          </label>
          <input
            type="time"
            value={exitTime}
            onChange={(e) => setExitTime(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
            required
          />
        </div>

        <div className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Horas calculadas:</span>
            <span className="text-xl font-bold text-cyan-400">{hoursWorked}h</span>
          </div>
          {holiday && (
            <p className="text-xs text-amber-400 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Feriado - Horas al 100%
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-slate-300 transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-medium text-white shadow-lg transition-all"
          >
            {editingRecord ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
}
