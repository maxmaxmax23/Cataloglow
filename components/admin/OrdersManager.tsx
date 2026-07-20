import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import ReceiptTicket from '../ReceiptTicket';
import html2canvas from 'html2canvas';
import { Product } from '../../src/types';

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerAddress: string;
    items: any[];
    total: number;
    status: string;
    createdAt: any;
}

interface OrdersManagerProps {
    products?: Product[];
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ products = [] }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    
    // Receipt Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReceipt, setGeneratedReceipt] = useState<Blob | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Search state for adding items
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders: Order[] = [];
            snapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
            });
            setOrders(fetchedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Sync editing order when selected order changes
    useEffect(() => {
        if (selectedOrder) {
            setEditingOrder(JSON.parse(JSON.stringify(selectedOrder)));
            setGeneratedReceipt(null); // Reset receipt when changing orders
        } else {
            setEditingOrder(null);
        }
    }, [selectedOrder]);

    const handleUpdateQuantity = (index: number, newQty: number) => {
        if (!editingOrder) return;
        const newItems = [...editingOrder.items];
        newItems[index].quantity = newQty;
        
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setEditingOrder({
            ...editingOrder,
            items: newItems,
            total: newTotal
        });
    };

    const handleRemoveItem = (index: number) => {
        if (!editingOrder) return;
        const newItems = [...editingOrder.items];
        newItems.splice(index, 1);
        
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setEditingOrder({
            ...editingOrder,
            items: newItems,
            total: newTotal
        });
    };

    const handleAddItem = (product: Product) => {
        if (!editingOrder) return;
        
        const newItems = [...editingOrder.items];
        const existingIndex = newItems.findIndex(i => i.id === product.id);
        
        if (existingIndex >= 0) {
            newItems[existingIndex].quantity += 1;
        } else {
            newItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });
        }
        
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        setEditingOrder({
            ...editingOrder,
            items: newItems,
            total: newTotal
        });
        
        setSearchTerm('');
        setIsSearching(false);
    };

    const handleGenerateReceipt = async () => {
        if (!editingOrder) return;

                            const isConfirmed = window.confirm(`Generate receipt for order ${editingOrder.orderNumber}, for a total of $${editingOrder.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}?`);
        if (!isConfirmed) return;

        setIsGenerating(true);

        try {
            // 1. Update the order in Firestore with the modified data
            await updateDoc(doc(db, 'orders', editingOrder.id), {
                items: editingOrder.items,
                total: editingOrder.total,
                status: 'completed'
            });

            // Allow react to render the hidden receipt with new data
            await new Promise(resolve => setTimeout(resolve, 500));

            // 2. Generate the Receipt
            if (receiptRef.current) {
                const canvas = await html2canvas(receiptRef.current, {
                    backgroundColor: '#020202',
                    scale: 2,
                    useCORS: true
                });

                const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                
                if (imageBlob) {
                    setGeneratedReceipt(imageBlob);
                } else {
                    throw new Error("Failed to create image blob");
                }
            }
        } catch (error) {
            console.error("Error generating receipt", error);
            alert("Error generating receipt. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        if (!generatedReceipt) return;
        try {
            const item = new ClipboardItem({ "image/png": generatedReceipt });
            await navigator.clipboard.write([item]);
            alert("Receipt copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy image: ", err);
            alert("Failed to copy image. Your browser might not support copying images directly.");
        }
    };

    const downloadReceipt = () => {
        if (!generatedReceipt || !editingOrder) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(generatedReceipt);
        link.download = `${editingOrder.orderNumber}_receipt.png`;
        link.click();
    };

    if (loading) {
        return <div className="text-white/40 text-center py-12 text-xs uppercase tracking-widest animate-pulse">Loading Live Orders...</div>;
    }

    const filteredCatalog = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Orders List (Left Panel) */}
            <div className="w-full xl:w-1/3 border border-white/10 bg-white/5 backdrop-blur-sm h-[700px] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white">Live Orders</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[9px] uppercase tracking-widest text-green-500/80">Connected</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-white/30 text-xs">No orders yet.</div>
                    ) : (
                        orders.map((order) => (
                            <div 
                                key={order.id} 
                                onClick={() => setSelectedOrder(order)}
                                className={`p-4 cursor-pointer border transition-colors ${selectedOrder?.id === order.id ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-mono text-primary">{order.orderNumber}</span>
                                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>
                                        {order.status || 'pending'}
                                    </span>
                                </div>
                                <div className="text-sm text-white font-medium mb-1 truncate">{order.customerName}</div>
                                <div className="text-xs text-white/40 mb-2 truncate">{order.customerAddress}</div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] text-white/30">{order.items?.length || 0} items</span>
                                    <span className="text-sm font-bold text-white">${order.total?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Editable Order Manager (Right Panel) */}
            <div className="w-full xl:w-2/3 border border-white/10 bg-black/40 backdrop-blur-sm h-[700px] flex flex-col relative">
                {!editingOrder ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                        <span className="material-symbols-outlined text-4xl mb-4 opacity-50">shopping_cart_checkout</span>
                        <p className="text-xs uppercase tracking-widest">Select an order to manage</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-black/60 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-cinzel text-primary mb-1">{editingOrder.orderNumber}</h2>
                                <p className="text-xs text-white/60">{editingOrder.customerName} — {editingOrder.customerAddress}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Final Total</p>
                                <p className="text-2xl font-bold text-white">${editingOrder.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col relative">
                            {generatedReceipt ? (
                                /* Receipt Result View */
                                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                                    <div className="bg-green-900/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-full flex items-center gap-2 mb-8">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Receipt Generated Successfully
                                    </div>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={copyToClipboard}
                                            className="px-8 py-4 bg-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">content_copy</span>
                                            Copy Image
                                        </button>
                                        <button 
                                            onClick={downloadReceipt}
                                            className="px-8 py-4 border border-white/20 text-white hover:border-white transition-colors uppercase tracking-widest text-sm flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            Download
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setGeneratedReceipt(null)}
                                        className="mt-8 text-xs text-white/40 hover:text-white uppercase tracking-widest underline"
                                    >
                                        Back to editor
                                    </button>
                                </div>
                            ) : (
                                /* Editor View */
                                <div className="space-y-6">
                                    {/* Editable Items Table */}
                                    <div className="border border-white/10 bg-white/5 rounded overflow-hidden">
                                        <div className="grid grid-cols-12 gap-4 p-3 border-b border-white/10 text-[9px] uppercase tracking-widest text-white/40 bg-black/40">
                                            <div className="col-span-1">Img</div>
                                            <div className="col-span-5">Product</div>
                                            <div className="col-span-2 text-right">Unit Price</div>
                                            <div className="col-span-2 text-center">Qty</div>
                                            <div className="col-span-2 text-right">Subtotal</div>
                                        </div>
                                        
                                        {editingOrder.items.map((item, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-4 p-3 border-b border-white/5 items-center hover:bg-white/5 transition-colors">
                                                <div className="col-span-1 relative group">
                                                    <div className="w-8 h-8 bg-white/10 relative z-10 cursor-pointer">
                                                        {item.image ? (
                                                            <>
                                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                                <div className="absolute top-0 left-full ml-2 w-48 h-48 bg-black border border-white/20 shadow-2xl hidden group-hover:block z-50">
                                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                                                                <span className="material-symbols-outlined text-sm">receipt_long</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-5">
                                                    <div className="text-sm text-white font-medium truncate">{item.name}</div>
                                                    <div className="text-[9px] font-mono text-white/30">{item.id?.substring(0,8).toUpperCase()}</div>
                                                </div>
                                                <div className="col-span-2 text-right text-xs font-mono text-white/60">
                                                    ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="col-span-2 flex justify-center items-center gap-2">
                                                    <button onClick={() => handleUpdateQuantity(idx, Math.max(1, item.quantity - 1))} className="text-white/40 hover:text-white">-</button>
                                                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(idx, item.quantity + 1)} className="text-white/40 hover:text-white">+</button>
                                                </div>
                                                <div className="col-span-2 flex justify-end items-center gap-3">
                                                    <span className="text-sm font-bold text-primary">${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                    <button onClick={() => handleRemoveItem(idx)} className="text-red-500/50 hover:text-red-400 material-symbols-outlined text-sm">delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Item / Discount Tool */}
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsSearching(!isSearching)}
                                                className="text-[10px] uppercase tracking-widest text-primary hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                                Add Item / Swap
                                            </button>

                                        {isSearching && (
                                            <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-black border border-white/20 shadow-2xl z-20">
                                                <div className="p-2 border-b border-white/10">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search catalog..." 
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full bg-white/5 p-2 text-sm text-white outline-none"
                                                    />
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    {filteredCatalog.map(p => (
                                                        <div 
                                                            key={p.id} 
                                                            onClick={() => handleAddItem(p)}
                                                            className="p-3 hover:bg-white/10 cursor-pointer flex justify-between items-center border-b border-white/5"
                                                        >
                                                            <div>
                                                                <div className="text-sm text-white">{p.name}</div>
                                                                <div className="text-xs text-white/40">{p.id.substring(0,8)}</div>
                                                            </div>
                                                            <div className="text-primary font-bold">${p.price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                        </div>
                                                    ))}
                                                    {filteredCatalog.length === 0 && <div className="p-4 text-xs text-white/40 text-center">No products found</div>}
                                                </div>
                                            </div>
                                        )}
                                        </div>

                                        <button 
                                            onClick={() => {
                                                const desc = window.prompt("Description (e.g. 'Discount 10%' or 'Markup')");
                                                if (!desc) return;
                                                const amountStr = window.prompt("Amount in numbers (use negative for discount, e.g. -500)");
                                                if (!amountStr) return;
                                                const amount = parseFloat(amountStr);
                                                if (isNaN(amount)) {
                                                    alert("Invalid amount");
                                                    return;
                                                }
                                                handleAddItem({ id: 'adj_' + Date.now(), name: desc, price: amount, image: '', category: 'adjustment', provider: '', cost: 0, taxRate: 0, currentInventory: 1, minStockLevel: 0, volume: 0, isVisible: true, barcodes: [] });
                                            }}
                                            className="text-[10px] uppercase tracking-widest text-orange-400 hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">sell</span>
                                            Add Custom Adj.
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        {!generatedReceipt && (
                            <div className="p-6 border-t border-white/10 bg-black/60">
                                <button 
                                    onClick={handleGenerateReceipt}
                                    disabled={isGenerating}
                                    className={`w-full py-4 uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${isGenerating ? 'bg-primary/50 text-black/50 cursor-wait' : 'bg-primary text-black hover:bg-white'}`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">receipt_long</span>
                                            Generate Receipt
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Hidden component exclusively for html2canvas generation */}
            {editingOrder && (
                <div className="absolute inset-0 opacity-0 pointer-events-none -z-50 overflow-hidden">
                    <ReceiptTicket
                        ref={receiptRef}
                        items={editingOrder.items}
                        total={editingOrder.total}
                        customerName={editingOrder.customerName}
                        customerAddress={editingOrder.customerAddress}
                        orderNumber={editingOrder.orderNumber}
                    />
                </div>
            )}
        </div>
    );
};
