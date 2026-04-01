import React, { forwardRef } from 'react';
import { CartItem } from '../src/types';
import { useCms } from '../src/hooks/useCMS';

interface ReceiptTicketProps {
    items: CartItem[];
    total: number;
    customerName: string;
    customerAddress: string;
    orderNumber?: string;
}

const ReceiptTicket = forwardRef<HTMLDivElement, ReceiptTicketProps>(({ items, total, customerName, customerAddress, orderNumber }, ref) => {
    const date = new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div ref={ref} className="bg-[#020202] text-white p-8 w-[400px] border border-primary/20 font-sans relative overflow-hidden" style={{ borderRadius: '0px' }}>
            {/* Background Texture */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="mb-6 text-center">
                    <span className="material-icons text-4xl text-primary mb-2">flare</span>
                    <h1 className="text-3xl font-extrabold tracking-[0.3em] uppercase text-primary">{useCms('receipt.header.title', 'AURUM')}</h1>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 mt-1">{useCms('receipt.header.subtitle', 'Lujo Redefinido')}</p>
                    {orderNumber && (
                        <div className="mt-2 border border-white/10 bg-white/5 py-1 px-3 inline-block rounded">
                            <p className="text-[10px] font-mono tracking-widest text-primary">{orderNumber}</p>
                        </div>
                    )}
                </div>

                <div className="w-full border-b border-primary/20 border-dashed mb-6"></div>

                {/* Customer Details */}
                <div className="w-full mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">{useCms('receipt.details.client', 'Cliente')}</span>
                        <span className="text-xs font-bold text-white uppercase">{customerName}</span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">{useCms('receipt.details.destination', 'Destino')}</span>
                        <span className="text-xs font-bold text-white uppercase text-right leading-tight max-w-[200px] break-words">{customerAddress}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">{useCms('receipt.details.date', 'Fecha')}</span>
                        <span className="text-xs font-mono text-primary/80">{date}</span>
                    </div>
                </div>

                <div className="w-full border-b border-white/10 mb-6"></div>

                {/* Items List */}
                <div className="w-full space-y-3 mb-6">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-xs group">
                            <div className="flex gap-3">
                                <span className="text-primary font-mono pt-0.5">{item.quantity}x</span>
                                <div className="flex flex-col">
                                    <span className="text-white/90 uppercase tracking-wide font-bold">{item.name}</span>
                                    <span className="text-[9px] text-white/30 tracking-wider font-mono">{useCms('receipt.details.idLabel', 'ID:')} {item.id.substring(0, 8).toUpperCase()}</span>
                                </div>
                            </div>
                            <span className="text-white font-mono pt-0.5">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full border-b border-primary/20 border-dashed mb-6"></div>

                {/* Total */}
                <div className="w-full flex justify-between items-center mb-8">
                    <span className="text-sm uppercase tracking-[0.2em] text-white">{useCms('receipt.summary.total', 'Total Final')}</span>
                    <span className="text-2xl font-bold text-primary font-mono">${total.toFixed(2)}</span>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/30 mb-2">{useCms('receipt.footer.thankYou', 'Gracias por su preferencia')}</p>
                    <div className="w-24 h-8 bg-white/5 mx-auto rounded flex items-center justify-center border border-white/10">
                        <span className="text-[6px] tracking-widest text-white/20">{useCms('receipt.footer.brand', 'AURUM AUTHENTIC')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

ReceiptTicket.displayName = 'ReceiptTicket';

export default ReceiptTicket;
