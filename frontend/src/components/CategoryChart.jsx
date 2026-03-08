import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

export default function CategoryChart({ data }) {
  if (!data?.length) return null;

  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  return (
    <ChartCard title="Category & Sub-Category Performance" subtitle="Revenue breakdown across the product hierarchy">
      <div className="h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 90, bottom: 0 }}
            barGap={2}
          >
            <defs>
              <linearGradient id="cat-rev" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="cat-profit" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="Sub_Category"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.30)', fontFamily: 'Plus Jakarta Sans', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={85}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="Revenue" fill="url(#cat-rev)" radius={[0, 6, 6, 0]} barSize={12} animationDuration={1400} />
            <Bar dataKey="profit" name="Profit" fill="url(#cat-profit)" radius={[0, 6, 6, 0]} barSize={12} animationDuration={1400} animationDelay={200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
