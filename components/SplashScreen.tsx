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
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_XYo3GjYbLXs1hvNI0MBF31gbB909CI-1YMIuMNFAMBxUca1S55tSIfr3h2LumH7zGKmT3CqeOw9LSGvUBRkjbkQJGR5UlhCtJp0QnmoNyWU5fY31ixa_F-MuoC1R6BlN9DeTO1cfhKsIHTYBL4C-8A3KN4NQTsmLY_Svx8okoscLmExBQlK-2MKK8tlZr42tUhoWVz4FO1WLmIt6meOsJPk9ddMGihyVYnbJIBtCehiIbd5v9WJHdMOM_vniiRC3geCeEL8-4-z-" 
            className="w-full h-full object-cover animate-slow-zoom" 
            alt="Marble Texture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90"></div>
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 transform ${isExiting ? 'translate-y-10 opacity-0' : 'translate-y-0'}`}>
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center animate-blur-in">
            <div className="absolute inset-0 border border-primary/30 rounded-full scale-110 animate-pulse-glow"></div>
            <span className="material-icons text-6xl text-primary drop-shadow-[0_0_10px_rgba(242,185,13,0.5)]">diamond</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.3em] uppercase gold-text-shimmer mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          AURA
        </h1>
        <p className="text-primary text-xs tracking-[0.6em] uppercase font-light opacity-80 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          Cosmetics & Luxury
        </p>

        <div className="mt-20 flex flex-col items-center w-64 animate-fade-in" style={{ animationDelay: '0.6s' }}>
             <div className="text-[10px] tracking-[0.3em] uppercase text-white/50 mb-4">
                Initialising Experience
            </div>
            <div className="w-full h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                <div 
                    className="absolute left-0 top-0 h-full bg-primary transition-all duration-100 ease-out shadow-[0_0_15px_rgba(242,185,13,0.8)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      </div>

      <div className="absolute bottom-10 flex items-center space-x-8 z-10 opacity-50 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="text-center">
             <div className="text-[8px] tracking-widest text-white/40 uppercase mb-1">Collection</div>
             <div className="text-[10px] tracking-[0.2em] text-primary">FALL 2024</div>
          </div>
          <div className="h-6 w-[1px] bg-white/20"></div>
          <div className="text-center">
             <div className="text-[8px] tracking-widest text-white/40 uppercase mb-1">Origin</div>
             <div className="text-[10px] tracking-[0.2em] text-primary">PARIS • MILAN</div>
          </div>
      </div>
    </div>
  );
};

export default SplashScreen;