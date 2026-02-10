// src/types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  photoURL: string;
  category: string;
  inStock: boolean;
  updatedAt?: string; // Optional, for cache validation
}

export interface CatalogManifest {
  lastSync: any;
  totalItems: number;
  items: Product[];
}