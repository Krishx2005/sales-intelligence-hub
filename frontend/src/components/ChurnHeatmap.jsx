import { useMemo } from 'react';
import ChartCard from './ChartCard';
import { formatCurrency } from '../utils/format';

const RISK_COLORS = {
  Low: { bg: '#10b981', text: '#34d399' },
  Medium: { bg: '#f59e0b', text: '#fbbf24' },
  High: { bg: '#f43f5e', text: '#fb7185' },
};

export default function ChurnHeatmap({ data }) {
  const grid = useMemo(() => {
    if (!data?.length) return {};
    const result = {};
    data.forEach((row) => {
      const key = row.segment;
      if (!result[key]) result[key] = { Low: [], Medium: [], High: [] };
      if (result[key][row.churn_category]) {
        result[key][row.churn_category].push(row);
      }
    });
    return result;
  }, [data]);

  const segments = Object.keys(grid);
  const riskLevels = ['Low', 'Medium', 'High'];

  if (!segments.length) return null;

  return (
    <ChartCard title="Churn Risk Heatmap" subtitle="Segment distribution across risk tiers — cell intensity maps to customer concentration">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-semibold text-white/15 uppercase tracking-[0.12em] pb-4 pr-4 pl-1">Segment</th>
              {riskLevels.map((level) => (
                <th key={level} className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] pb-4 px-2"
                  style={{ color: `${RISK_COLORS[level].text}60` }}>
                  {level} Risk
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => (
              <tr key={segment}>
                <td className="text-[13px] text-white/40 py-1.5 pr-4 pl-1 font-medium">{segment}</td>
                {riskLevels.map((level) => {
                  const cells = grid[segment][level] || [];
                  const totalCount = cells.reduce((s, c) => s + c.count, 0);
                  const totalRev = cells.reduce((s, c) => s + c.total_revenue, 0);
                  const intensity = Math.min(totalCount / 60, 1);
                  const rc = RISK_COLORS[level];

                  return (
                    <td key={level} className="text-center py-1.5 px-1.5">
                      <div
                        className="rounded-xl px-3 py-3 transition-all duration-300 hover:scale-[1.04] cursor-default"
                        style={{
                          background: totalCount > 0
                            ? `rgba(${rc.bg === '#10b981' ? '16,185,129' : rc.bg === '#f59e0b' ? '245,158,11' : '244,63,94'}, ${(0.03 + intensity * 0.12).toFixed(3)})`
                            : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${totalCount > 0 ? `${rc.text}15` : 'rgba(255,255,255,0.02)'}`,
                        }}
                      >
                        {totalCount > 0 ? (
                          <>
                            <div className="text-[18px] font-bold" style={{ color: `${rc.text}cc` }}>{totalCount}</div>
                            <div className="text-[10px] font-medium text-white/15 mt-0.5">{formatCurrency(totalRev, true)}</div>
                          </>
                        ) : (
                          <div className="text-[13px] text-white/8">—</div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
