'use client';

import { useEffect, useRef } from 'react';

type Options = {
  enabled: boolean;
  onLoadMore: () => void;
  /** Start loading before the sentinel is fully visible. */
  rootMargin?: string;
};

/** Infinite scroll: calls `onLoadMore` when the returned ref's element nears the viewport. */
export function useLoadMoreSentinel<T extends HTMLElement>({
  enabled,
  onLoadMore,
  rootMargin = '300px',
}: Options) {
  const ref = useRef<T>(null);
  const callback = useRef(onLoadMore);
  callback.current = onLoadMore;

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          callback.current();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return ref;
}
