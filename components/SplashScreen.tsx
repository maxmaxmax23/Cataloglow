import React, { useEffect, useState } from 'react';

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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-dark text-white overflow-hidden transition-all duration-800 ease-in-out ${isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Background Overlay with Image - Parallax effect */}
      <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_XYo3GjYbLXs1hvNI0MBF31gbB909CI-1YMIuMNFAMBxUca1S55tSIfr3h2LumH7zGKmT3CqeOw9LSGvUBRkjbkQJGR5UlhCtJp0QnmoNyWU5fY31ixa_F-MuoC1R6BlN9DeTO1cfhKsIHTYBL4C-8A3KN4NQTsmLY_Svx8okoscLmExBQlK-2MKK8tlZr42tUhoWVz4FO1WLmIt6meOsJPk9ddMGihyVYnbJIBtCehiIbd5v9WJHdMOM_vniiRC3geCeEL8-4-z-"
          className="w-full h-full object-cover animate-slow-zoom grayscale"
          alt="Marble Texture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 transform ${isExiting ? 'translate-y-10 opacity-0' : 'translate-y-0'}`}>
        <div className="relative mb-8 flex items-center justify-center animate-blur-in">
          <span className="material-symbols-outlined text-7xl text-primary animate-pulse-slow">flare</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-primary-dark animate-shimmer mb-6" style={{ backgroundSize: '200% auto' }}>
          AURUM
        </h1>
        <p className="text-stone-300 text-xs tracking-[0.8em] uppercase font-bold animate-slide-up" style={{ animationDelay: '0.4s' }}>
          Opulencia Científica
        </p>

        <div className="mt-24 flex flex-col items-center w-64 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-100 ease-out shadow-[0_0_15px_rgba(212,175,53,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-[9px] tracking-[0.3em] uppercase text-primary/60 mt-4 font-bold">
            Sintetizando
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 flex items-center space-x-12 z-10 opacity-40 animate-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="text-center">
          <div className="text-[10px] tracking-[0.2em] text-stone-500 uppercase mb-1">Establecido</div>
          <div className="text-[12px] tracking-[0.2em] text-primary font-bold">MMXXIV</div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;