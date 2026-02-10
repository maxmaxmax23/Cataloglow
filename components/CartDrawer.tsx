import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, onCheckout }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Drag state
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<number | null>(null);

  // Manage visibility state to allow for exit animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      setDragX(0);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => setIsVisible(false), 500); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    // Notify parent immediately, the effect above will handle the visual transition
    // Actually, calling onClose sets isOpen=false, which triggers the effect loop to animate out
    onClose();
  };

  // Touch handlers for swipe-to-close (right)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartRef.current;

    // Only allow dragging right (positive diff)
    if (diff > 0) {
        setDragX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current === null) return;
    
    setIsDragging(false);
    touchStartRef.current = null;

    if (dragX > 100) { // Threshold to close
        handleClose();
    } else {
        setDragX(0); // Snap back
    }
  };

  if (!isVisible && !isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Calculate position based on state and drag
  // if isClosing (or !isOpen), we animate to 100%
  // if dragging, we follow drag
  let translateX = '100%';
  if (isOpen && !isClosing) {
      translateX = `${Math.max(0, dragX)}px`;
  }
  
  // Opacity of backdrop
  const backdropOpacity = (isOpen && !isClosing) ? Math.max(0, 1 - (dragX / 400)) : 0;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${!isOpen ? 'pointer-events-none' : ''}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-luxury" 
        style={{ opacity: backdropOpacity }}
        onClick={handleClose}
      ></div>
      
      <div 
        className="relative w-full max-w-md bg-background-dark h-full shadow-2xl flex flex-col border-l border-primary/20"
        style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 1), rgba(10, 10, 10, 1))',
            transform: `translateX(${translateX})`,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-8 border-b border-white/10 text-center relative">
            <button onClick={handleClose} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                <span className="material-icons">arrow_forward</span>
            </button>
            <h2 className="text-2xl font-serif">Shopping Bag</h2>
            <div className="flex justify-center mt-2">
                <span className="material-icons text-primary text-xs">workspace_premium</span>
            </div>
            {/* Visual handle for desktop/mouse users to know it can be closed via swipe/arrow */}
            <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-overscroll">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40 animate-fade-in">
                    <span className="material-icons text-4xl mb-4">shopping_bag</span>
                    <p className="uppercase tracking-widest text-xs">Your bag is empty</p>
                </div>
            ) : (
                items.map((item, idx) => (
                    <div key={item.id} className="flex gap-4 group animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div className="w-20 h-24 bg-white/5 rounded-lg overflow-hidden border border-white/10 shrink-0 relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute top-0 right-0 bg-primary text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-bl">{item.quantity}</div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-white/90">{item.name}</h3>
                                    <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{item.volume || 'Standard'}</p>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)} className="text-white/30 hover:text-primary transition-colors">
                                    <span className="material-icons text-sm">close</span>
                                </button>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-3 border border-white/10 rounded-full px-2 py-1">
                                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-white/50 hover:text-white text-xs px-1">-</button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-white/50 hover:text-white text-xs px-1">+</button>
                                </div>
                                <span className="text-primary font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {items.length > 0 && (
            <div className="p-6 bg-black/40 border-t border-primary/20">
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs text-white/60">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                        <span>Shipping</span>
                        <span className="italic">Complimentary</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                        <span>Taxes (Estimated)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                        <span className="text-sm font-light uppercase tracking-widest">Total Investment</span>
                        <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                </div>
                <button 
                    onClick={onCheckout}
                    className="w-full bg-primary hover:bg-white hover:text-black text-black font-bold py-4 rounded-lg uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                >
                    Proceed to Checkout
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;