import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../src/types';
import { useCms } from '../src/hooks/useCMS';

interface ProductDetailModalProps {
    product: Product | null;
    products: Product[];
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
    onProductClick: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, products, onClose, onAddToCart, onProductClick }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Accordion states
    const [openSection, setOpenSection] = useState<string | null>('ingredients');
    
    // Variant state
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    const contentRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<number | null>(null);
    const touchStartXRef = useRef<number | null>(null);

    // Related products logic
    const relatedProducts = React.useMemo(() => {
        if (!product) return [];
        return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);
    }, [product, products]);

    useEffect(() => {
        if (product) {
            setIsVisible(true);
            setIsClosing(false);
            setQuantity(1);
            setDragY(0);
            setActiveImage(0);
            
            if (product.variants && Object.keys(product.variants).length > 0) {
                setSelectedVariantId(Object.keys(product.variants)[0]);
            } else {
                setSelectedVariantId(null);
            }
            
            document.body.style.overflow = 'hidden';
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
        } else {
            setIsClosing(true);
            document.body.style.overflow = '';
            const timer = setTimeout(() => setIsVisible(false), 500);
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = ''; };
    }, [product]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 500);
    };

    const handleAddToBag = () => {
        if (product) {
            onAddToCart(product, quantity);
            handleClose();
        }
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    // Touch handlers
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

    if (!product && !isVisible) return null;
    if (!product) return null; // Safety check

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center ${!product ? 'pointer-events-none' : ''}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500 ease-luxury"
                style={{ opacity: product && !isClosing ? 1 : 0 }}
                onClick={handleClose}
            ></div>

            {/* Modal Container */}
            <div
                className={`relative w-full max-w-6xl h-full md:h-[85vh] bg-background-dark md:rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in transition-all duration-500 ease-out transform ${product && !isClosing ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}
                onClick={e => e.stopPropagation()}
                style={{
                    transform: isClosing ? 'translateY(100%)' : ((isDragging && window.innerWidth < 768) ? `translateY(${Math.max(0, dragY)}px)` : undefined),
                    transition: isDragging ? 'none' : undefined
                }}
            >
                {/* Close Button (Mobile) */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 md:hidden text-white/70 hover:text-white bg-black/50 rounded-full p-2 backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Left Panel: Image Gallery */}
                <div className="w-full md:w-1/2 h-[50vh] md:h-full relative bg-neutral-900 group"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60 md:opacity-0"></div>

                    {/* Mobile Drag Handle Overlay */}
                    <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/60 to-transparent flex justify-center pt-4 md:hidden pointer-events-none">
                        <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                    </div>

                    {/* Navigation Arrows for Gallery (Mockup) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {[0, 1, 2].map((idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeImage === idx ? 'bg-primary w-6' : 'bg-white/30 hover:bg-white'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Panel: Product Details */}
                <div className="w-full md:w-1/2 h-full overflow-y-auto bg-background-dark p-6 md:p-12 md:pl-16 flex flex-col relative custom-scrollbar" ref={contentRef}>
                    {/* Close Button (Desktop) */}
                    <button
                        onClick={handleClose}
                        className="hidden md:block absolute top-8 right-8 text-stone-500 hover:text-primary transition-colors z-10"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>

                    <div className="flex-1">
                        {/* Header */}
                        <div className="mb-2">
                            <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase animate-fade-in block mb-2">
                                {product.category || 'Colección Exclusiva'}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 animate-slide-up leading-tight">
                                {product.name}
                            </h2>
                            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <span className="text-2xl font-light text-primary">${product.price}</span>
                                {product.volume && (
                                    <span className="text-sm text-stone-500 uppercase tracking-widest pl-4 border-l border-white/10">
                                        {product.volume}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10 animate-slide-up text-stone-300 leading-relaxed font-light" style={{ animationDelay: '0.2s' }}>
                            <p>{product.description}</p>
                        </div>

                        {/* Trust Badges Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-10 border-y border-white/5 py-6">
                            <div className="flex flex-col items-center text-center gap-2 group">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-stone-400 group-hover:border-primary/50 group-hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-lg">cruelty_free</span>
                                </div>
                                <span className="text-[9px] uppercase tracking-widest text-stone-400 group-hover:text-white transition-colors">{useCms('product.badges.crueltyFree', 'Cruelty Free')}</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 group">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-stone-400 group-hover:border-primary/50 group-hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-lg">science</span>
                                </div>
                                <span className="text-[9px] uppercase tracking-widest text-stone-400 group-hover:text-white transition-colors">{useCms('product.badges.labTested', 'Lab Tested')}</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 group">
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-stone-400 group-hover:border-primary/50 group-hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-lg">verified_user</span>
                                </div>
                                <span className="text-[9px] uppercase tracking-widest text-stone-400 group-hover:text-white transition-colors">{useCms('product.badges.approved', 'Aprobado ANMAT')}</span>
                            </div>
                        </div>

                        {/* Accordions (Simplified) */}
                        <div className="space-y-1 mb-12">
                            <div className="border border-white/5 rounded-lg overflow-hidden bg-white/[0.02]">
                                <button
                                    onClick={() => toggleSection('ingredients')}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">{useCms('product.accordions.ingredients', 'Ingredientes')}</span>
                                    <span className={`material-symbols-outlined text-sm text-stone-500 transition-transform duration-300 ${openSection === 'ingredients' ? 'rotate-180' : ''}`}>expand_more</span>
                                </button>
                                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${openSection === 'ingredients' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                    <div className="overflow-hidden">
                                        <div className="p-4 pt-0 text-sm text-stone-400 font-light leading-relaxed">
                                            Aqua / Water, Glycerin, Dimethicone, Alcohol Denat., Squalane, Ammonium Polyacryloyldimethyl Taurate, Macadamia Ternifolia Seed Oil.
                                            <div className="mt-2 text-[10px] text-stone-600 italic">{useCms('product.accordions.disclaimer', '* Lista de ingredientes sujeta a cambios. Ver empaque del producto.')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variants Selection */}
                        {product.variants && Object.keys(product.variants).length > 0 && (
                            <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Seleccionar Tono</h3>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(product.variants).map(([vId, v]) => (
                                        <button
                                            key={vId}
                                            onClick={() => setSelectedVariantId(vId)}
                                            className={`group flex items-center gap-3 p-2 pr-4 border rounded-full transition-all ${selectedVariantId === vId ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                        >
                                            <div 
                                                className="w-6 h-6 rounded-full border border-white/20 shadow-inner"
                                                style={{ backgroundColor: v.colorCode || '#ffffff' }}
                                            />
                                            <span className={`text-xs font-medium uppercase tracking-wider ${selectedVariantId === vId ? 'text-primary' : 'text-stone-300 group-hover:text-white'}`}>
                                                {v.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sticky Bottom Actions */}
                        <div className="bg-background-dark/95 backdrop-blur-sm pt-4 pb-8 sticky bottom-0 border-t border-white/5 mt-auto">
                            <div className="flex gap-4">
                                <div className="flex items-center border border-white/10 rounded-lg px-2 w-32 justify-between bg-black/20">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-full text-stone-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center font-serif text-xl"
                                    >
                                        -
                                    </button>
                                    <span className="text-white font-bold text-sm w-4 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-full text-stone-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center font-serif text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToBag}
                                    className="flex-1 bg-primary hover:bg-white hover:text-black text-background-dark font-extrabold py-4 px-6 rounded-lg uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-[0_0_20px_rgba(212,175,53,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] relative overflow-hidden group"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {useCms('product.buttons.add', 'Agregar al Carrito')}
                                        <span className="hidden group-hover:inline-block material-symbols-outlined text-sm animate-fade-in">arrow_forward</span>
                                    </span>
                                </button>
                            </div>
                            <p className="text-center text-[9px] uppercase tracking-widest text-stone-600 font-bold mt-4">{useCms('product.footer.shippingInfo', 'Envío gratuito en todos los pedidos')}</p>
                        </div>

                        {/* Related Products - Simplified for Modal */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-12 pt-12 border-t border-white/5">
                                <h3 className="text-xl font-serif text-white mb-6 text-center">{useCms('product.related.title', 'Completa tu Ritual')}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {relatedProducts.slice(0, 2).map((rp) => (
                                        <div key={rp.id} onClick={() => onProductClick(rp)} className="cursor-pointer group">
                                            <div className="aspect-[3/4] bg-neutral-800 mb-3 overflow-hidden relative rounded-sm">
                                                <img src={rp.image} alt={rp.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                                            </div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">{rp.name}</h4>
                                            <p className="text-primary text-xs mt-1">${rp.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;