import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase';
import ReceiptTicket from '../ReceiptTicket';

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

export const OrdersManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
        } catch (error) {
            console.error("Error updating order status", error);
        }
    };

    if (loading) {
        return <div className="text-white/40 text-center py-12 text-xs uppercase tracking-widest animate-pulse">Loading Live Orders...</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Orders List */}
            <div className="w-full lg:w-1/3 border border-white/10 bg-white/5 backdrop-blur-sm h-[600px] flex flex-col">
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
                                    <span className="text-sm font-bold text-white">${order.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Receipt Viewer */}
            <div className="w-full lg:w-2/3 border border-white/10 bg-black/40 backdrop-blur-sm h-[600px] flex flex-col items-center justify-center p-8 overflow-y-auto relative">
                {selectedOrder ? (
                    <div className="animate-fade-in w-full flex flex-col items-center">
                        <div className="w-full flex justify-end gap-2 mb-4">
                            {selectedOrder.status !== 'completed' && (
                                <button 
                                    onClick={() => updateStatus(selectedOrder.id, 'completed')}
                                    className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 text-xs uppercase tracking-widest transition-colors"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </div>
                        {/* Render the actual Receipt Ticket component */}
                        <div className="shadow-[0_0_50px_rgba(242,185,13,0.1)]">
                            <ReceiptTicket
                                items={selectedOrder.items || []}
                                total={selectedOrder.total || 0}
                                customerName={selectedOrder.customerName || 'Unknown'}
                                customerAddress={selectedOrder.customerAddress || 'Unknown'}
                                orderNumber={selectedOrder.orderNumber || ''}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-white/20">
                        <span className="material-symbols-outlined text-4xl mb-4 opacity-50">receipt_long</span>
                        <p className="text-xs uppercase tracking-widest">Select an order to view receipt</p>
                    </div>
                )}
            </div>
        </div>
    );
};
