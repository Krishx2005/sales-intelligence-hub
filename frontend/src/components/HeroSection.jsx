import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { formatCurrency, formatNumber } from '../utils/format';
import { Clock } from 'lucide-react';

export default function HeroSection({ kpis, lastRefreshed }) {
  const revCounter = useAnimatedCounter(kpis?.total_revenue, 2800, 200);
  const profitCounter = useAnimatedCounter(kpis?.total_profit, 2800, 400);
  const ordersCounter = useAnimatedCounter(kpis?.total_orders, 2800, 600);

  return (
    <div className="relative mb-10">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald pulse-dot" />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-emerald/70">Live Analytics</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.1] tracking-tight mb-4 gradient-text">
            Sales Intelligence<br />Hub
          </h1>

          <p className="text-[15px] text-white/30 max-w-md leading-relaxed font-light">
            Revenue trends, customer segmentation, churn risk, and quarterly forecasting — all in one place.
          </p>

          {lastRefreshed && (
            <div className="flex items-center gap-2 mt-5">
              <Clock size={11} className="text-white/15" />
              <span className="text-[11px] text-white/15 font-medium">Updated {lastRefreshed}</span>
            </div>
          )}
        </div>


        <div className="flex gap-10 lg:gap-14">
          {[
            { value: revCounter, format: (v) => formatCurrency(v, true), label: 'Revenue', color: 'text-white' },
            { value: profitCounter, format: (v) => formatCurrency(v, true), label: 'Profit', color: 'text-emerald-light' },
            { value: ordersCounter, format: (v) => formatNumber(v), label: 'Orders', color: 'text-electric-light' },
          ].map((item) => (
            <div key={item.label} className="text-right">
              <div className={`text-3xl md:text-4xl font-extrabold tracking-tight ${item.color}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                {item.format(item.value)}
              </div>
              <div className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/15 mt-2">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="section-divider mt-10" />
    </div>
  );
}
