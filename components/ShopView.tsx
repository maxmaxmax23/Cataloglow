import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';
import RevealOnScroll from './RevealOnScroll';

interface ShopViewProps {
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ onProductClick, onAddToCart }) => {
  const [filter, setFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const filters = ['All', 'Skincare', 'Lips', 'Eyes', 'Fragrance', 'Face'];

  const filteredProducts = filter === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === filter);

  // Slice the products based on visibleCount
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Recommendations Logic: Show 4 items not in current category (cross-sell) or featured if All
  const recommendations = useMemo(() => {
    const pool = filter === 'All' 
        ? PRODUCTS.filter(p => p.isLimited || p.isNew)
        : PRODUCTS.filter(p => p.category !== filter);
    
    // Get 4 unique items, shuffle slightly or just take first 4 for stability
    return pool.slice(0, 4);
  }, [filter]);

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(8);
    setIsLoading(false);
  }, [filter]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && hasMore) {
          setIsLoading(true);
          // Simulate network delay for luxury feel
          setTimeout(() => {
            setVisibleCount((prev) => prev + 4); // Load 4 more items
            setIsLoading(false);
          }, 1200);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Trigger before reaching the absolute bottom
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [isLoading, hasMore]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();
      onAddToCart(product, 1);
  };

  return (
    <div className="pt-24 pb-32 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8 px-4 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-serif font-light mb-2">
          The <span className="text-primary font-bold">Midnight</span> Collection
        </h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Pure Elegance in Every Application</p>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-20 z-30 bg-background-dark/95 backdrop-blur-md border-y border-white/5 py-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto hide-scrollbar flex items-center justify-between gap-8">
            <div className="flex gap-6">
                {filters.map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 relative ${filter === f ? 'text-primary scale-110' : 'text-white/60 hover:text-white'}`}
                    >
                        {f}
                        {filter === f && <span className="absolute -bottom-2 left-0 right-0 h-[1px] bg-primary animate-scale-in"></span>}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6 shrink-0">
                <button className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-primary transition-colors">
                    Sort <span className="material-icons text-sm ml-1">expand_more</span>
                </button>
                 <button className="flex items-center text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-primary transition-colors">
                    Filter <span className="material-icons text-sm ml-1">tune</span>
                </button>
            </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {visibleProducts.map((product, idx) => (
            <RevealOnScroll 
                key={`${product.id}-${filter}`}
                delay={(idx % 4) * 0.1} // Delay based on column index
            >
                <div 
                    className="group cursor-pointer" 
                    onClick={() => onProductClick(product)}
                >
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-background-card border border-white/5 mb-4 group-hover:border-primary/30 transition-colors duration-500 img-shimmer">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                        />
                        
                        {/* Hover Overlay - Quick Add Button */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
                            <button 
                                onClick={(e) => handleQuickAdd(e, product)}
                                className="hidden md:block w-full bg-primary/90 text-black font-bold py-3 rounded uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg backdrop-blur-sm btn-shimmer"
                            >
                                Quick Add
                            </button>
                        </div>

                        {/* Mobile Only: Floating Action Button Style for Quick Add */}
                        <button 
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="md:hidden absolute bottom-3 right-3 bg-primary text-black h-8 w-8 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-30"
                        >
                            <span className="material-icons text-lg">add</span>
                        </button>

                        {product.isNew && (
                            <div className="absolute top-2 left-2 bg-primary/90 text-black text-[8px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-md z-20">New</div>
                        )}
                        {product.isLimited && (
                            <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-md text-white border border-white/20 text-[8px] font-bold px-2 py-1 rounded uppercase tracking-wider z-20">Limited</div>
                        )}
                    </div>
                    <div className="text-center group-hover:transform group-hover:-translate-y-1 transition-transform duration-300">
                        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">{product.category}</p>
                        <h3 className="text-sm font-bold text-white/90 mb-1 leading-tight">{product.name}</h3>
                        <p className="text-primary font-bold text-sm">${product.price.toFixed(2)}</p>
                    </div>
                </div>
            </RevealOnScroll>
        ))}
      </div>
      
      {/* Infinite Scroll Sentinel / Loading State */}
      <div 
        ref={loadMoreRef} 
        className="mt-16 h-20 flex flex-col items-center justify-center opacity-0 animate-fade-in"
        style={{ opacity: 1 }} // Ensure it's visible for observer
      >
         {isLoading && (
             <div className="flex flex-col items-center gap-3">
                 <div className="w-6 h-6 border-[1px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
                 <span className="text-[9px] uppercase tracking-[0.3em] text-primary animate-pulse">Loading Collection</span>
             </div>
         )}
         
         {!isLoading && !hasMore && filteredProducts.length > 0 && (
             <div className="flex flex-col items-center gap-2">
                 <div className="w-1 h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
                 <span className="text-[9px] uppercase tracking-[0.3em] text-white/20">End of Collection</span>
             </div>
         )}
         
         {!isLoading && !hasMore && filteredProducts.length === 0 && (
             <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">No products found</span>
         )}
      </div>

      {/* Recommendations Section */}
      {!isLoading && (
          <section className="mt-8 pt-12 border-t border-white/5 px-6 max-w-7xl mx-auto animate-fade-in">
              <div className="text-center mb-10">
                  <span className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold block mb-3">Curated Selection</span>
                  <h2 className="text-2xl md:text-3xl font-serif text-white">You Might Also Like</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
                  {recommendations.map((product, idx) => (
                      <RevealOnScroll key={`rec-${product.id}`} delay={idx * 0.1}>
                           <div 
                            className="group cursor-pointer" 
                            onClick={() => onProductClick(product)}
                        >
                            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-background-card border border-white/5 mb-3 group-hover:border-primary/30 transition-colors duration-500 img-shimmer">
                                 <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20">
                                    <button 
                                        onClick={(e) => handleQuickAdd(e, product)}
                                        className="w-full bg-primary/90 text-black font-bold py-2 rounded uppercase tracking-[0.2em] text-[8px] hover:bg-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg backdrop-blur-sm btn-shimmer"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                            <div className="text-center">
                                 <h3 className="text-xs font-bold text-white/90 mb-1 leading-tight">{product.name}</h3>
                                 <p className="text-primary text-[10px] font-bold">${product.price.toFixed(2)}</p>
                            </div>
                        </div>
                      </RevealOnScroll>
                  ))}
              </div>
          </section>
      )}
    </div>
  );
};

export default ShopView;