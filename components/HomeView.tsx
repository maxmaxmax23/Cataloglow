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
            <section className="relative h-[75vh] w-full overflow-hidden group">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgSKVGYLwTHw67P6JZiwmWNY6z2aezTC-H7KNX-1mffbewdiXmBCdOf4M2i5-leEjm2usfs_R_rLqbGRnyPWDfh4Iwl-xYdVtJUyb8cUgMLtAlgVY0ISN4vjoWs9TDM0UCsBzdlNJMbtZIBaERH0yqyHJR9ySna9_x4yJ9VclpnryO5NPqh7sQ4onAb-u-jfcQq9ehRdqwpzfCwTivSWGpibYStFukMdSQ1SMv7e8zISS4YdkOYj1Kcxy-Y2Xfal85MbdRblLx1An6"
                    alt="Hero Model"
                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105 ease-in-out grayscale-[100%] group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
                    <span className="text-primary text-xs font-bold tracking-[0.5em] uppercase mb-6 block animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
                        Scientific Opulence
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-none tracking-tighter animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
                        AURUM: <span className="font-light italic text-neutral-400">The Alchemist's</span> Secret
                    </h1>
                    <p className="text-neutral-300 text-sm md:text-lg font-light leading-relaxed mb-10 max-w-xl animate-slide-up opacity-0" style={{ animationDelay: '0.5s' }}>
                        Experimenta la intersección de la dermatología avanzada y el lujo puro con nuestros tratamientos restauradores infundidos con oro de 24K.
                    </p>
                    <div className="flex gap-6 animate-slide-up opacity-0" style={{ animationDelay: '0.7s' }}>
                        <button
                            onClick={() => onChangeView('SHOP')}
                            className="bg-primary text-background-dark px-10 py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-colors duration-300"
                        >
                            Entra en la Era Dorada
                        </button>
                        <button
                            onClick={() => onChangeView('SHOP')}
                            className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-10 py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/10 hover:border-white transition-all duration-300"
                        >
                            Comprar la Edición
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories Rail */}
            <section className="py-20 px-6 lg:px-12 bg-background-dark border-b border-white/5">
                <RevealOnScroll className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-2 block">Innovaciones</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Categorías Seleccionadas</h2>
                    </div>
                    <button onClick={() => onChangeView('SHOP')} className="text-xs font-bold uppercase tracking-[0.2em] text-white hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">Ver Todo</button>
                </RevealOnScroll>

                <div className="flex gap-8 overflow-x-auto hide-scrollbar pb-8">
                    {CATEGORIES.map((cat, idx) => (
                        <RevealOnScroll
                            key={cat.id}
                            delay={idx * 0.1}
                            className="flex-none w-64 group cursor-pointer"
                        >
                            <div
                                onClick={() => onChangeView('SHOP')}
                                className="w-full"
                            >
                                <div className="relative aspect-[3/4] bg-neutral-dark mb-4 overflow-hidden border border-white/5 group-hover:border-primary/50 transition-colors duration-500">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0" style={{ backgroundImage: `url(${cat.image})` }}></div>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>

                                    <div className="absolute bottom-6 left-6">
                                        <p className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">{cat.name}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">Explorar Colección</p>
                                    </div>
                                </div>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="px-6 lg:px-12 py-24">
                <RevealOnScroll className="mb-16 text-center">
                    <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Curación</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Lo Mejor de la Temporada</h2>
                </RevealOnScroll>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                    {featured.map((product, idx) => (
                        <RevealOnScroll key={product.id} delay={idx * 0.1}>
                            <div
                                className="group cursor-pointer"
                                onClick={() => onProductClick(product)}
                            >
                                <div className="relative aspect-[3/4] bg-neutral-dark mb-6 overflow-hidden">
                                    {product.isNew && (
                                        <div className="absolute top-4 left-4 bg-primary text-background-dark text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-10">Nuevo</div>
                                    )}
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 ease-out" />

                                    {/* Hover Overlay - Minimalist */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/90 to-transparent">
                                        <button className="w-full border border-white/20 text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300">
                                            Vista Rápida
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center group-hover:-translate-y-1 transition-transform duration-500">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">{product.category}</p>
                                    <p className="text-white font-light">${product.price.toFixed(2)}</p>
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