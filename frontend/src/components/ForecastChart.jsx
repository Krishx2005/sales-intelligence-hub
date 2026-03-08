import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import ChartCard from './ChartCard';
import { formatCurrency } from '../utils/format';

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="custom-tooltip">
      <p className="text-[11px] text-white/30 mb-2.5 font-semibold tracking-wide">{label}</p>
      {d?.revenue != null && (
        <p className="text-[12px] text-white/90">Actual: <span className="font-bold">{formatCurrency(d.revenue, true)}</span></p>
      )}
      {d?.predicted != null && (
        <p className="text-[12px] text-amber-glow/80">Predicted: <span className="font-bold">{formatCurrency(d.predicted, true)}</span></p>
      )}
      {d?.lower_ci != null && (
        <p className="text-[10px] text-white/15 mt-1.5">
          95% CI: {formatCurrency(d.lower_ci, true)} — {formatCurrency(d.upper_ci, true)}
        </p>
      )}
      {d?.is_forecast && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-[9px] font-semibold tracking-[0.1em] uppercase text-amber-glow/50">Projected</p>
        </div>
      )}
    </div>
  );
}

export default function ForecastChart({ data }) {
  if (!data?.length) return null;

  const lastActualIdx = data.findLastIndex((d) => !d.is_forecast);
  const boundaryQuarter = data[lastActualIdx]?.Year_Quarter;

  return (
    <ChartCard
      title="Revenue Forecasting"
      subtitle="Linear regression model — 4 quarter projection with 95% confidence band"
    >
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="actual-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ci-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" vertical={false} />
            <XAxis
              dataKey="Year_Quarter"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<ForecastTooltip />} />
            {boundaryQuarter && (
              <ReferenceLine
                x={boundaryQuarter}
                stroke="rgba(245,158,11,0.15)"
                strokeDasharray="4 4"
                label={{ value: 'Forecast', position: 'top', fill: 'rgba(245,158,11,0.4)', fontSize: 9, fontWeight: 600 }}
              />
            )}
            <Area dataKey="upper_ci" stroke="none" fill="url(#ci-fill)" animationDuration={1500} />
            <Area dataKey="lower_ci" stroke="none" fill="transparent" animationDuration={1500} />
            <Area
              dataKey="revenue" name="Actual Revenue"
              stroke="#3b82f6" strokeWidth={1.5}
              fill="url(#actual-fill)"
              dot={{ r: 2.5, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1.5, fill: '#060a13' }}
              animationDuration={1800}
              connectNulls={false}
            />
            <Line
              dataKey="predicted" name="Predicted"
              stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 3, stroke: '#f59e0b', strokeWidth: 1.5, fill: '#060a13' }}
              animationDuration={1800} animationDelay={400}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-8 mt-5 pt-5 border-t border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-[1.5px] bg-electric rounded" />
          <span className="text-[11px] text-white/20 font-medium">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-[1.5px] rounded" style={{ background: '#f59e0b', opacity: 0.6 }} />
          <span className="text-[11px] text-white/20 font-medium">Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded" style={{ background: 'rgba(245,158,11,0.08)' }} />
          <span className="text-[11px] text-white/20 font-medium">95% CI</span>
        </div>
      </div>
    </ChartCard>
  );
}
