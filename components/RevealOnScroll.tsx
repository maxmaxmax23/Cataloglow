import React, { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // seconds
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ 
  children, 
  className = "", 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If we've already animated, don't set up observer again
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const onAnimationEnd = () => {
      setHasAnimated(true);
  };

  // Once animated, we just use opacity-100 to keep DOM clean and avoid replay if class is toggled externally
  const animClass = hasAnimated ? 'opacity-100' : (isVisible ? 'animate-slide-up' : 'opacity-0');

  return (
    <div 
      ref={ref} 
      className={`${className} ${animClass}`}
      style={{ 
          animationDelay: `${delay}s`, 
          animationFillMode: 'both' 
      }}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;