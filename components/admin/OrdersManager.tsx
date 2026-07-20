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
    status: string; // pending_approval, in_progress, completed, canceled
    createdAt: any;
    
    adminClientName?: string;
    fulfillmentType?: 'shipping' | 'pickup';
    shippingAddress?: string;
    shippingMethod?: string;
    shippingCost?: number;
    paymentMethod?: string;
    notes?: string;
}

interface OrdersManagerProps {
    products?: Product[];
}

const STATUS_COLORS: Record<string, string> = {
    'pending_approval': 'bg-orange-900/30 text-orange-400',
    'in_progress': 'bg-blue-900/30 text-blue-400',
    'completed': 'bg-green-900/30 text-green-400',
    'canceled': 'bg-red-900/30 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
    'pending_approval': 'Pending Approval',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'canceled': 'Canceled',
};

export const OrdersManager: React.FC<OrdersManagerProps> = ({ products = [] }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Left panel search
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    
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

    useEffect(() => {
        if (selectedOrder) {
            setEditingOrder(JSON.parse(JSON.stringify(selectedOrder)));
            setGeneratedReceipt(null);
        } else {
            setEditingOrder(null);
        }
    }, [selectedOrder]);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
            if (editingOrder && editingOrder.id === orderId) {
                setEditingOrder({ ...editingOrder, status: newStatus });
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleUpdateQuantity = (index: number, newQty: number) => {
        if (!editingOrder) return;
        const newItems = [...editingOrder.items];
        newItems[index].quantity = newQty;
        recalculateTotal(newItems, editingOrder.shippingCost || 0);
    };

    const handleRemoveItem = (index: number) => {
        if (!editingOrder) return;
        const newItems = [...editingOrder.items];
        newItems.splice(index, 1);
        recalculateTotal(newItems, editingOrder.shippingCost || 0);
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
        
        recalculateTotal(newItems, editingOrder.shippingCost || 0);
        setSearchTerm('');
        setIsSearching(false);
    };

    const recalculateTotal = (items: any[], shippingCost: number) => {
        if (!editingOrder) return;
        const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setEditingOrder({
            ...editingOrder,
            items,
            shippingCost,
            total: itemsTotal + (Number(shippingCost) || 0)
        });
    };

    const handleGenerateReceipt = async () => {
        if (!editingOrder) return;

        const isConfirmed = window.confirm(`Generate receipt for order ${editingOrder.orderNumber}, for a total of $${editingOrder.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}?`);
        if (!isConfirmed) return;

        setIsGenerating(true);

        try {
            // Save all edits to Firestore
            await updateDoc(doc(db, 'orders', editingOrder.id), {
                items: editingOrder.items,
                total: editingOrder.total,
                adminClientName: editingOrder.adminClientName || null,
                fulfillmentType: editingOrder.fulfillmentType || null,
                shippingAddress: editingOrder.shippingAddress || null,
                shippingMethod: editingOrder.shippingMethod || null,
                shippingCost: editingOrder.shippingCost || 0,
                paymentMethod: editingOrder.paymentMethod || null,
                notes: editingOrder.notes || null,
            });

            await new Promise(resolve => setTimeout(resolve, 500));

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
    
    const visibleOrders = orders.filter(o => 
        o.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
        o.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase())
    );

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
                
                {/* Search Bar */}
                <div className="p-3 border-b border-white/10 bg-black/20">
                    <div className="flex items-center bg-white/5 border border-white/10 px-3 py-2">
                        <span className="material-symbols-outlined text-white/40 text-sm mr-2">search</span>
                        <input
                            type="text"
                            placeholder="Search by name or order #"
                            value={orderSearchTerm}
                            onChange={(e) => setOrderSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-xs text-white outline-none w-full placeholder:text-white/30 uppercase tracking-wider"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {visibleOrders.length === 0 ? (
                        <div className="text-center py-12 text-white/30 text-xs">No matching orders.</div>
                    ) : (
                        visibleOrders.map((order) => {
                            const statusKey = order.status || 'pending_approval';
                            const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS['pending_approval'];
                            const statusLabel = STATUS_LABELS[statusKey] || 'Pending';

                            return (
                                <div 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 cursor-pointer border transition-colors ${selectedOrder?.id === order.id ? 'bg-primary/10 border-primary' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-mono text-primary">{order.orderNumber}</span>
                                        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor}`}>
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white font-medium mb-1 truncate">{order.adminClientName || order.customerName}</div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-[10px] text-white/30">{order.items?.length || 0} items</span>
                                        <span className="text-sm font-bold text-white">${order.total?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            );
                        })
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
                        {/* Header / Status Control */}
                        <div className="p-4 border-b border-white/10 bg-black/60 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-cinzel text-primary mb-1">{editingOrder.orderNumber}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase tracking-widest text-white/40">Status:</span>
                                <select 
                                    value={editingOrder.status || 'pending_approval'} 
                                    onChange={(e) => handleUpdateStatus(editingOrder.id, e.target.value)}
                                    className="bg-black border border-white/20 text-xs text-white p-2 outline-none cursor-pointer uppercase tracking-wider"
                                >
                                    <option value="pending_approval">Pending Approval</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="canceled">Canceled</option>
                                </select>
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
                                    
                                    {/* Fulfillment Panel */}
                                    <div className="bg-white/5 border border-white/10 p-4 rounded text-sm text-white">
                                        <h4 className="text-[10px] uppercase tracking-widest text-primary mb-4 font-bold border-b border-primary/20 pb-2">Fulfillment Settings</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Client Name</label>
                                                <input 
                                                    type="text" 
                                                    value={editingOrder.adminClientName !== undefined ? editingOrder.adminClientName : editingOrder.customerName}
                                                    onChange={(e) => setEditingOrder({...editingOrder, adminClientName: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 p-2 text-white outline-none focus:border-primary transition-colors"
                                                    placeholder="Name on receipt..."
                                                />
                                                {editingOrder.adminClientName !== undefined && editingOrder.adminClientName !== editingOrder.customerName && (
                                                    <p className="text-[8px] text-white/30 mt-1 uppercase">Checkout: {editingOrder.customerName}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Fulfillment Type</label>
                                                <select
                                                    value={editingOrder.fulfillmentType || 'pickup'}
                                                    onChange={(e) => setEditingOrder({...editingOrder, fulfillmentType: e.target.value as any})}
                                                    className="w-full bg-black/40 border border-white/10 p-2 text-white outline-none focus:border-primary transition-colors uppercase text-xs"
                                                >
                                                    <option value="pickup">Pick Up (Retiro)</option>
                                                    <option value="shipping">Shipping (Envío)</option>
                                                </select>
                                            </div>

                                            {editingOrder.fulfillmentType === 'shipping' && (
                                                <>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Shipping Address</label>
                                                        <input 
                                                            type="text" 
                                                            value={editingOrder.shippingAddress || ''}
                                                            onChange={(e) => setEditingOrder({...editingOrder, shippingAddress: e.target.value})}
                                                            className="w-full bg-black/40 border border-white/10 p-2 text-white outline-none focus:border-primary transition-colors"
                                                            placeholder="Full address..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Shipping Method</label>
                                                        <input 
                                                            type="text" 
                                                            value={editingOrder.shippingMethod || ''}
                                                            onChange={(e) => setEditingOrder({...editingOrder, shippingMethod: e.target.value})}
                                                            className="w-full bg-black/40 border border-white/10 p-2 text-white outline-none focus:border-primary transition-colors"
                                                            placeholder="e.g. Andreani, Moto"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Shipping Cost</label>
                                                        <div className="flex items-center bg-black/40 border border-white/10 focus-within:border-primary transition-colors">
                                                            <span className="text-white/40 px-3 text-xs">$</span>
                                                            <input 
                                                                type="number" 
                                                                value={editingOrder.shippingCost || ''}
                                                                onChange={(e) => recalculateTotal(editingOrder.items, parseFloat(e.target.value) || 0)}
                                                                className="w-full bg-transparent p-2 pl-0 text-white outline-none"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div>
                                                <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Payment Method</label>
                                                <select
                                                    value={editingOrder.paymentMethod || ''}
                                                    onChange={(e) => setEditingOrder({...editingOrder, paymentMethod: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 p-2 text-white outline-none focus:border-primary transition-colors text-xs"
                                                >
                                                    <option value="">Select Method...</option>
                                                    <option value="Transferencia">Transferencia Bancaria</option>
                                                    <option value="MercadoPago">MercadoPago</option>
                                                    <option value="Efectivo">Efectivo</option>
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[9px] uppercase tracking-widest text-white/40 mb-1">Internal Notes</label>
                                                <textarea 
                                                    value={editingOrder.notes || ''}
                                                    onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 p-2 text-white outline-none focus:border-primary transition-colors text-xs h-16 resize-none"
                                                    placeholder="Any internal notes or instructions..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

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
                                                handleAddItem({ id: 'adj_' + Date.now(), productId: 'ADJ', name: desc, description: '', subtitle: 'Adjustment', price: amount, image: '', category: 'adjustment', provider: '', cost: 0, taxRate: 0, currentInventory: 1, minStockLevel: 0, volume: '', variants: null, isVisible: true, barcodes: [], benefits: [] } as Product);
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
                            <div className="p-6 border-t border-white/10 bg-black/60 flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Final Total</p>
                                    <p className="text-2xl font-bold text-white">${editingOrder.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <button 
                                    onClick={handleGenerateReceipt}
                                    disabled={isGenerating}
                                    className={`px-8 py-4 uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-colors ${isGenerating ? 'bg-primary/50 text-black/50 cursor-wait' : 'bg-primary text-black hover:bg-white'}`}
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
                        customerName={editingOrder.adminClientName || editingOrder.customerName}
                        customerAddress={editingOrder.fulfillmentType === 'pickup' ? 'Retiro en Local' : (editingOrder.shippingAddress || 'No especificado')}
                        orderNumber={editingOrder.orderNumber}
                        shippingCost={editingOrder.shippingCost || 0}
                    />
                </div>
            )}
        </div>
    );
};
