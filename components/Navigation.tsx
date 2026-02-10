import React from 'react';
import { ViewState } from '../types';

interface TopNavProps {
  onCartClick: () => void;
  cartCount: number;
  animateCart?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ onCartClick, cartCount, animateCart }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5 h-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <div className="flex items-center gap-6 group">
          <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-primary uppercase font-serif cursor-pointer group-hover:text-white transition-colors duration-500">
            Aura
          </span>
          <div className="hidden md:flex gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 ml-8">
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-105 transform duration-300">Collection</span>
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-105 transform duration-300">Bespoke</span>
            <span className="hover:text-primary cursor-pointer transition-colors hover:scale-105 transform duration-300">Heritage</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/80">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors hover:text-primary">
            <span className="material-icons text-xl">search</span>
          </button>
          <button 
            className={`p-2 hover:bg-white/5 rounded-full transition-all duration-300 relative ${animateCart ? 'scale-125 text-primary' : 'hover:text-primary'}`}
            onClick={onCartClick}
          >
            <span className="material-icons text-xl">shopping_bag</span>
            <span className={`absolute top-1 right-1 w-4 h-4 bg-primary text-black text-[9px] font-bold flex items-center justify-center rounded-full transition-all duration-300 ${cartCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'} ${animateCart ? 'bg-white' : ''}`}>
              {cartCount}
            </span>
          </button>
          <button className="hidden md:flex p-2 hover:bg-white/5 rounded-full transition-colors hover:text-primary">
             <span className="material-icons text-xl">person_outline</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: 'HOME', icon: 'home', label: 'Home' },
    { id: 'SHOP', icon: 'category', label: 'Shop' },
    { id: 'SAVED', icon: 'favorite_border', label: 'Saved' },
    { id: 'PROFILE', icon: 'person_outline', label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
      <div className="glass-panel rounded-full px-2 py-2 flex justify-between items-center shadow-2xl shadow-black/50 relative">
        {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
                <button 
                    key={item.id}
                    onClick={() => onChangeView(item.id as ViewState)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-500 rounded-full h-16 relative z-10 ${isActive ? 'text-black' : 'text-white/40 hover:text-white/70'}`}
                >
                    <span className="material-icons-outlined text-2xl relative">
                        {item.icon}
                        {isActive && <span className="absolute inset-0 animate-ping opacity-20 bg-white rounded-full"></span>}
                    </span>
                    <span className={`text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0'}`}>{item.label}</span>
                </button>
            )
        })}
        
        {/* Animated Background Pill */}
        <div 
            className="absolute top-2 bottom-2 bg-primary rounded-full -z-0 transition-all duration-500 ease-in-out shadow-[0_0_15px_rgba(242,185,13,0.4)]"
            style={{
                width: 'calc(25% - 4px)', // 4 items, minus padding
                left: `${navItems.findIndex(i => i.id === currentView) * 25}%`,
                transform: 'translateX(2px)' // adjust for padding
            }}
        ></div>
      </div>
    </div>
  );
};