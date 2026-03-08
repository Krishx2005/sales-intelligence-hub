import { ChevronDown, RotateCcw } from 'lucide-react';

function SelectFilter({ label, value, options, onChange, allLabel = 'All' }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-white/15 uppercase tracking-[0.12em] mb-1.5 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full rounded-xl px-3.5 py-2.5 pr-9 text-[13px] text-white/70 font-medium
            focus:outline-none focus:border-electric/30 transition-all cursor-pointer
            hover:border-white/10 hover:bg-white/[0.03]"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <option value="" style={{ background: '#0f1525' }}>{allLabel}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: '#0f1525' }}>{opt}</option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
      </div>
    </div>
  );
}

export default function Filters({ filters, values, onChange }) {
  if (!filters) return null;

  const hasFilters = values.region || values.category || values.start || values.end;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <SelectFilter label="Region" value={values.region} options={filters.regions || []} onChange={(v) => onChange({ ...values, region: v })} />
      <SelectFilter label="Category" value={values.category} options={filters.categories || []} onChange={(v) => onChange({ ...values, category: v })} />
      <div>
        <label className="text-[10px] font-semibold text-white/15 uppercase tracking-[0.12em] mb-1.5 block">From</label>
        <input
          type="month"
          value={values.start}
          onChange={(e) => onChange({ ...values, start: e.target.value })}
          className="rounded-xl px-3.5 py-2.5 text-[13px] text-white/70 font-medium
            focus:outline-none focus:border-electric/30 transition-all"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            colorScheme: 'dark',
          }}
        />
      </div>
      <div>
        <label className="text-[10px] font-semibold text-white/15 uppercase tracking-[0.12em] mb-1.5 block">To</label>
        <input
          type="month"
          value={values.end}
          onChange={(e) => onChange({ ...values, end: e.target.value })}
          className="rounded-xl px-3.5 py-2.5 text-[13px] text-white/70 font-medium
            focus:outline-none focus:border-electric/30 transition-all"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            colorScheme: 'dark',
          }}
        />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({ region: '', category: '', start: '', end: '' })}
          className="flex items-center gap-1.5 text-[12px] text-electric/60 hover:text-electric font-medium px-3 py-2.5 rounded-xl
            hover:bg-electric/5 transition-all click-scale"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      )}
    </div>
  );
}
