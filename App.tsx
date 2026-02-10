import React, { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import { TopNav, BottomNav } from './components/Navigation';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutForm from './components/CheckoutForm';
import { CartItem, Product, ViewState } from './types';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [animateCart, setAnimateCart] = useState(false);

  const triggerCartAnimation = () => {
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 500);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    
    // Trigger visual feedback
    triggerCartAnimation();
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.08; // including tax

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Top Nav is shared and fixed */}
      <TopNav 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        onCartClick={() => setIsCartOpen(true)}
        animateCart={animateCart}
      />

      {/* Main Content Area - Each view is a cached scrollable container */}
      <main className="absolute inset-0 top-0 w-full h-full">
        {/* Home View Container */}
        <div 
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-opacity duration-500 ease-in-out ${
                view === 'HOME' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
        >
            <HomeView 
                onProductClick={setSelectedProduct} 
                onChangeView={setView}
            />
            {/* Spacer for bottom nav */}
            <div className="h-24"></div>
        </div>

        {/* Shop View Container */}
        <div 
            className={`absolute inset-0 overflow-y-auto hide-scrollbar transition-opacity duration-500 ease-in-out ${
                view === 'SHOP' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
        >
            <ShopView 
                onProductClick={setSelectedProduct} 
                onAddToCart={addToCart}
            />
            {/* Spacer for bottom nav */}
            <div className="h-24"></div>
        </div>

        {/* Saved View Placeholder */}
        <div 
            className={`absolute inset-0 overflow-y-auto hide-scrollbar flex items-center justify-center transition-opacity duration-500 ease-in-out ${
                view === 'SAVED' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
        >
             <div className="text-white/40 flex flex-col items-center">
                <span className="material-icons text-6xl mb-4 text-primary/20 animate-float">favorite_border</span>
                <p className="uppercase tracking-[0.2em] text-sm">Wishlist Empty</p>
                <button 
                  onClick={() => setView('SHOP')} 
                  className="mt-8 text-primary border-b border-primary text-xs uppercase tracking-widest pb-1 hover:text-white hover:border-white transition-colors"
                >
                  Discover Products
                </button>
            </div>
        </div>

         {/* Profile View Placeholder */}
         <div 
            className={`absolute inset-0 overflow-y-auto hide-scrollbar flex items-center justify-center transition-opacity duration-500 ease-in-out ${
                view === 'PROFILE' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
        >
             <div className="text-white/40 flex flex-col items-center">
                <span className="material-icons text-6xl mb-4 text-primary/20 animate-float">person_outline</span>
                <p className="uppercase tracking-[0.2em] text-sm">Sign In to AURA</p>
            </div>
        </div>

      </main>

      <BottomNav currentView={view} onChangeView={setView} />

      {/* Modals & Drawers - Outside of main scroll area */}
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={addToCart}
      />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
        }}
      />

      {isCheckoutOpen && (
        <CheckoutForm 
            items={cart} 
            total={cartTotal} 
            onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}

export default App;