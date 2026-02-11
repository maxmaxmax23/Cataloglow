// src/services/catalog.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Verify this path matches your project
import { Product, CatalogManifest } from "../types";

const CACHE_KEY = "catalog_cache";
const TIMESTAMP_KEY = "catalog_timestamp";
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

export const fetchCatalog = async (): Promise<Product[]> => {
  // 1. Check Local Cache (The "Zero Cost" Path)
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(TIMESTAMP_KEY);
  const now = Date.now();

  if (cachedData && cachedTime) {
    const age = now - Number(cachedTime);
    if (age < CACHE_DURATION) {
      console.log("Loading catalog from cache (0 reads)");
      return JSON.parse(cachedData);
    }
  }

  // 2. Fetch from Firestore (The "1 Read" Path)
  console.log("Cache expired or empty. Fetching from cloud...");
  try {
    const docRef = doc(db, "system", "catalog_manifest");
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as CatalogManifest;
      const rawItems = data.items || [];

      // 3. THE ADAPTER: Map GLOWAPP format -> Site UI format
      const mappedProducts: Product[] = rawItems.map((item: any) => ({
        // Identity
        id: item.id,
        productId: item.productId || item.id, // Fallback to ID if SKU missing

        // Core Info
        // Core Info
        name: item.description || item.name || "Untitled Product", // Mapped description to Title per user request
        description: item.description || "No description available.",
        provider: item.provider || "AURA",
        category: item.category || "General",

        // UI Helpers
        subtitle: item.category || "Luxury Collection", // UI needs a subtitle

        // Financials
        price: Number(item.price) || 0,
        cost: 0, // Hidden from public
        taxRate: 0.21,

        // Stock
        currentInventory: item.inStock ? 100 : 0, // Boolean to number
        minStockLevel: 5,

        // *** CRITICAL MAPPING ***
        // GLOWAPP sends 'photoURL', Site expects 'image'
        image: item.photoURL || item.image || "https://via.placeholder.com/400x400?text=No+Image",

        // Defaults for UI safety
        volume: item.volume || "Standard",
        benefits: item.benefits || ["Authentic Product", "Premium Quality"],
        barcodes: item.barcodes || [],
        variants: null,
        isNew: true
      }));

      // 4. Save mapped data to Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(mappedProducts));
      localStorage.setItem(TIMESTAMP_KEY, now.toString());

      return mappedProducts;
    } else {
      console.warn("No catalog manifest found. Did you sync from GLOWAPP?");
      return [];
    }
  } catch (error) {
    console.error("Error fetching catalog:", error);
    // Fallback: Return cached data even if expired
    if (cachedData) return JSON.parse(cachedData);
    return [];
  }
};

/**
 * Force Refresh (User pulls down to refresh)
 */
export const refreshCatalog = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
  return fetchCatalog();
};