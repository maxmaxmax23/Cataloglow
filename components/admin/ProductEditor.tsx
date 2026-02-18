import React, { useState, useEffect } from 'react';
import { Product } from '../../src/types';

interface ProductEditorProps {
    product: Product | null; // null = New Product
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    onDelete: (productId: string) => void;
    categories: string[]; // For auto-complete/dropdown
}

export const ProductEditor: React.FC<ProductEditorProps> = ({
    product,
    isOpen,
    onClose,
    onSave,
    onDelete,
    categories
}) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        id: '',
        name: '',
        description: '',
        price: 0,
        category: '',
        currentInventory: 0,
        image: '',
        benefits: []
    });

    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({ ...product });
            setIsNew(false);
        } else {
            // Default for new product
            setFormData({
                id: crypto.randomUUID(), // Auto-gen ID for new
                name: '',
                description: '',
                price: 0,
                category: 'General',
                currentInventory: 0,
                image: '', // Placeholder
                benefits: []
            });
            setIsNew(true);
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: keyof Product, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Product);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#080808] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-cinzel text-primary uppercase tracking-widest">
                        {isNew ? 'New Artifact' : 'Edit Artifact'}
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* ID & Basic Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Product Name</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Category</label>
                            <input
                                list="categories"
                                type="text"
                                value={formData.category || ''}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary outline-none"
                            />
                            <datalist id="categories">
                                {categories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">SKU / ID (Read Only)</label>
                            <input
                                type="text"
                                value={formData.id || ''}
                                readOnly
                                className="w-full bg-white/5 border border-white/5 p-3 text-white/30 font-mono text-xs cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 gap-6 p-4 bg-white/5 border border-white/5">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-primary mb-2">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price || 0}
                                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 p-3 text-white font-mono focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Stock Level</label>
                            <input
                                type="number"
                                value={formData.currentInventory || 0}
                                onChange={(e) => handleChange('currentInventory', parseInt(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 p-3 text-white font-mono focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Media */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Image URL</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={formData.image || ''}
                                onChange={(e) => handleChange('image', e.target.value)}
                                className="flex-1 bg-black/50 border border-white/10 p-3 text-white text-xs focus:border-primary outline-none font-mono"
                                placeholder="https://..."
                            />
                            <div className="w-12 h-12 bg-white/10 border border-white/10 flex-shrink-0 overflow-hidden">
                                {formData.image && <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-3 text-white text-sm focus:border-primary outline-none h-32 resize-none leading-relaxed"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/10">
                        {!isNew ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this product?')) {
                                        onDelete(product!.id);
                                        onClose();
                                    }
                                }}
                                className="text-red-500 text-xs uppercase tracking-widest hover:text-red-400"
                            >
                                Delete Artifact
                            </button>
                        ) : <div></div>}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-white/10 text-white/60 text-xs uppercase tracking-widest hover:bg-white/5"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-primary text-black font-bold text-xs uppercase tracking-widest hover:bg-white"
                            >
                                {isNew ? 'Create Artifact' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
