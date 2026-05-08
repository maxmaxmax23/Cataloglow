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
    const manifestRef = doc(db, "system", "catalog_manifest");
    const metadataRef = doc(db, "system", "catalog_metadata");
    
    // Fetch both in parallel
    const [manifestSnap, metadataSnap] = await Promise.all([
      getDoc(manifestRef),
      getDoc(metadataRef)
    ]);

    if (manifestSnap.exists()) {
      const data = manifestSnap.data() as CatalogManifest;
      const rawItems = data.items || [];
      const metadata = metadataSnap.exists() ? metadataSnap.data() : {};

      // 3. THE ADAPTER: Map GLOWAPP format -> Site UI format
      const mappedProducts: Product[] = rawItems.map((item: any) => {
        const itemMeta = metadata[item.id] || {};
        
        return {
          // Identity
          id: item.id,
          productId: item.productId || item.id, // Fallback to ID if SKU missing

          // Core Info
          name: itemMeta.name || item.description || item.name || "Untitled Product",
          description: itemMeta.description || item.description || "No description available.",
          provider: item.provider || "AURA",
          category: itemMeta.category || item.category || "General",

          // UI Helpers
          subtitle: itemMeta.category || item.category || "Luxury Collection", // UI needs a subtitle

          // Financials
          price: itemMeta.price !== undefined ? itemMeta.price : (Number(item.price) || 0),
          cost: 0, // Hidden from public
          taxRate: 0.21,

          // Stock
          currentInventory: itemMeta.currentInventory !== undefined ? itemMeta.currentInventory : (item.inStock ? 100 : 0),
          minStockLevel: 5,

          // *** CRITICAL MAPPING ***
          image: itemMeta.image || item.photoURL || item.image || "https://via.placeholder.com/400x400?text=No+Image",

          // Defaults for UI safety
          volume: itemMeta.volume || item.volume || "Standard",
          benefits: itemMeta.benefits || item.benefits || ["Authentic Product", "Premium Quality"],
          barcodes: item.barcodes || [],
          variants: itemMeta.variants || item.variants || null,
          isNew: true,
          isVisible: itemMeta.isVisible !== false // Default to true
        };
      });

      // Append manually created products that exist in metadata but not in the raw manifest
      const rawIds = new Set(rawItems.map((item: any) => item.id));
      Object.keys(metadata).forEach(metaId => {
        if (!rawIds.has(metaId)) {
          const itemMeta = metadata[metaId];
          mappedProducts.push({
            id: metaId,
            productId: itemMeta.productId || metaId,
            name: itemMeta.name || "Untitled Product",
            description: itemMeta.description || "No description available.",
            provider: itemMeta.provider || "AURA",
            category: itemMeta.category || "General",
            subtitle: itemMeta.category || "Luxury Collection",
            price: itemMeta.price || 0,
            cost: itemMeta.cost || 0,
            taxRate: itemMeta.taxRate || 0.21,
            currentInventory: itemMeta.currentInventory || 0,
            minStockLevel: itemMeta.minStockLevel || 5,
            image: itemMeta.image || "https://via.placeholder.com/400x400?text=No+Image",
            volume: itemMeta.volume || "Standard",
            benefits: itemMeta.benefits || ["Authentic Product", "Premium Quality"],
            barcodes: itemMeta.barcodes || [],
            variants: itemMeta.variants || null,
            isNew: true,
            isVisible: itemMeta.isVisible !== false
          });
        }
      });

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