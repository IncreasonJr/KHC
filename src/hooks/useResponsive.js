// /home/caleb/Desktop/PROJECTS/KHC/src/hooks/useResponsive.js
import { useState, useEffect } from 'react';

/**
 * Custom hook providing responsive screen breakpoint states
 * @returns {Object} { width, isMobile, isTablet, isDesktop }
 */
export const useResponsive = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width,
    isMobile: width <= 768,
    isTablet: width > 768 && width <= 1024,
    isDesktop: width > 1024
  };
};

export default useResponsive;
