import React from 'react';
import { ViewState } from '../src/types';

interface TopNavProps {
  onCartClick: () => void;
  cartCount: number;
  animateCart?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ onCartClick, cartCount, animateCart }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-white/5 px-6 lg:px-12 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="material-symbols-outlined text-primary text-3xl group-hover:rotate-180 transition-transform duration-700">flare</span>
          <h1 className="text-2xl font-extrabold tracking-[0.2em] text-white uppercase group-hover:text-primary transition-colors duration-300">
            AURUM
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-primary transition-colors">Novedades</a>
          <a href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-primary transition-colors">La Colección</a>
          <a href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-primary transition-colors">Opulencia Científica</a>
          <a href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400 hover:text-primary transition-colors">Diario</a>
        </div>

        {/* Icons / Actions */}
        <div className="flex items-center gap-6">
          <button className="text-stone-300 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>

          <button
            className={`relative text-stone-300 hover:text-primary transition-colors ${animateCart ? 'scale-110 text-primary' : ''}`}
            onClick={onCartClick}
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className={`absolute -top-1 -right-1 bg-primary text-background-dark text-[9px] font-bold px-1 rounded-sm transition-all duration-300 ${cartCount > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
              {cartCount}
            </span>
          </button>

          <button className="hidden md:block text-stone-300 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
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
    { id: 'HOME', icon: 'home', label: 'Inicio' },
    { id: 'SHOP', icon: 'category', label: 'Tienda' },
    { id: 'SAVED', icon: 'favorite', label: 'Guardados' },
    { id: 'PROFILE', icon: 'person', label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className="bg-background-dark/90 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 flex justify-between items-center shadow-2xl relative overflow-hidden">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-500 rounded-full h-14 relative z-10 ${isActive ? 'text-background-dark' : 'text-stone-500 hover:text-white'}`}
            >
              <span className={`material-symbols-outlined text-2xl relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[9px] font-bold tracking-widest uppercase transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0 hidden'}`}>{item.label}</span>
            </button>
          )
        })}

        {/* Animated Background Pill */}
        <div
          className="absolute top-1 bottom-1 bg-primary rounded-full -z-0 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(212,175,53,0.4)]"
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