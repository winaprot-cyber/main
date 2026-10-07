import { AttendanceRecord } from '../types';
import { format, parseISO, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

interface Props {
  records: AttendanceRecord[];
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onRemoveDuplicates?: () => void;
}

export function RecordList({ records, onEdit, onDelete, onClearAll, onRemoveDuplicates }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);
  
  const duplicates = records.filter((record, index, self) =>
    self.findIndex(r => r.date === record.date) !== index
  );
  const hasDuplicates = duplicates.length > 0;

  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedByWeek: Record<string, AttendanceRecord[]> = {};
  sortedRecords.forEach(record => {
    const date = parseISO(record.date);
    const weekNum = getISOWeek(date);
    const year = date.getFullYear();
    const weekKey = `Sem ${weekNum} - ${year}`;
    if (!groupedByWeek[weekKey]) {
      groupedByWeek[weekKey] = [];
    }
    groupedByWeek[weekKey].push(record);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-history text-cyan-400"></i>
          Historial de Asistencia
        </h2>
        <div className="flex gap-2">
          {hasDuplicates && onRemoveDuplicates && (
            <button
              onClick={onRemoveDuplicates}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-copy"></i>
              Eliminar {duplicates.length} duplicado{duplicates.length !== 1 ? 's' : ''}
            </button>
          )}
          {records.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-trash"></i>
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {confirmClear && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <p className="text-red-300 text-sm mb-3">¿Estás seguro de eliminar todos los registros?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmClear(false)}
              className="px-4 py-2 bg-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-600 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onClearAll(); setConfirmClear(false); }}
              className="px-4 py-2 bg-red-600 rounded-xl text-sm text-white hover:bg-red-500 transition-all"
            >
              Eliminar todo
            </button>
          </div>
        </div>
      )}

      {sortedRecords.length === 0 ? (
        <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/50 text-center">
          <i className="fas fa-clipboard-list text-4xl text-slate-600 mb-3"></i>
          <p className="text-slate-400">No hay registros de asistencia</p>
        </div>
      ) : (
        Object.entries(groupedByWeek).map(([week, weekRecords]) => (
          <div key={week} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-300">
                <i className="fas fa-calendar-alt mr-1 text-blue-400"></i>
                {week}
              </h3>
              <span className="text-xs text-slate-500">
                {weekRecords.reduce((sum, r) => sum + r.hoursWorked, 0).toFixed(1)}h total
              </span>
            </div>
            
            {weekRecords.map(record => (
              <div
                key={record.id}
                className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      record.isHoliday
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : record.isWeekend 
                        ? 'bg-purple-500/20 border border-purple-500/30' 
                        : 'bg-blue-500/20 border border-blue-500/30'
                    }`}>
                      <i className={`fas ${
                        record.isHoliday ? 'fa-umbrella-beach text-amber-400' 
                        : record.isWeekend ? 'fa-sun text-purple-400' 
                        : 'fa-briefcase text-blue-400'
                      }`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-white">
                        {format(parseISO(record.date), "EEEE d 'de' MMMM", { locale: es })}
                        {record.isHoliday && <span className="ml-2 text-xs text-amber-400">(Feriado)</span>}
                      </div>
                      <div className="text-xs text-slate-400">
                        {record.entryTime} - {record.exitTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="text-lg font-bold text-cyan-400">{record.hoursWorked}h</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onEdit(record)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-all"
                      >
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button
                        onClick={() => onDelete(record.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
