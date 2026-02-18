import React, { useState, useEffect, useRef } from 'react';
import { CartItem } from '../src/types';

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
            document.body.style.overflow = 'hidden';
        } else {
            setIsClosing(true);
            document.body.style.overflow = '';
            const timer = setTimeout(() => setIsVisible(false), 500); // Match transition duration
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        // Notify parent immediately, the effect above will handle the visual transition
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
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ease-luxury"
                style={{ opacity: backdropOpacity }}
                onClick={handleClose}
            ></div>

            <div
                className="relative w-full max-w-md bg-background-dark h-full shadow-2xl flex flex-col border-l border-primary/20"
                style={{
                    transform: `translateX(${translateX})`,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="p-8 border-b border-white/5 text-center relative bg-background-dark">
                    <button onClick={handleClose} className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-white">Tu Selección</h2>
                    <div className="flex justify-center mt-2">
                        <span className="material-symbols-outlined text-primary text-xs">manage_history</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-overscroll bg-background-dark">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-500 animate-fade-in">
                            <span className="material-symbols-outlined text-4xl mb-4 font-thin">shopping_bag</span>
                            <p className="uppercase tracking-[0.2em] text-xs">Tu bolsa está vacía</p>
                            <button onClick={handleClose} className="mt-8 border-b border-primary text-primary text-xs uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-colors">
                                Descubrir Colección
                            </button>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={item.id} className="flex gap-6 group animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className="w-24 h-32 bg-neutral-dark overflow-hidden border border-white/5 shrink-0 relative group-hover:border-primary/30 transition-colors">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">{item.name}</h3>
                                            <p className="text-[10px] text-stone-500 uppercase tracking-widest">{item.volume || 'Estándar'}</p>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.id)} className="text-stone-600 hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center border border-white/10 bg-white/[0.02]">
                                            <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-stone-400 hover:text-white text-xs px-2 py-1 w-8 flex justify-center hover:bg-white/5 transition-colors">
                                                <span className="material-symbols-outlined text-[10px]">remove</span>
                                            </button>
                                            <span className="text-xs font-bold w-6 text-center text-primary">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-stone-400 hover:text-white text-xs px-2 py-1 w-8 flex justify-center hover:bg-white/5 transition-colors">
                                                <span className="material-symbols-outlined text-[10px]">add</span>
                                            </button>
                                        </div>
                                        <span className="text-white font-light text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-8 bg-background-card border-t border-primary/20">
                        <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-xs text-stone-400 uppercase tracking-wider">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-stone-400 uppercase tracking-wider">
                                <span>Envío</span>
                                <span className="text-primary">Cortesía</span>
                            </div>
                            <div className="flex justify-between text-xs text-stone-400 uppercase tracking-wider">
                                <span>Impuestos (Est.)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-4">
                                <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">Total</span>
                                <span className="text-xl font-light text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full bg-primary hover:bg-white hover:text-black text-background-dark font-extrabold py-5 uppercase tracking-[0.2em] text-xs transition-all duration-300 transform active:scale-[0.99] relative overflow-hidden group"
                        >
                            <span className="relative z-10">Continuar al Pago</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;