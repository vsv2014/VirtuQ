import { useEffect, useRef } from 'react';

/**
 * Calls `handler` when a pointer or focus event happens outside the element.
 * Used to close the user menu / dropdowns on outside click and Escape.
 */
export function useOnClickOutside<T extends HTMLElement>(
  handler: () => void,
  active = true,
) {
  const ref = useRef<T | null>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;
      if (node && !node.contains(event.target as Node)) {
        handlerRef.current();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return ref;
}
