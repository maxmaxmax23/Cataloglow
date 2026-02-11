import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { generateDescription, listModels } from "../services/ai";
// ... imports

// ... inside Admin component ...


// ... inside the handleSaveKey function or near it ...
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AdminProps {
    products: Product[]; // Passed from App.tsx (source of truth)
    onUpdateCatalog: (newProducts: Product[]) => void; // Callback to update App state
}

const Admin: React.FC<AdminProps> = ({ products, onUpdateCatalog }) => {
    const [apiKey, setApiKey] = useState(
        localStorage.getItem("gemini_api_key") || ""
    );
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Initialize local state from props
    useEffect(() => {
        setLocalProducts(products);
    }, [products]);

    const addLog = (msg: string) => {
        setLogs((prev) => [msg, ...prev]);
    };

    const handleSaveKey = () => {
        localStorage.setItem("gemini_api_key", apiKey);
        addLog("API Key saved to local storage.");
    };

    const handleCheckModels = async () => {
        if (!apiKey) {
            alert("Enter API Key first.");
            return;
        }
        addLog("Checking available models for this key...");
        try {
            const models = await listModels(apiKey);
            addLog("--- AVAILABLE MODELS ---");
            models.forEach(m => addLog(m));
            addLog("------------------------");
            addLog("If you see 'models/gemini-1.5-flash', it should work.");
        } catch (err: any) {
            addLog(`Error listing models: ${err.message}`);
        }
    };

    // 1. GENERATE DESCRIPTIONS
    const handleGenerateDescriptions = async () => {
        if (!apiKey) {
            alert("Please enter a Gemini API Key first.");
            return;
        }

        setIsProcessing(true);
        addLog("Starting Auto-Generation...");

        // Find candidates (Skip Logic: Ignore if description exists and isn't the default)
        const candidates = localProducts.filter(
            (p) =>
                !p.description ||
                p.description === "No description available." ||
                p.description.length < 20
        );

        if (candidates.length === 0) {
            addLog("No products need new descriptions.");
            setIsProcessing(false);
            return;
        }

        addLog(`Found ${candidates.length} products to update.`);

        const updatedList = [...localProducts];
        let successCount = 0;

        // Process sequentially to be nice to the API rate limit
        // Process sequentially
        for (let i = 0; i < candidates.length; i++) {
            const item = candidates[i];
            let retries = 0;
            let success = false;

            while (!success && retries < 3) {
                try {
                    addLog(`Generating for: ${item.name}... (Attempt ${retries + 1})`);
                    const newDesc = await generateDescription(item, apiKey);

                    // Update local list
                    const index = updatedList.findIndex((p) => p.id === item.id);
                    if (index !== -1) {
                        updatedList[index] = { ...updatedList[index], description: newDesc };
                    }

                    successCount++;
                    success = true;

                    // Standard friendly delay between successful requests
                    await new Promise((r) => setTimeout(r, 2000));

                } catch (err: any) {
                    const message = err.message || "";
                    addLog(`Error on ${item.name}: ${message}`);

                    // Regex to find "retry in X.XXs" or similar
                    // Example: "Please retry in 10.327166026s."
                    const match = message.match(/retry in (\d+(\.\d+)?)s/i);

                    if (match) {
                        const waitSeconds = parseFloat(match[1]);
                        const waitMs = (waitSeconds + 1) * 1000; // Found time + 1 second buffer
                        addLog(`⚠️ Rate Limit Hit. Waiting ${Math.ceil(waitMs / 1000)}s before retrying...`);
                        await new Promise((r) => setTimeout(r, waitMs));
                        retries++; // Count as a retry
                    } else if (message.includes("429") || message.includes("Quota")) {
                        // Fallback for generic 429 without specific time
                        addLog(`⚠️ Generic Rate Limit. Waiting 60s...`);
                        await new Promise((r) => setTimeout(r, 60000));
                        retries++;
                    } else {
                        // Fatal error (bad request, etc), skip this item
                        addLog("Skipping item due to non-retriable error.");
                        break;
                    }
                }
            }
        }

        setLocalProducts(updatedList);
        setHasUnsavedChanges(true); // Mark as dirty
        setIsProcessing(false);
        addLog(`batch complete. ${successCount} updated. Don't forget to SAVE TO CLOUD.`);
    };

    // 2. SAVE TO CLOUD (Single Write)
    const handleSaveToCloud = async () => {
        if (!confirm("This will overwrite the global catalog manifest. Continue?")) return;

        setIsProcessing(true);
        addLog("Saving to Firestore...");

        try {
            const docRef = doc(db, "system", "catalog_manifest");

            // We need to match the CatalogManifest structure
            // NOTE: We are converting the UI 'Product' type back to the raw storage format if needed,
            // but since 'Product' is compatible/superset, we just need to ensure we strip UI-only derived fields if strictly necessary.
            // For now, saving the full object is strictly mapped in catalog.ts anyway when reading.
            // However, to be safe and clean, let's keep the data structure consistent.

            const payload = {
                lastUpdated: Date.now(),
                version: "1.0.0",
                items: localProducts // Saving the fully hydrated objects
            };

            await setDoc(docRef, payload);

            addLog("✅ Success! Catalog updated in Cloud.");
            setHasUnsavedChanges(false);
            onUpdateCatalog(localProducts); // Sync back to main App
        } catch (err: any) {
            console.error(err);
            addLog(`❌ Save failed: ${err.message}`);
            alert("Failed to save to cloud. Check console.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-8 pb-32 min-h-screen bg-neutral-900 text-white font-sans">
            <h1 className="text-3xl font-light mb-8 tracking-widest uppercase border-b border-white/10 pb-4">
                Catalog Admin
            </h1>

            {/* API Key Section */}
            <div className="mb-8 bg-white/5 p-6 rounded-lg border border-white/10">
                <label className="block text-xs uppercase tracking-widest mb-2 text-primary">
                    Gemini API Key
                </label>
                <div className="flex gap-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1 bg-black/50 border border-white/20 p-3 rounded text-sm focus:border-primary outline-none transition-colors"
                        placeholder="Paste your key here..."
                    />
                    <button
                        onClick={handleSaveKey}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded text-xs uppercase tracking-wider transition-colors"
                    >
                        Save Key
                    </button>
                    <button
                        onClick={handleCheckModels}
                        className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded text-xs uppercase tracking-wider transition-colors"
                    >
                        Check Connection
                    </button>
                </div>
                <p className="mt-2 text-[10px] text-white/40">
                    Key is stored locally in your browser. Get one at aistudio.google.com (Free).
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={handleGenerateDescriptions}
                    disabled={isProcessing}
                    className={`flex-1 py-4 rounded text-sm uppercase tracking-widest transition-all ${isProcessing
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-primary text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        }`}
                >
                    {isProcessing ? "Processing..." : "✨ Magic Auto-Fill Descriptions"}
                </button>

                <button
                    onClick={handleSaveToCloud}
                    disabled={!hasUnsavedChanges || isProcessing}
                    className={`flex-1 py-4 rounded text-sm uppercase tracking-widest transition-all border ${hasUnsavedChanges
                        ? "border-green-500 text-green-400 hover:bg-green-500/10 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                        : "border-white/10 text-white/20 cursor-not-allowed"
                        }`}
                >
                    Save to Cloud
                </button>
            </div>

            {/* Console Logs */}
            <div className="mb-8 bg-black p-4 rounded-lg font-mono text-xs text-green-400 h-48 overflow-y-auto border border-white/10 shadow-inner">
                {logs.length === 0 && <span className="text-white/20">// System ready...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-1">
                        {">"} {log}
                    </div>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localProducts.map((p) => {
                    const isMissing = !p.description || p.description === "No description available.";
                    return (
                        <div
                            key={p.id}
                            className={`p-4 rounded border transition-colors ${isMissing ? "bg-red-900/10 border-red-500/30" : "bg-white/5 border-white/10"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-sm">{p.name}</h3>
                                <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded">
                                    {p.category}
                                </span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed min-h-[40px]">
                                {p.description || "No description available."}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Admin;
