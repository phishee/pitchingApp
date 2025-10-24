'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      
      // Only update if there's a significant scroll difference
      if (Math.abs(scrollY - lastScrollY.current) > 5) {
        setScrollDirection(direction);
        setIsScrolling(true);
        
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set new timeout to reset scrolling state
        timeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      }
      
      lastScrollY.current = scrollY;
    };

    const onScroll = () => {
      updateScrollDirection();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scrollDirection, isScrolling };
}
