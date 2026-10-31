import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../utils/apiError';

/**
 * Loads a backend list endpoint page by page ({ [itemsKey]: [], pagination }).
 * - Reloads from page 1 whenever `deps` change.
 * - Ignores responses from superseded requests and blocks concurrent "load more" calls.
 * - De-duplicates by id when pages shift because of newly created items.
 */
export default function usePaginatedList(fetchPage, { itemsKey, deps = [], enabled = true }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(enabled ? 'loading' : 'idle');
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  const loadFirstPage = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchRef.current(1);
      if (id !== requestId.current) return;
      setItems(data[itemsKey] ?? []);
      setPagination(data.pagination ?? null);
      setResponse(data);
      setStatus('ready');
    } catch (err) {
      if (id !== requestId.current) return;
      setError(errorMessage(err));
      setStatus('error');
    }
  }, [itemsKey]);

  useEffect(() => {
    if (!enabled) return;
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, loadFirstPage, ...deps]);

  const hasMore = Boolean(pagination && pagination.page < pagination.total_pages);

  const loadMore = useCallback(async () => {
    if (!pagination || loadingMoreRef.current || pagination.page >= pagination.total_pages) return;
    const id = requestId.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await fetchRef.current(pagination.page + 1);
      if (id !== requestId.current) return;
      setItems((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...(data[itemsKey] ?? []).filter((item) => !item.id || !seen.has(item.id))];
      });
      setPagination(data.pagination ?? null);
      setResponse(data);
    } catch (err) {
      if (id === requestId.current) setError(errorMessage(err));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [pagination, itemsKey]);

  // Helpers for optimistic local updates
  const updateItem = useCallback((id, changes) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...(typeof changes === 'function' ? changes(item) : changes) } : item)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setPagination((p) => (p ? { ...p, total: Math.max(0, p.total - 1) } : p));
  }, []);

  const prependItem = useCallback((item) => {
    setItems((current) => [item, ...current.filter((existing) => existing.id !== item.id)]);
    setPagination((p) => (p ? { ...p, total: p.total + 1 } : p));
  }, []);

  const appendItem = useCallback((item) => {
    setItems((current) => [...current.filter((existing) => existing.id !== item.id), item]);
    setPagination((p) => (p ? { ...p, total: p.total + 1 } : p));
  }, []);

  return {
    items,
    setItems,
    pagination,
    response,
    status,
    error,
    hasMore,
    loadingMore,
    loadMore,
    reload: loadFirstPage,
    updateItem,
    removeItem,
    prependItem,
    appendItem,
  };
}
