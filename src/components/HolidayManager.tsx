import { useState } from 'react';
import { Holiday } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateId } from '../utils/calculations';

interface Props {
  holidays: Holiday[];
  onAdd: (holiday: Holiday) => void;
  onDelete: (id: string) => void;
}

export function HolidayManager({ holidays, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const holiday: Holiday = {
      id: generateId(),
      date,
      name: name.trim(),
      year: new Date(date).getFullYear(),
    };

    onAdd(holiday);
    setName('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setShowForm(false);
  };

  const sortedHolidays = [...holidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const currentYear = new Date().getFullYear();
  const currentYearHolidays = sortedHolidays.filter(h => h.year === currentYear);

  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-umbrella-beach text-amber-400"></i>
          Días Feriados {currentYear}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-medium text-amber-300 transition-all flex items-center gap-1.5"
        >
          <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i>
          {showForm ? 'Cancelar' : 'Agregar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600/50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Nombre del Feriado</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Año Nuevo, Navidad, etc."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-xl font-medium text-white transition-all"
            >
              Guardar Feriado
            </button>
          </div>
        </form>
      )}

      {currentYearHolidays.length === 0 ? (
        <div className="text-center py-6">
          <i className="fas fa-calendar-day text-3xl text-slate-600 mb-2"></i>
          <p className="text-slate-400 text-sm">No hay feriados registrados</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {currentYearHolidays.map(holiday => (
            <div key={holiday.id} className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <i className="fas fa-umbrella-beach text-amber-400"></i>
                </div>
                <div>
                  <div className="font-medium text-sm text-white">{holiday.name}</div>
                  <div className="text-xs text-slate-400">
                    {format(parseISO(holiday.date), "EEEE d 'de' MMMM", { locale: es })}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(holiday.id)}
                className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-all"
              >
                <i className="fas fa-trash text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
