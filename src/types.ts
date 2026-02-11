// src/types.ts

// 1. The Raw Schema (as defined in your Firestore Database)
export interface FirestoreProduct {
  id: string;             // UUID (Primary Key)
  productId: string;      // Human readable SKU (e.g. "GJ-500")
  barcodes: string[];     // Array of barcodes

  // Core Info
  name: string;           // Product Name
  description: string;    // Detailed description
  provider: string;       // Vendor Name
  category: string;       // e.g. "Cosmetics"

  // Financials
  price: number;          // Your selling price
  cost: number;           // Your acquisition cost (Private)
  taxRate: number;        // e.g. 0.21

  // Stock
  currentInventory: number; // Current physical count
  minStockLevel: number;    // Reorder point

  // Variants
  variants: {
    [variantId: string]: {
      name: string;
      priceModifier: number;
      skuSuffix: string;
    }
  } | null;

  // Optional Visual fields (Raw data might use 'photoURL' or 'image')
  image?: string;
  photoURL?: string;      // Added for compatibility with GLOWAPP sync
  benefits?: string[];
  isNew?: boolean;
  isLimited?: boolean;
  volume?: string;
}

// 2. The UI Schema (Hydrated for the Frontend)
// This guarantees that 'image' and 'subtitle' ALWAYS exist, so the UI never crashes.
export interface Product extends FirestoreProduct {
  subtitle: string;       // Mapped from category or provider
  image: string;          // Strictly required for UI (mapped from photoURL)
  benefits: string[];     // Strictly required (defaulted if missing)
}

// 3. Cart & Commerce Types
export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

// 4. App State Types
export type ViewState = 'SPLASH' | 'HOME' | 'SHOP' | 'SAVED' | 'PROFILE';

// 5. Manifest Protocol (The data shape coming from GLOWAPP)
export interface CatalogManifest {
  lastUpdated: number;
  items: Partial<FirestoreProduct>[]; // Items might be partial updates
  version: string;
}