import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';

const REGION_COLORS = {
  West: '#3b82f6',
  East: '#10b981',
  Central: '#f59e0b',
  South: '#a855f7',
};

const CATEGORY_COLORS = {
  Technology: '#3b82f6',
  'Office Supplies': '#10b981',
  Furniture: '#f59e0b',
};

export default function SalesTrendChart({ data, groupBy = 'region' }) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    const grouped = {};
    const groupKey = groupBy === 'category' ? 'Category' : 'Region';

    data.forEach((row) => {
      const month = row.Year_Month;
      if (!grouped[month]) grouped[month] = { month };
      grouped[month][row[groupKey]] = (grouped[month][row[groupKey]] || 0) + row.revenue;
    });

    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }, [data, groupBy]);

  const colors = groupBy === 'category' ? CATEGORY_COLORS : REGION_COLORS;
  const keys = Object.keys(colors);

  return (
    <ChartCard
      title={groupBy === 'category' ? 'Revenue by Category' : 'Revenue by Region'}
      subtitle="Monthly revenue distribution across time periods"
    >
      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {keys.map((key) => (
                <linearGradient key={key} id={`grad-${key}-${groupBy}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[key]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors[key]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', paddingTop: 16, fontFamily: 'Plus Jakarta Sans' }}
            />
            {keys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[key]}
                strokeWidth={1.5}
                fill={`url(#grad-${key}-${groupBy})`}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 1.5, stroke: colors[key], fill: '#060a13' }}
                animationDuration={1800}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
