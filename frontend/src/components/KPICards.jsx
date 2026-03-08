import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';
import { DollarSign, TrendingUp, ShoppingCart, Users, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function KPICard({ label, value, formattedValue, icon: Icon, color, trend, delay = 0 }) {
  const animated = useAnimatedCounter(value, 2400, delay);

  return (
    <div
      className="kpi-card animate-fade-in-up"
      style={{ '--accent-color': color, animationDelay: `${delay}ms` }}
    >
      {/* Icon + trend row */}
      <div className="flex items-center justify-between mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}10`, border: `1px solid ${color}15` }}
        >
          <Icon size={18} style={{ color, strokeWidth: 1.5 }} />
        </div>
        {trend != null && (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              color: trend >= 0 ? '#34d399' : '#fb7185',
              background: trend >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            }}
          >
            {trend >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-[28px] font-extrabold text-white tracking-tight leading-none"
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formattedValue(animated)}
      </p>

      {/* Label */}
      <p className="text-[11px] font-semibold text-white/20 mt-2.5 uppercase tracking-[0.1em]">{label}</p>
    </div>
  );
}

export default function KPICards({ kpis }) {
  if (!kpis) return null;

  const cards = [
    { label: 'Total Revenue', value: kpis.total_revenue, formattedValue: (v) => formatCurrency(v, true), icon: DollarSign, color: '#3b82f6', trend: kpis.latest_growth_rate, delay: 100 },
    { label: 'Total Profit', value: kpis.total_profit, formattedValue: (v) => formatCurrency(v, true), icon: TrendingUp, color: '#10b981', trend: null, delay: 200 },
    { label: 'Profit Margin', value: kpis.profit_margin, formattedValue: (v) => formatPercent(v), icon: Percent, color: '#f59e0b', trend: null, delay: 300 },
    { label: 'Total Orders', value: kpis.total_orders, formattedValue: (v) => formatNumber(v), icon: ShoppingCart, color: '#a855f7', trend: null, delay: 400 },
    { label: 'Customers', value: kpis.total_customers, formattedValue: (v) => formatNumber(v), icon: Users, color: '#06b6d4', trend: null, delay: 500 },
    { label: 'Avg. Order Value', value: kpis.avg_order_value, formattedValue: (v) => formatCurrency(v), icon: DollarSign, color: '#f43f5e', trend: null, delay: 600 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
