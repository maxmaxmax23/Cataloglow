import React from 'react';
import { CATEGORIES } from '../constants';
import { Product, ViewState } from '../src/types';
import RevealOnScroll from './RevealOnScroll';

interface HomeViewProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onChangeView: (view: ViewState) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ products, onProductClick, onChangeView }) => {
    // Use products passed from parent (App.tsx) which comes from Firebase
    const newArrivals = products.filter(p => p.isNew).slice(0, 4);
    const featured = products.slice(0, 4); // Just take first 4 for featured if no specific flag

    return (
        <div className="pb-32">
            {/* Hero Section */}
            <section className="relative h-[65vh] md:h-[80vh] w-full overflow-hidden group">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgSKVGYLwTHw67P6JZiwmWNY6z2aezTC-H7KNX-1mffbewdiXmBCdOf4M2i5-leEjm2usfs_R_rLqbGRnyPWDfh4Iwl-xYdVtJUyb8cUgMLtAlgVY0ISN4vjoWs9TDM0UCsBzdlNJMbtZIBaERH0yqyHJR9ySna9_x4yJ9VclpnryO5NPqh7sQ4onAb-u-jfcQq9ehRdqwpzfCwTivSWGpibYStFukMdSQ1SMv7e8zISS4YdkOYj1Kcxy-Y2Xfal85MbdRblLx1An6"
                    alt="Hero Model"
                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-2xl">
                    <span className="text-primary text-xs font-bold tracking-[0.4em] uppercase mb-4 block animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                        New Exclusive Release
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                        The <span className="text-primary italic inline-block animate-float" style={{ animationDuration: '4s' }}>Midas Touch</span> <br />Collection
                    </h1>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 max-w-md animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
                        Unveil the glow of pure gold with our 24k infused formula designed for the ultimate luxury skincare ritual.
                    </p>
                    <div className="flex gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0.7s' }}>
                        <button
                            onClick={() => onChangeView('SHOP')}
                            className="bg-primary text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Shop Now
                        </button>
                        <button
                            onClick={() => onChangeView('SHOP')}
                            className="glass-panel text-white border border-white/20 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white transition-all duration-300"
                        >
                            Explore
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories Rail */}
            <section className="py-12 px-6">
                <RevealOnScroll className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-serif">Curated <span className="italic text-primary">Categories</span></h2>
                    <button onClick={() => onChangeView('SHOP')} className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors">View All</button>
                </RevealOnScroll>

                <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 pl-1">
                    {CATEGORIES.map((cat, idx) => (
                        <RevealOnScroll
                            key={cat.id}
                            delay={idx * 0.1}
                            className="flex-none w-36 md:w-48 group cursor-pointer"
                        >
                            <div
                                onClick={() => onChangeView('SHOP')}
                                className="w-full"
                            >
                                <div className="relative aspect-square rounded-full p-[2px] bg-gradient-to-tr from-primary/30 to-transparent group-hover:from-primary transition-all duration-500 shadow-lg group-hover:shadow-[0_0_15px_rgba(242,185,13,0.3)]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-background-dark relative">
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                </div>
                                <p className="text-center mt-4 text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-primary transition-colors transform group-hover:translate-y-1 duration-300">{cat.name}</p>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="px-6 py-8">
                <RevealOnScroll>
                    <h2 className="text-2xl font-serif mb-8">Best of the <span className="font-bold">Season</span></h2>
                </RevealOnScroll>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {featured.map((product, idx) => (
                        <RevealOnScroll key={product.id} delay={idx * 0.1}>
                            <div
                                className="group cursor-pointer"
                                onClick={() => onProductClick(product)}
                            >
                                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-background-card transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                    {product.isNew && (
                                        <div className="absolute top-3 left-3 bg-primary text-black text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10 shadow-md">New</div>
                                    )}
                                    {product.isLimited && (
                                        <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md text-white border border-white/20 text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-10">Limited</div>
                                    )}
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <button className="w-full bg-white/10 backdrop-blur-md text-white py-3 rounded-lg font-bold uppercase text-[10px] tracking-widest mb-2 border border-white/20 hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            Quick View
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif mb-1 group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{product.category}</p>
                                    <p className="text-primary font-bold transition-transform duration-300 group-hover:translate-x-1">${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="px-6 py-12 border-t border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/2 to-transparent pointer-events-none"></div>

                <RevealOnScroll>
                    <div className="flex justify-between items-end mb-8 relative z-10">
                        <h2 className="text-2xl font-serif">Just <span className="italic text-primary">Arrived</span></h2>
                        <button onClick={() => onChangeView('SHOP')} className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors">View All</button>
                    </div>
                </RevealOnScroll>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 relative z-10">
                    {newArrivals.map((product, idx) => (
                        <RevealOnScroll key={product.id} delay={idx * 0.1}>
                            <div
                                className="group cursor-pointer"
                                onClick={() => onProductClick(product)}
                            >
                                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-background-card border border-white/5 group-hover:border-primary/30 transition-all duration-500">
                                    {/* Badge */}
                                    <div className="absolute top-2 left-2 bg-primary text-black text-[8px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10 shadow-md">New Arrival</div>

                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100" />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                        <button className="w-full bg-white/10 backdrop-blur-md text-white py-2 rounded border border-white/20 font-bold uppercase text-[8px] tracking-[0.2em] hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            Discover
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-serif font-bold text-white/90 mb-1 leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">{product.category}</p>
                                    <p className="text-primary font-bold text-sm">${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomeView;