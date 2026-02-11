// The Schema defined in the Database
export interface FirestoreProduct {
  id: string;               // UUID (Primary Key)
  productId: string;        // Human readable SKU (e.g. "GJ-500")
  barcodes: string[];       // Array of barcodes

  // Core Info
  name: string;             // Product Name
  description: string;      // Detailed description
  provider: string;         // Vendor Name
  category: string;         // e.g. "Cosmetics"

  // Financials
  price: number;            // Your selling price
  cost: number;             // Your acquisition cost
  taxRate: number;          // e.g. 0.21

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

  // Optional Visual fields (if you extend your DB later, or we map them)
  image?: string;
  benefits?: string[];
  isNew?: boolean;
  isLimited?: boolean;
  volume?: string;
}

// The Schema used by the UI (extended from Firestore to ensure visual fidelity)
export interface Product extends FirestoreProduct {
  subtitle: string;       // Mapped from productId or provider
  image: string;          // Mapped or Defaulted
  benefits: string[];     // Mapped or Defaulted
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

export interface CatalogManifest {
  lastUpdated: number;
  items: Product[];
  version: string;
}