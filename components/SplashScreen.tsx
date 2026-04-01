import React, { useEffect, useState } from 'react';
import { useCms } from '../src/hooks/useCMS';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Trigger exit animation
          setIsExiting(true);
          // Wait for exit animation to complete before unmounting
          setTimeout(onComplete, 800);
          return 100;
        }
        // Non-linear progress for realism
        const increment = Math.max(0.5, (100 - prev) / 20);
        return prev + increment;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden transition-all duration-800 ease-in-out ${isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Overlay - Subtle Texture */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black"></div>
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 transform ${isExiting ? 'translate-y-10 opacity-0' : 'translate-y-0'}`}>
        <div className="relative mb-6 flex items-center justify-center animate-blur-in">
          <span className="material-symbols-outlined text-6xl text-primary animate-pulse-slow">flare</span>
        </div>

        {/* Logo Text - Solid Color for Visibility */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-[0.3em] uppercase text-primary mb-6 animate-scale-up border-y border-primary/20 py-4 px-8">
          {useCms('splash.text.title', 'AURUM')}
        </h1>

        {/* New Tagline Options */}
        <p className="text-stone-400 text-[10px] md:text-xs tracking-[0.6em] uppercase font-bold animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {useCms('splash.text.tagline', 'Lujo Redefinido')}
        </p>

        <div className="mt-20 flex flex-col items-center w-64 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-100 ease-out shadow-[0_0_10px_rgba(212,175,53,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-[9px] tracking-[0.3em] uppercase text-primary/60 mt-4 font-bold">
            {useCms('splash.text.loading', 'Cargando')}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 flex items-center space-x-12 z-10 opacity-40 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="text-center">
          <div className="text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1">{useCms('splash.text.established', 'Establecido')}</div>
          <div className="text-[12px] tracking-[0.2em] text-primary font-bold">{useCms('splash.text.year', 'MMXXIV')}</div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;