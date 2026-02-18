import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { generateDescription, listModels } from "../services/ai";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

import { ProductEditor } from "../../components/admin/ProductEditor";

interface AdminProps {
    products: Product[];
    onUpdateCatalog: (newProducts: Product[]) => void;
}

const Admin: React.FC<AdminProps> = ({ products, onUpdateCatalog }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Admin State
    const [apiKey, setApiKey] = useState(
        import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem("groq_api_key") || ""
    );
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthChecking(false);
        });
        return () => unsubscribe();
    }, []);

    // Initialize local state
    useEffect(() => {
        setLocalProducts(products);
    }, [products]);

    const addLog = (msg: string) => {
        setLogs((prev) => [msg, ...prev]);
    };

    // --- Actions ---

    // Editor Handlers
    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsEditorOpen(true);
    };

    const handleSaveProduct = (updatedProduct: Product) => {
        setLocalProducts(prev => {
            const exists = prev.find(p => p.id === updatedProduct.id);
            if (exists) {
                return prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            } else {
                return [updatedProduct, ...prev]; // Add new to top
            }
        });
        setHasUnsavedChanges(true); // Mark as dirty
        addLog(`Updated artifact: ${updatedProduct.name}`);
    };

    const handleDeleteProduct = (productId: string) => {
        setLocalProducts(prev => prev.filter(p => p.id !== productId));
        setHasUnsavedChanges(true);
        addLog(`Deleted artifact ID: ${productId.substring(0, 8)}...`);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            setError("Login Failed: " + error.message);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setEmail("");
        setPassword("");
    };

    const handleSaveKey = () => {
        localStorage.setItem("groq_api_key", apiKey);
        addLog("API Key saved to local storage.");
    };

    // AI Generation Logic (Kept mostly same, just restyled logs)
    const handleGenerateDescriptions = async () => {
        if (!apiKey) {
            alert("Please enter a Groq API Key first.");
            return;
        }

        setIsProcessing(true);
        addLog("Starting Auto-Generation...");

        const candidates = localProducts.filter(
            (p) => !p.description || p.description === "No description available." || p.description.length < 20
        );

        if (candidates.length === 0) {
            addLog("No products need new descriptions.");
            setIsProcessing(false);
            return;
        }

        addLog(`Found ${candidates.length} products to update.`);
        const updatedList = [...localProducts];
        let successCount = 0;

        for (let i = 0; i < candidates.length; i++) {
            const item = candidates[i];
            try {
                addLog(`Generating for: ${item.name}...`);
                const newDesc = await generateDescription(item, apiKey);
                const index = updatedList.findIndex((p) => p.id === item.id);
                if (index !== -1) {
                    updatedList[index] = { ...updatedList[index], description: newDesc };
                }
                successCount++;
                await new Promise((r) => setTimeout(r, 2000)); // Rate limit buffer
            } catch (err: any) {
                addLog(`Error on ${item.name}: ${err.message}`);
            }
        }

        setLocalProducts(updatedList);
        setHasUnsavedChanges(true);
        setIsProcessing(false);
        addLog(`Batch complete. ${successCount} updated.`);
    };

    const handleSaveToCloud = async () => {
        if (!confirm("This will overwrite the global catalog manifest. Continue?")) return;
        setIsProcessing(true);
        addLog("Saving to Firestore...");
        try {
            const docRef = doc(db, "system", "catalog_manifest");
            await setDoc(docRef, {
                lastUpdated: Date.now(),
                version: "1.0.0",
                items: localProducts
            });
            addLog("✅ Success! Catalog updated in Cloud.");
            setHasUnsavedChanges(false);
            onUpdateCatalog(localProducts);
        } catch (err: any) {
            addLog(`❌ Save failed: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePullFromCloud = async () => {
        if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard them and pull from cloud?")) return;

        setIsProcessing(true);
        addLog("Pulling from Firestore...");
        try {
            // We can re-use the App's fetch logic or generic fetch here.
            // For simplicity, we trigger a page reload which is the cleanest way to "reset" everything
            // OR we fetch manually. Let's fetch manually to stay SPA.

            // Dynamic import to avoid circular dependency issues if any, or just fetch directly
            // Since we are inside Admin, let's just use the prop if possible? 
            // Actually, App.tsx handles the initial fetch.
            // We'll require the user to refresh or we implement a fetch here.

            // Simplest:
            window.location.reload();

        } catch (err: any) {
            addLog(`Error: ${err.message}`);
            setIsProcessing(false);
        }
    };

    // Filter Logic
    const filteredProducts = localProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Renders ---

    if (isAuthChecking) {
        return <div className="min-h-screen bg-[#020202] text-primary flex items-center justify-center font-cinzel animate-pulse">AUTHENTICATING...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md p-8 border border-white/10 bg-white/5 backdrop-blur-md">
                    <h1 className="text-3xl font-cinzel text-primary mb-2 text-center">AURUM ADMIN</h1>
                    <p className="text-center text-xs tracking-[0.2em] text-white/40 mb-8 uppercase">Restricted Access</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Email Access</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-4 text-sm focus:border-primary outline-none text-white transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Security Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-4 text-sm focus:border-primary outline-none text-white transition-colors"
                                required
                            />
                        </div>
                        {error && <p className="text-red-400 text-xs text-center border border-red-900/50 bg-red-900/10 p-2">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            Enter Command Center
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans pt-24 pb-12 px-6 lg:px-12">

            {/* Header & Controls */}
            <div className="max-w-7xl mx-auto mb-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-cinzel text-white mb-2">Command Center</h1>
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">Global Catalog Management</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Logged in as</p>
                            <p className="text-sm font-bold text-white">{user.email}</p>
                        </div>
                        <button onClick={handleLogout} className="px-6 py-3 border border-red-900/50 text-red-400 hover:bg-red-900/10 text-xs uppercase tracking-widest transition-colors">
                            Disconnect
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Search */}
                    <div className="bg-white/5 border border-white/10 p-1 flex items-center">
                        <span className="material-symbols-outlined text-white/40 px-3">search</span>
                        <input
                            type="text"
                            placeholder="SEARCH SKU OR NAME..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent w-full p-3 text-sm outline-none text-white placeholder-white/20 uppercase tracking-wider"
                        />
                    </div>

                    {/* AI Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerateDescriptions}
                            disabled={isProcessing}
                            className="flex-1 bg-white/5 border border-white/10 hover:border-primary text-white/60 hover:text-white transition-all text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1 py-3"
                        >
                            <span className="material-symbols-outlined text-lg">auto_awesome</span>
                            {isProcessing ? "Processing..." : "Generate AI"}
                        </button>
                        <button
                            onClick={() => window.open("https://console.groq.com/keys", "_blank")}
                            className="px-4 border border-white/10 text-white/40 hover:text-primary transition-colors"
                            title="Get API Key"
                        >
                            <span className="material-symbols-outlined">key</span>
                        </button>
                    </div>

                    {/* Cloud Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditorOpen(true)}
                            className="flex-1 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-widest py-3 border border-white/10 hover:border-primary hover:text-primary transition-colors text-white/60"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            New
                        </button>

                        <button
                            onClick={handlePullFromCloud}
                            className="flex-1 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-widest py-3 border border-white/10 hover:border-blue-400 hover:text-blue-400 transition-colors text-white/60"
                        >
                            <span className="material-symbols-outlined text-lg">cloud_download</span>
                            Pull
                        </button>

                        <button
                            onClick={handleSaveToCloud}
                            disabled={!hasUnsavedChanges || isProcessing}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-widest py-3 border transition-colors ${hasUnsavedChanges ? 'bg-primary text-black border-primary hover:bg-white' : 'border-white/10 text-white/20 cursor-not-allowed'}`}
                        >
                            <span className="material-symbols-outlined text-lg">cloud_upload</span>
                            Push
                        </button>
                    </div>
                </div>

                {/* Console / Status */}
                {logs.length > 0 && (
                    <div className="mb-8 bg-black border border-white/10 p-4 h-32 overflow-y-auto font-mono text-[10px] text-green-500/80">
                        {logs.map((log, i) => <div key={i}>{">"} {log}</div>)}
                    </div>
                )}

                {/* DATA GRID */}
                <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">
                        <div className="col-span-1">Img</div>
                        <div className="col-span-4">Product Name</div>
                        <div className="col-span-2">Category</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-1 text-right">Stock</div>
                        <div className="col-span-2 text-center">Status</div>
                    </div>

                    {/* Table Rows */}
                    <div className="max-h-[600px] overflow-y-auto">
                        {filteredProducts.map((p) => {
                            const hasDesc = p.description && p.description !== "No description available." && p.description.length > 20;

                            return (
                                <div key={p.id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center group">
                                    {/* Image */}
                                    <div className="col-span-1">
                                        <div className="w-8 h-8 bg-white/10 overflow-hidden relative">
                                            {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                    </div>

                                    {/* Name & ID */}
                                    <div className="col-span-4 pl-2 border-l border-white/5">
                                        <div className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{p.name}</div>
                                        <div className="text-[9px] text-white/30 font-mono tracking-wider">{p.id.substring(0, 8).toUpperCase()}</div>
                                    </div>

                                    {/* Category */}
                                    <div className="col-span-2 text-[10px] uppercase tracking-wider text-white/60">
                                        {p.category}
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-2 text-right font-mono text-primary text-xs">
                                        ${p.price.toFixed(2)}
                                    </div>

                                    {/* Stock */}
                                    <div className="col-span-1 text-right text-xs text-white/60">
                                        {p.currentInventory}
                                    </div>

                                    {/* Status / Actions */}
                                    <div className="col-span-2 flex justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${hasDesc ? 'bg-green-500' : 'bg-red-500'}`} title={hasDesc ? "AI Description Ready" : "Missing Description"}></div>
                                        <div className={`w-2 h-2 rounded-full ${p.currentInventory > 5 ? 'bg-primary' : 'bg-orange-500'}`} title="Stock Status"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            {/* PRODUCT EDITOR MODAL */}
            <ProductEditor
                isOpen={isEditorOpen}
                product={editingProduct}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingProduct(null);
                }}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
                categories={Array.from(new Set(localProducts.map(p => p.category)))}
            />
        </div>
    );
};

export default Admin;
