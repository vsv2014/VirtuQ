import { useState, useEffect } from 'react';

interface ScrollPosition {
  scrollY: number;
  isScrollingUp: boolean;
  isAtTop: boolean;
}

export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    isScrollingUp: false,
    isAtTop: true,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      
      setScrollPosition({
        scrollY: currentScrollY,
        isScrollingUp: currentScrollY < lastScrollY,
        isAtTop: currentScrollY < 10,
      });
      
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollPosition;
}
