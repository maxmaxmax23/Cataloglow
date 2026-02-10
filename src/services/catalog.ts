// src/services/catalog.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure this matches your firebase config path
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
      const items = data.items || [];

      // 3. Save to Cache
      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
      localStorage.setItem(TIMESTAMP_KEY, now.toString());

      return items;
    } else {
      console.warn("No catalog manifest found. Did you sync from GLOWAPP?");
      return [];
    }
  } catch (error) {
    console.error("Error fetching catalog:", error);
    // Fallback: Return cached data even if expired, better than crashing
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