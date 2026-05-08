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
        benefits: [],
        variants: null,
        isVisible: true
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
                benefits: [],
                variants: null,
                isVisible: true
            });
            setIsNew(true);
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: keyof Product, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddVariant = () => {
        const variantId = crypto.randomUUID();
        setFormData(prev => ({
            ...prev,
            variants: {
                ...(prev.variants || {}),
                [variantId]: { name: 'New Variant', priceModifier: 0, skuSuffix: '', colorCode: '#ffffff' }
            }
        }));
    };

    const handleUpdateVariant = (variantId: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            variants: {
                ...(prev.variants || {}),
                [variantId]: {
                    ...(prev.variants?.[variantId] || { name: '', priceModifier: 0, skuSuffix: '' }),
                    [field]: value
                }
            }
        }));
    };

    const handleRemoveVariant = (variantId: string) => {
        setFormData(prev => {
            if (!prev.variants) return prev;
            const newVariants = { ...prev.variants };
            delete newVariants[variantId];
            return {
                ...prev,
                variants: Object.keys(newVariants).length > 0 ? newVariants : null
            };
        });
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
                        <div className="col-span-2 flex justify-between items-center bg-white/5 p-4 border border-white/5">
                            <div>
                                <h3 className="text-white text-sm font-bold tracking-widest uppercase">Visibility</h3>
                                <p className="text-[10px] text-white/40">Show or hide this product on the public store.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={formData.isVisible !== false}
                                    onChange={(e) => handleChange('isVisible', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

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

                    {/* Variants / Tones */}
                    <div className="border border-white/10 bg-white/5 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-primary">Variants & Tones</label>
                                <p className="text-[10px] text-white/40">Add color variants or different models.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                className="text-[10px] uppercase tracking-widest px-3 py-1 border border-white/20 text-white/60 hover:text-white hover:border-white transition-colors"
                            >
                                + Add Variant
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.variants && Object.entries(formData.variants).map(([vId, v]) => (
                                <div key={vId} className="flex gap-4 items-center bg-black/30 p-2 border border-white/5">
                                    <input 
                                        type="color" 
                                        value={v.colorCode || '#ffffff'}
                                        onChange={e => handleUpdateVariant(vId, 'colorCode', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-none p-0 outline-none"
                                        title="Color Swatch"
                                    />
                                    <input
                                        type="text"
                                        value={v.name}
                                        onChange={e => handleUpdateVariant(vId, 'name', e.target.value)}
                                        placeholder="Variant Name (e.g. Ivory)"
                                        className="flex-1 bg-transparent border-b border-white/10 p-1 text-sm text-white focus:border-primary outline-none"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveVariant(vId)}
                                        className="text-red-500 hover:text-red-400 p-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                            {(!formData.variants || Object.keys(formData.variants).length === 0) && (
                                <p className="text-xs text-white/30 italic text-center py-2">No variants added.</p>
                            )}
                        </div>
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
