import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Jan', orders: 10 }, { name: 'Feb', orders: 15 },
  { name: 'Mar', orders: 10 }, { name: 'Apr', orders: 25 },
  { name: 'May', orders: 35 }, { name: 'Jun', orders: 30 },
  { name: 'Jul', orders: 35 }, { name: 'Aug', orders: 50 },
  { name: 'Sep', orders: 45 }, { name: 'Oct', orders: 25 },
  { name: 'Nov', orders: 25 }, { name: 'Dec', orders: 35 },
];

export function SalesChart() {
  return (
    <div className="w-full">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chart-fade {
          animation: fadeUp 0.6s ease forwards;
          opacity: 0;
        }
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
          Sales Revenue
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
          +12.4% this year
        </span>
      </div>

      <div className="chart-fade h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                boxShadow: '0 8px 20px -4px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#cbd5e1', marginBottom: 4 }}
              cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorOrders)"
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}