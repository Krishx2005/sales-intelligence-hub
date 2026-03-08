import { useMemo } from 'react';

export default function Particles({ count = 20 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * 25,
        opacity: Math.random() * 0.2 + 0.05,
        color: Math.random() > 0.6 ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.3)',
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
