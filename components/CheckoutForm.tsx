import React, { useState, useRef } from 'react';
import { CartItem } from '../src/types';
import html2canvas from 'html2canvas';
import ReceiptTicket from './ReceiptTicket';
import { generateOrderNumber } from '../src/services/orders';

interface CheckoutFormProps {
    items: CartItem[];
    total: number;
    onClose: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ items, total, onClose }) => {
    const [name, setName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentOrderNumber, setCurrentOrderNumber] = useState('');
    const receiptRef = useRef<HTMLDivElement>(null);

    const handleWhatsapp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !customerAddress) return;

        setIsGenerating(true);

        try {
            // 1. Generate Order Number
            const orderNum = await generateOrderNumber();
            setCurrentOrderNumber(orderNum);

            // Wait for state update and render (critical for html2canvas to see the number)
            await new Promise(resolve => setTimeout(resolve, 500));

            // 2. Generate Image from Receipt Component
            if (receiptRef.current) {
                // Ensure images are loaded before capture
                const images = Array.from(receiptRef.current.querySelectorAll('img'));
                await Promise.all(images.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve; // Continue even if error
                    });
                }));

                // Small delay to ensure rendering is complete
                await new Promise(resolve => setTimeout(resolve, 100));

                const canvas = await html2canvas(receiptRef.current, {
                    backgroundColor: '#000000',
                    scale: 2,
                    useCORS: true,
                    logging: true, // Enable logging to debug
                    allowTaint: true, // Allow cross-origin images if needed locally
                });

                const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

                if (imageBlob) {
                    const file = new File([imageBlob], "aurum_receipt.png", { type: "image/png" });

                    // 3. Try Native Share (Mobile)
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'Su Recibo AURUM',
                            text: `Hola ${name}, aquí tiene el detalle de su pedido.`
                        });
                    } else {
                        // 4. Fallback: Download Image & Open WhatsApp Web
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(imageBlob);
                        link.download = 'aurum_receipt.png';
                        link.click();

                        // Wait a moment for download to start before redirecting
                        setTimeout(() => {
                            const itemList = items.map(i => `• ${i.name} (x${i.quantity})`).join('\n');
                            const message = `Hola, envío adjunto el comprobante de mi pedido:\n\n${itemList}\n\nTotal: $${total.toFixed(2)}\n\nMis Datos:\nNombre: ${name}\nZona: ${customerAddress}\nNúmero de Pedido: ${orderNum}`;
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                            window.open(whatsappUrl, '_blank');
                        }, 1000);
                    }
                }
            }
        } catch (error) {
            console.error("Error generating receipt:", error);
            // Fallback to text only if image fails
            const itemList = items.map(i => `• ${i.name} (x${i.quantity})`).join('\n');
            const message = `Hola, me gustaría realizar un pedido:\n\n${itemList}\n\nTotal: $${total.toFixed(2)}\n\nDatos:\n${name}\n${customerAddress}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-background-dark border border-primary/30 rounded-xl p-1 overflow-hidden shadow-[0_0_50px_rgba(242,185,13,0.1)] animate-fade-in">
                <div className="relative z-10 p-8 md:p-10 flex flex-col min-h-[500px]"
                    style={{
                        backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD0kTKo9_sOFSSO9SYdhK4g-mGmAF2FiSxC_RLg-bGHuwYHDQMZGR9j4GP8o5wYWILMGjNZVnLdjX6-zQHkAw0BTWoxE9TQroTpvEAhcePjJTmR0WiUOrFmZudTs6mn4mbDpmUGg9pQeMiVUzYWqgk0bnU-7N_-xv_gQWwzyDHCqfeWHZRgONrQebxa2bXxbang70PHKJfn_xr2TflEdgW2K_Ji8GyUpbBKd-JTaCdBAbO3Qg30IHrUiIMjy6M_EdjKfFgGok8QSP")',
                        backgroundSize: 'cover',
                        backgroundBlendMode: 'overlay',
                        backgroundColor: 'rgba(0,0,0,0.85)'
                    }}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white">
                        <span className="material-icons">close</span>
                    </button>

                    <header className="text-center mb-10">
                        <div className="inline-block mb-4">
                            <span className="material-icons text-primary text-4xl">auto_fix_high</span>
                        </div>
                        <h2 className="text-2xl text-white font-light tracking-[0.15em] uppercase mb-2">Finalizar Compra</h2>
                        <div className="h-px w-12 bg-primary mx-auto mb-6"></div>
                        <p className="text-white/40 text-xs font-light">Ingresa tus datos para generar tu recibo digital de lujo.</p>
                    </header>

                    <form onSubmit={handleWhatsapp} className="flex-grow space-y-6">
                        <div className="group">
                            <label htmlFor="name" className="block text-primary text-[10px] uppercase tracking-[0.15em] mb-2 font-bold">Nombre Completo</label>
                            <div className="border border-primary/30 rounded overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(242,185,13,0.2)] transition-all">
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ej. Arabella Sterling"
                                    className="w-full bg-black/40 border-none text-white px-4 py-3 focus:ring-0 placeholder:text-white/20 font-light text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label htmlFor="area" className="block text-primary text-[10px] uppercase tracking-[0.15em] mb-2 font-bold">Zona de Entrega</label>
                            <div className="border border-primary/30 rounded overflow-hidden focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(242,185,13,0.2)] transition-all">
                                <input
                                    id="area"
                                    type="text"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="ej. Palermo, Buenos Aires"
                                    className="w-full bg-black/40 border-none text-white px-4 py-3 focus:ring-0 placeholder:text-white/20 font-light text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded bg-primary/5 border border-primary/10 mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white/40 text-[10px] uppercase tracking-wider">Items Seleccionados</span>
                                <span className="text-white text-xs">{items.length} Productos</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/40 text-[10px] uppercase tracking-wider">Total Estimado</span>
                                <span className="text-primary font-bold text-sm">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isGenerating}
                            className={`w-full bg-primary hover:bg-white hover:text-black text-black font-bold py-4 rounded mt-4 uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-3 transition-all ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                    <span>Generando Recibo...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-icons text-sm">receipt_long</span>
                                    Generar Ticket y Continuar
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[9px] text-white/30 uppercase tracking-widest mt-6">
                        Compra segura vía WhatsApp Business
                    </p>
                </div>
            </div>

            {/* Hidden Ticket for Capture */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <ReceiptTicket
                    ref={receiptRef}
                    items={items}
                    total={total}
                    customerName={name}
                    customerAddress={customerAddress}
                    orderNumber={currentOrderNumber}
                />
            </div>
        </div>
    );
};

export default CheckoutForm;