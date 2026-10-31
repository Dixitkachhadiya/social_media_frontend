import { useCallback, useEffect, useState } from 'react';

// Seconds remaining until a deadline; start(seconds) sets a new deadline
export default function useCountdown(initialSeconds = 0) {
  const [deadline, setDeadline] = useState(() => (initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : 0));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline || deadline <= now) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline, now]);

  const start = useCallback((seconds) => {
    setNow(Date.now());
    setDeadline(seconds > 0 ? Date.now() + seconds * 1000 : 0);
  }, []);

  return [Math.max(0, Math.ceil((deadline - now) / 1000)), start];
}
