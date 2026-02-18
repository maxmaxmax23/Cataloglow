import { doc, runTransaction } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Generates the next sequential order number (e.g., "AURUM-0042")
 * Uses Firebase Transactions to ensure atomic increments (safe for concurrent users).
 */
export const generateOrderNumber = async (): Promise<string> => {
    const statsRef = doc(db, "system", "stats");

    try {
        const newOrderNumber = await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsRef);

            let currentCount = 0;
            if (statsDoc.exists()) {
                currentCount = statsDoc.data().totalOrders || 0;
            }

            const nextCount = currentCount + 1;

            // Commit the update
            transaction.set(statsRef, { totalOrders: nextCount }, { merge: true });

            return nextCount;
        });

        // Format: AURUM-{0000}
        return `AURUM-${newOrderNumber.toString().padStart(4, '0')}`;

    } catch (error) {
        console.error("Error generating order number:", error);
        // Fallback to timestamp if offline/error to prevent blocking the sale
        return `OFFLINE-${Date.now().toString().slice(-6)}`;
    }
};
