import React from 'react';
import { Product } from '../src/types';

interface ProductDetailModalProps {
    product: Product | null;
    products: Product[];
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
    onProductClick: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, products, onClose, onAddToCart, onProductClick }) => {
    const [quantity, setQuantity] = React.useState(1);
    const [isClosing, setIsClosing] = React.useState(false);
    const [dragY, setDragY] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);

    const contentRef = React.useRef<HTMLDivElement>(null);
    const touchStartRef = React.useRef<number | null>(null);
    const touchStartXRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (product) {
            setQuantity(1);
            setIsClosing(false);
            setDragY(0);
            document.body.style.overflow = 'hidden';
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [product]);

    // Related products logic
    const relatedProducts = React.useMemo(() => {
        if (!product) return [];
        return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);
    }, [product, products]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 500);
    };

    const handleAddToCart = () => {
        if (product) {
            onAddToCart(product, quantity);
            handleClose();
        }
    }

    // Touch handlers... (Keep existing logic)
    const handleTouchStart = (e: React.TouchEvent) => {
        if (contentRef.current && contentRef.current.scrollTop <= 0) {
            touchStartRef.current = e.touches[0].clientY;
            touchStartXRef.current = e.touches[0].clientX;
            setIsDragging(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartRef.current === null || touchStartXRef.current === null) return;
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = currentY - touchStartRef.current;
        const diffX = currentX - touchStartXRef.current;
        if (Math.abs(diffX) > Math.abs(diffY)) { setDragY(0); return; }
        if (diffY > 0) { setDragY(diffY); }
    };

    const handleTouchEnd = () => {
        if (touchStartRef.current === null) return;
        setIsDragging(false);
        touchStartRef.current = null;
        touchStartXRef.current = null;
        if (dragY > 150) { handleClose(); } else { setDragY(0); }
    };

    if (!product) return null;

    const transformStyle = isClosing
        ? 'translateY(100%)'
        : `translateY(${Math.max(0, dragY)}px)`;

    const backdropOpacity = Math.max(0, 1 - (dragY / 600));

    return (
        <div className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 ${isClosing ? 'pointer-events-none' : ''}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500 ease-out"
                style={{ opacity: isClosing ? 0 : backdropOpacity }}
                onClick={handleClose}
            ></div>

            {/* Modal Container */}
            <div
                className="relative w-full max-w-6xl h-[95vh] sm:h-[90vh] bg-background-dark rounded-t-sm sm:rounded-sm overflow-hidden flex flex-col shadow-2xl border border-white/10"
                style={{
                    transform: transformStyle,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 z-30 text-stone-400 hover:text-white transition-colors p-2 hidden sm:block"
                >
                    <span className="material-symbols-outlined text-3xl">close</span>
                </button>

                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto hide-scrollbar no-overscroll"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-full">
                        {/* Image Section */}
                        <div className="relative h-[50vh] lg:h-auto bg-neutral-dark shrink-0 overflow-hidden group">
                            <img
                                key={product.id + '-img'}
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105 ease-out select-none"
                                draggable={false}
                            />
                            {/* Mobile Drag Handle Overlay */}
                            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/60 to-transparent flex justify-center pt-4 lg:hidden pointer-events-none">
                                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 lg:p-16 flex flex-col bg-background-dark relative">
                            <div className="mb-2">
                                <span className="text-primary text-[10px] tracking-[0.4em] uppercase font-bold block mb-4">Scientific Opulence</span>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                                    {product.name}
                                </h2>
                                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
                                    <span className="text-3xl font-light text-primary">${product.price.toFixed(2)}</span>
                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                    <div className="flex items-center gap-1 text-primary">
                                        <span className="material-symbols-outlined text-sm">star</span>
                                        <span className="material-symbols-outlined text-sm">star</span>
                                        <span className="material-symbols-outlined text-sm">star</span>
                                        <span className="material-symbols-outlined text-sm">star</span>
                                        <span className="material-symbols-outlined text-sm">star</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 mb-12 flex-1">
                                <p className="text-stone-400 font-light text-lg leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02]">
                                        <span className="material-symbols-outlined text-primary">verified</span>
                                        <div>
                                            <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Authentic</p>
                                            <p className="text-stone-500 text-[10px]">100% Certified Origin</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02]">
                                        <span className="material-symbols-outlined text-primary">science</span>
                                        <div>
                                            <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">Potency</p>
                                            <p className="text-stone-500 text-[10px]">Clinical Grade</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Functional Accordions */}
                                <div className="border-t border-white/5 mt-8">
                                    <details className="group border-b border-white/5">
                                        <summary className="flex justify-between items-center cursor-pointer py-6 list-none">
                                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white group-hover:text-primary transition-colors">Key Benefits</span>
                                            <span className="material-symbols-outlined text-stone-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                                        </summary>
                                        <div className="pb-6 text-stone-400 text-sm font-light leading-relaxed">
                                            <ul className="space-y-2">
                                                {product.benefits?.map((b, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                                                        {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </details>
                                    <details className="group border-b border-white/5">
                                        <summary className="flex justify-between items-center cursor-pointer py-6 list-none">
                                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white group-hover:text-primary transition-colors">How to Use</span>
                                            <span className="material-symbols-outlined text-stone-500 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                                        </summary>
                                        <div className="pb-6 text-stone-400 text-sm font-light leading-relaxed">
                                            <p>Apply to clean, dry skin morning and evening. Gently massage in upward circular motions until fully absorbed.</p>
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="space-y-6">
                                <div className="flex items-center w-32 border border-stone-700 bg-black/20">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-12 flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span className="flex-1 text-center font-bold text-white text-sm">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-12 flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-primary hover:bg-white hover:text-black text-background-dark font-extrabold py-5 uppercase tracking-[0.2em] text-xs transition-colors duration-300"
                                    >
                                        Add to Bag
                                    </button>
                                    <button className="px-6 border border-white/20 hover:border-white text-white transition-colors duration-300">
                                        <span className="material-symbols-outlined">favorite_border</span>
                                    </button>
                                </div>
                                <p className="text-center text-[9px] uppercase tracking-widest text-stone-600 font-bold">Complimentary Shipping on all orders</p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;