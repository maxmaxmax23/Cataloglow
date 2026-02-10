import React from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart, onProductClick }) => {
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
      // Reset scroll position when product changes
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
    return PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5);
  }, [product]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 500); // Matches CSS transition duration
  };

  const handleAddToCart = () => {
    if (product) {
        onAddToCart(product, quantity);
        handleClose();
    }
  }

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow drag if we are at the top of the scroll container
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

    // If scrolling horizontally (e.g. in the carousel), ignore vertical drag to prevent accidental close
    if (Math.abs(diffX) > Math.abs(diffY)) {
        setDragY(0);
        return;
    }

    if (diffY > 0) {
        setDragY(diffY);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartRef.current === null) return;
    
    setIsDragging(false);
    touchStartRef.current = null;
    touchStartXRef.current = null;

    if (dragY > 150) { 
        handleClose();
    } else {
        setDragY(0);
    }
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
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 ease-luxury"
        style={{ opacity: isClosing ? 0 : backdropOpacity }}
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-background-card rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
        style={{ 
            transform: transformStyle, 
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        {/* Swipe Handle for mobile */}
        <div 
            className="w-full h-8 absolute top-0 left-0 z-50 flex items-center justify-center sm:hidden bg-gradient-to-b from-black/50 to-transparent cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="w-12 h-1.5 bg-white/20 rounded-full backdrop-blur-md shadow-sm"></div>
        </div>

        {/* Close Button */}
        <button 
            onClick={handleClose}
            className="absolute top-6 right-6 z-20 text-white/50 hover:text-white transition-colors bg-black/20 rounded-full p-2 backdrop-blur-md hidden sm:block hover:bg-white/10 hover:scale-110 duration-300"
        >
            <span className="material-icons text-2xl">close</span>
        </button>

        <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto hide-scrollbar no-overscroll"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-full">
                {/* Image Section */}
                <div className="relative h-[45vh] md:h-auto bg-black shrink-0 overflow-hidden group">
                    <img 
                        key={product.id + '-img'} 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover opacity-90 select-none scale-105 group-hover:scale-110 transition-transform duration-[3s] ease-out animate-fade-in" 
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-card to-transparent md:hidden"></div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-background-card relative min-h-[50vh]">
                    {/* Marble Texture Background for Content */}
                     <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
                         backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDUYMJVrhBSBdVJZCGQAKVlWECyvUElZJszL1bS2ROwV5xDAFSYzFTrViGHmXLmiKnLpe0HhrhKcmOGdDNnGFuCGMAzPCBMJDubKKaT3hp05t-itNBlJCtbv5NgDQo8Zb4ns884-l4vHo94qIHuFYZbMzlVyDsRTmhtYxEb8wp-yitYWVz7HxJo33IUa3dmJraOilPxHHu4evPbNkua9yFODkwm1QAKq5D2MF-htS8fftiAU_urLsvlUfKdZPZiI7cbey3p6V_7Hk4r)',
                         backgroundSize: 'cover'
                     }}></div>

                    <div key={product.id} className="relative z-10 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-2">
                            <span className="text-primary text-[10px] tracking-[0.3em] uppercase font-bold">{product.subtitle}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 leading-tight">
                            {product.name}
                        </h2>
                        
                        <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-6">
                            <span className="text-2xl font-light text-primary">${product.price.toFixed(2)}</span>
                            <div className="h-4 w-[1px] bg-white/20"></div>
                            <span className="text-[10px] uppercase tracking-widest text-white/50">{product.volume || 'Standard Size'}</span>
                        </div>

                        <div className="space-y-6 mb-10">
                            <p className="text-white/80 font-serif italic font-light leading-relaxed">
                                {product.description}
                            </p>
                            <ul className="space-y-3">
                                {product.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-white/60 animate-slide-up opacity-0" style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}>
                                        <span className="material-icons text-primary text-xs">auto_awesome</span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Accordions (Visual) */}
                        <div className="border-t border-white/10">
                            <button className="w-full py-4 flex justify-between items-center group">
                                <span className="text-[10px] uppercase tracking-widest text-primary group-hover:text-white transition-colors">Ingredients</span>
                                <span className="material-icons text-primary text-sm transform group-hover:rotate-45 transition-transform duration-300">add</span>
                            </button>
                            <div className="w-full h-[1px] bg-white/5"></div>
                             <button className="w-full py-4 flex justify-between items-center group">
                                <span className="text-[10px] uppercase tracking-widest text-primary group-hover:text-white transition-colors">Application Ritual</span>
                                <span className="material-icons text-primary text-sm transform group-hover:rotate-45 transition-transform duration-300">add</span>
                            </button>
                        </div>

                        {/* Related Products Carousel */}
                        {relatedProducts.length > 0 && (
                            <div className="mt-12 border-t border-white/10 pt-8 mb-4">
                                <h3 className="text-lg font-serif mb-6 text-white/90">Complete the <span className="text-primary italic">Ritual</span></h3>
                                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-8 px-8 md:mx-0 md:px-0">
                                    {relatedProducts.map(rp => (
                                        <div 
                                            key={rp.id} 
                                            className="w-32 shrink-0 cursor-pointer group flex flex-col"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onProductClick(rp);
                                            }}
                                        >
                                            <div className="aspect-[4/5] rounded bg-white/5 overflow-hidden mb-3 relative border border-white/5 group-hover:border-primary/30 transition-colors">
                                                <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                            </div>
                                            <h4 className="text-xs font-bold text-white/80 truncate group-hover:text-primary transition-colors">{rp.name}</h4>
                                            <p className="text-[10px] text-white/40 mt-1">${rp.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="bg-background-dark border-t border-primary/20 p-6 md:px-12 relative z-20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                 {/* Qty */}
                 <div className="flex items-center border border-primary/30 rounded-lg p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white/5 rounded transition-colors">
                        <span className="material-icons text-sm">remove</span>
                    </button>
                    <span className="w-10 text-center font-bold text-primary">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-primary hover:bg-white/5 rounded transition-colors">
                        <span className="material-icons text-sm">add</span>
                    </button>
                 </div>

                 {/* Add Button */}
                 <button 
                    onClick={handleAddToCart}
                    className="flex-1 w-full bg-primary hover:bg-white hover:text-black text-black font-bold py-4 rounded-lg uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] group relative overflow-hidden"
                 >
                    {/* Shimmer effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:animate-shimmer-slide"></div>
                    
                    <span className="material-icons text-lg relative z-10">shopping_bag</span>
                    <span className="relative z-10">Add to Selection</span>
                 </button>

                 <button className="w-14 h-14 rounded-lg border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all duration-300">
                     <span className="material-icons">favorite_border</span>
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;