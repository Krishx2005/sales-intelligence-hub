import { formatCurrency } from '../utils/format';

export default function CustomTooltip({ active, payload, label, valuePrefix = '$' }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="text-[11px] text-white/30 mb-2.5 font-semibold tracking-wide">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}40` }}
            />
            <span className="text-[12px] text-white/40">{entry.name}</span>
            <span className="text-[12px] text-white font-semibold ml-auto pl-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {valuePrefix === '$' ? formatCurrency(entry.value, true) : entry.value?.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
