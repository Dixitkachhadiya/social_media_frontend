import { useCallback, useRef, useState } from 'react';
import { parseApiError } from '../../utils/apiError';

// Tracks one AI call at a time: { loading, error (parsed), run(fn) }
export default function useAIRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const busy = useRef(false);

  const run = useCallback(async (request) => {
    if (busy.current) return null;
    busy.current = true;
    setLoading(true);
    setError(null);
    try {
      return await request();
    } catch (err) {
      setError(parseApiError(err));
      return null;
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, run };
}
