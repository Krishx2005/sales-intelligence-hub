import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target, duration = 2000, delay = 0) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    if (target == null || target === 0) {
      setValue(0);
      return;
    }

    const timeout = setTimeout(() => {
      startTime.current = performance.now();

      function animate(now) {
        const elapsed = now - startTime.current;
        const progress = Math.min(elapsed / duration, 1);

        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(eased * target);

        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        }
      }

      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, delay]);

  return value;
}
