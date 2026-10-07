import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface DataPoint {
  week: string;
  hours: number;
  target: number;
}

interface Props {
   DataPoint[];
  startDate?: string;
  endDate?: string;
}

export function MonthlyChart({ data, startDate, endDate }: Props) {
  const formatDateRange = () => {
    if (startDate && endDate) {
      try {
        const start = format(parseISO(startDate), 'dd MMM', { locale: es });
        const end = format(parseISO(endDate), 'dd MMM yyyy', { locale: es });
        return `${start} - ${end}`;
      } catch {
        return '';
      }
    }
    return '';
  };

  const dateRange = formatDateRange();

  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <i className="fas fa-chart-area text-cyan-400"></i>
          Progreso Mensual por Semana
        </h3>
        {dateRange && (
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30">
            {dateRange}
          </span>
        )}
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
            <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(100,116,139,0.3)',
                borderRadius: '12px',
                color: '#e2e8f0'
              }}
              formatter={(value: number) => [`${value}h`, 'Horas']}
            />
            <ReferenceLine y={45} stroke="#f59e0b" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="hours" stroke="#06b6d4" fill="url(#areaGradient)" strokeWidth={2} />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
