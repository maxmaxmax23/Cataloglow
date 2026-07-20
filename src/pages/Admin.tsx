import React, { useState, useEffect } from "react";
import { Product } from "../types";

import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

import { ProductEditor } from "../../components/admin/ProductEditor";
import { CMSManager } from "../../components/admin/CMSManager";
import { OrdersManager } from "../../components/admin/OrdersManager";

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

    // Admin State & Tabs
    const [activeTab, setActiveTab] = useState<'catalog' | 'cms' | 'orders'>('catalog');

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



    const handleSaveToCloud = async () => {
        if (!confirm("This will push your edits and overrides to the cloud. Continue?")) return;
        setIsProcessing(true);
        addLog("Saving metadata to Firestore...");
        try {
            const docRef = doc(db, "system", "catalog_metadata");

            // Extract all fields to maintain them as overrides or custom creations
            const metadataObj: Record<string, any> = {};
            localProducts.forEach(p => {
                metadataObj[p.id] = {
                    name: p.name,
                    description: p.description,
                    provider: p.provider,
                    category: p.category,
                    price: p.price,
                    cost: p.cost,
                    taxRate: p.taxRate,
                    currentInventory: p.currentInventory,
                    minStockLevel: p.minStockLevel,
                    image: p.image,
                    volume: p.volume,
                    benefits: p.benefits,
                    barcodes: p.barcodes,
                    variants: p.variants || null,
                    isVisible: p.isVisible !== false // Default true
                };
            });

            await setDoc(docRef, metadataObj);

            addLog("✅ Success! Metadata overrides updated in Cloud.");
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
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">Global Management</p>
                    </div>
                    {/* Tab Switcher */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className={`px-8 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'catalog' ? 'bg-primary text-black' : 'border border-white/10 text-white/40 hover:text-white'}`}
                        >
                            Catalog
                        </button>
                        <button
                            onClick={() => setActiveTab('cms')}
                            className={`px-8 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'cms' ? 'bg-primary text-black' : 'border border-white/10 text-white/40 hover:text-white'}`}
                        >
                            Content CMS
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-8 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${activeTab === 'orders' ? 'bg-primary text-black' : 'border border-white/10 text-white/40 hover:text-white'}`}
                        >
                            Live Orders
                        </button>
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

                {activeTab === 'cms' ? (
                    <CMSManager addLog={addLog} />
                ) : activeTab === 'orders' ? (
                    <OrdersManager products={localProducts} />
                ) : (
                    <>
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
                                    Discard Drafts
                                </button>

                                <button
                                    onClick={handleSaveToCloud}
                                    disabled={!hasUnsavedChanges || isProcessing}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-widest py-3 border transition-colors ${hasUnsavedChanges ? 'bg-primary text-black border-primary hover:bg-white' : 'border-white/10 text-white/20 cursor-not-allowed'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                                    Publish Live
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


                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleEditProduct(p)}
                                            className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center group cursor-pointer"
                                        >
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
                                            <div className="col-span-2 flex justify-center items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const updatedProduct = { ...p, isVisible: p.isVisible === false ? true : false };
                                                        handleSaveProduct(updatedProduct);
                                                    }}
                                                    className={`material-symbols-outlined text-sm hover:scale-110 transition-all ${p.isVisible !== false ? 'text-white/40 hover:text-white' : 'text-red-500 hover:text-red-400'}`}
                                                    title={p.isVisible !== false ? "Visible (Click to hide)" : "Hidden (Click to show)"}
                                                >
                                                    {p.isVisible !== false ? 'visibility' : 'visibility_off'}
                                                </button>

                                                <span className={`material-symbols-outlined text-[12px] ${p.currentInventory > 5 ? 'text-primary' : 'text-orange-500'}`} title="Stock Status">
                                                    inventory_2
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
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
