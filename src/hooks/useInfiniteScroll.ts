import { useEffect, useRef, useState, useCallback } from 'react';
import { useApi } from './useApi';

interface UseInfiniteScrollOptions<T> {
  fetchFunction: (page: number) => Promise<{
    data: T[];
    hasMore: boolean;
  }>;
  threshold?: number;
}

export function useInfiniteScroll<T>({ 
  fetchFunction,
  threshold = 100 
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);

  const { loading, error, execute } = useApi(fetchFunction);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    try {
      const response = await execute(page);
      if (response) {
        setItems(prev => [...prev, ...response.data]);
        setHasMore(response.hasMore);
        setPage(prev => prev + 1);
      }
    } finally {
      loadingRef.current = false;
    }
  }, [execute, hasMore, page]);

  const lastElementCallback = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, {
      rootMargin: `0px 0px ${threshold}px 0px`
    });

    if (node) {
      observerRef.current.observe(node);
      lastElementRef.current = node;
    }
  }, [loading, hasMore, loadMore, threshold]);

  useEffect(() => {
    loadMore();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []); // Initial load

  return {
    items,
    loading,
    error,
    hasMore,
    lastElementCallback,
    retry: loadMore
  };
}
