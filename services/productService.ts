import { Product } from '../src/types';
import { PRODUCTS as SEED_DATA } from '../constants';

const STORAGE_KEY = 'aura_local_inventory_v1';

/**
 * Simulates fetching products from a local database/storage.
 * Uses LocalStorage to persist changes and acts as "AsyncStorage".
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Simulate network/disk latency for a realistic async experience
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Check LocalStorage (Acting as our local database)
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("AURA: Inventory loaded from local storage.");
        return parsedData as Product[];
      } catch (e) {
        console.warn("AURA: Corrupt local storage data, resetting.");
      }
    }

    // 2. If no data exists, simulate reading from a "JSON file" (our constants)
    // and seed the local storage.
    console.log("AURA: Initializing local database from seed...");
    const initialData = SEED_DATA;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));

    return initialData;
  } catch (error) {
    console.error("AURA: Storage Service Error:", error);
    // Fallback to seed data in case of any critical failure
    return SEED_DATA;
  }
};