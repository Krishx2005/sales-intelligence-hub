import { useState, useEffect } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const phases = [
      { at: 0, text: 'Connecting to database' },
      { at: 20, text: 'Loading analytics data' },
      { at: 45, text: 'Building charts' },
      { at: 70, text: 'Crunching numbers' },
      { at: 90, text: 'Almost ready' },
    ];

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 6 + 1.5;
        if (next >= 100) {
          clearInterval(interval);
          setFadeOut(true);
          setTimeout(onComplete, 600);
          return 100;
        }
        const currentPhase = [...phases].reverse().find((ph) => next >= ph.at);
        if (currentPhase) setPhase(currentPhase.text);
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#060a13' }}
    >

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />


      <div className="relative mb-10" style={{ animation: 'logo-breathe 3s ease-in-out infinite' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.1) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <div className="absolute -inset-px rounded-2xl" style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.05) 100%)',
            filter: 'blur(20px)',
          }} />
        </div>
      </div>


      <h1 className="text-lg font-semibold tracking-tight text-white/90 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Sales Intelligence
      </h1>
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-electric/60 mb-10">
        Analytics Hub
      </p>


      <div className="w-48 mb-5">
        <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full rounded-full transition-all duration-200 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #10b981)',
              boxShadow: '0 0 12px rgba(59,130,246,0.4)',
            }}
          />
        </div>
      </div>


      <p className="text-[11px] text-white/20 tracking-wide font-medium">{phase}</p>
    </div>
  );
}
