import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';
import { formatCurrency } from '../utils/format';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

export default function RegionChart({ data }) {
  if (!data?.length) return null;

  return (
    <ChartCard title="Regional Performance" subtitle="Revenue and profit contribution by geographic region">
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
            <defs>
              {COLORS.map((color, i) => (
                <linearGradient key={i} id={`region-bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" vertical={false} />
            <XAxis
              dataKey="Region"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.25)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]} animationDuration={1400} barSize={40}>
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#region-bar-${i % COLORS.length})`} />
              ))}
            </Bar>
            <Bar
              dataKey="profit" name="Profit" radius={[8, 8, 0, 0]}
              animationDuration={1400} animationDelay={200} barSize={40}
              fill="rgba(16,185,129,0.35)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.03]">
        {data.map((r, i) => (
          <div key={r.Region} className="text-center">
            <div className="text-[11px] font-semibold text-white/20 uppercase tracking-wider mb-1.5">{r.Region}</div>
            <div className="text-[15px] font-bold text-white/80">{formatCurrency(r.revenue, true)}</div>
            <div className="text-[11px] font-medium text-emerald/50 mt-0.5">{formatCurrency(r.profit, true)} profit</div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
