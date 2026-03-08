import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ChartCard from './ChartCard';
import { formatCurrency } from '../utils/format';

const SEGMENT_COLORS = {
  Champions: '#3b82f6',
  'Loyal Customers': '#10b981',
  'Potential Loyalists': '#06b6d4',
  'New Customers': '#8b5cf6',
  'At Risk': '#f59e0b',
  "Can't Lose Them": '#ef4444',
  'About to Sleep': '#f97316',
  'Need Attention': '#ec4899',
  Lost: '#4b5563',
};

function BubbleTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = SEGMENT_COLORS[d.segment] || '#6b7280';
  return (
    <div className="custom-tooltip">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}40` }} />
        <p className="text-[13px] font-bold text-white/90">{d.segment}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[11px] text-white/30"><span className="text-white/60 font-medium">{d.count}</span> customers</p>
        <p className="text-[11px] text-white/30">Avg Revenue: <span className="text-white/60 font-medium">{formatCurrency(d.avg_revenue, true)}</span></p>
        <p className="text-[11px] text-white/30">Frequency: <span className="text-white/60 font-medium">{d.avg_frequency}x</span></p>
        <p className="text-[11px] text-white/30">Recency: <span className="text-white/60 font-medium">{d.avg_recency} days</span></p>
        <p className="text-[11px] text-white/30">Churn Risk: <span className="text-white/60 font-medium">{d.avg_churn_risk}%</span></p>
      </div>
    </div>
  );
}

export default function SegmentBubbleChart({ data }) {
  if (!data?.length) return null;

  return (
    <ChartCard title="Customer Segmentation" subtitle="RFM-based clustering — bubble size represents customer count">
      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, left: -5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.025)" />
            <XAxis
              dataKey="avg_frequency"
              name="Avg Frequency"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Purchase Frequency', position: 'bottom', offset: 0, fontSize: 10, fill: 'rgba(255,255,255,0.12)', fontFamily: 'Plus Jakarta Sans' }}
            />
            <YAxis
              dataKey="avg_revenue"
              name="Avg Revenue"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.15)', fontFamily: 'Plus Jakarta Sans' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            />
            <ZAxis dataKey="count" range={[120, 2200]} name="Customers" />
            <Tooltip content={<BubbleTooltip />} />
            <Scatter data={data} animationDuration={1800}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={SEGMENT_COLORS[entry.segment] || '#6b7280'}
                  fillOpacity={0.5}
                  stroke={SEGMENT_COLORS[entry.segment] || '#6b7280'}
                  strokeWidth={1}
                  strokeOpacity={0.6}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-5 border-t border-white/[0.03]">
        {data.map((seg) => (
          <div key={seg.segment} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: SEGMENT_COLORS[seg.segment] || '#6b7280', boxShadow: `0 0 6px ${SEGMENT_COLORS[seg.segment]}30` }}
            />
            <span className="text-[11px] text-white/25 font-medium">{seg.segment} <span className="text-white/15">({seg.count})</span></span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
