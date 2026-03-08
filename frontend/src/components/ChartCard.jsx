export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`glass-card p-7 ${className}`}>
      <div className="mb-6">
        <h3 className="text-[17px] font-bold text-white/90 tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-[12px] text-white/20 mt-1.5 font-medium leading-relaxed">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
