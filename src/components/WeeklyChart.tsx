import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  day: string;
  hours: number;
  target: number;
}

export function WeeklyChart(props: { data: DataPoint[] }) {
  const data = props.data;
  return (
    <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <i className="fas fa-chart-bar text-blue-400"></i>
        Horas por Día (Semana Actual)
      </h3>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
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
            <ReferenceLine y={9} stroke="#f59e0b" strokeDasharray="3 3" />
            <Bar dataKey="hours" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
