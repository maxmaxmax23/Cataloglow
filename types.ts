export interface Product {
    id: string;
    name: string;
    subtitle: string;
    price: number;
    image: string;
    category: string;
    description: string;
    benefits: string[];
    isNew?: boolean;
    isLimited?: boolean;
    volume?: string;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  
  export interface Category {
    id: string;
    name: string;
    image: string;
  }
  
  export type ViewState = 'SPLASH' | 'HOME' | 'SHOP' | 'SAVED' | 'PROFILE';