import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '10mm-ui-core';

interface Part {
    id: string;
    manufacturer_part_number: string;
    description: string;
    part_type: string;
    system: string;
    internal_part_code: string;
    oe_part_number?: string;
    last_known_price?: number;
    last_known_supplier?: string;
    purchase_url?: string;
    notes?: string;
    image_url?: string;
    oe_description?: string;
    availability: string;
    alternatives: string[];
}

const PartsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [parts, setParts] = useState<Part[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState<Part | null>(null);
    const [formData, setFormData] = useState({
        manufacturer_part_number: '',
        description: '',
        part_type: '',
        system: 'Other',
        oe_part_number: '',
        last_known_price: '',
        last_known_supplier: '',
        purchase_url: '',
        notes: '',
        image_url: '',
        oe_description: '',
        availability: 'Available',
        alternatives: ''
    });

    useEffect(() => {
        const fetchParts = async () => {
            const url = searchTerm
                ? `/api/v1/search/?q=${encodeURIComponent(searchTerm)}`
                : '/api/v1/parts/';

            setIsLoading(true);
            const response = await fetch(url, {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                // If the response comes from the search endpoint, it's { parts: [], vehicles: [] }
                setParts(searchTerm ? data.parts : data);
            }
            setIsLoading(false);
        };

        const debounce = setTimeout(fetchParts, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Normalize data
        const price = parseFloat(formData.last_known_price);
        const payload = {
            ...formData,
            last_known_price: isNaN(price) ? null : price,
            alternatives: formData.alternatives ? formData.alternatives.split(',').map(s => s.trim()).filter(s => s !== '') : [],
            oe_part_number: formData.oe_part_number || null,
            last_known_supplier: formData.last_known_supplier || null,
            purchase_url: formData.purchase_url || null,
            notes: formData.notes || null,
            image_url: formData.image_url || null,
            oe_description: formData.oe_description || null
        };

        const url = editingPart ? `/api/v1/parts/${editingPart.id}` : '/api/v1/parts/';
        const method = editingPart ? 'PATCH' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const updatedPart = await response.json();
            if (editingPart) {
                setParts(parts.map(p => p.id === updatedPart.id ? updatedPart : p));
            } else {
                setParts([updatedPart, ...parts]);
            }
            setIsModalOpen(false);
            setEditingPart(null);
            setFormData({
                manufacturer_part_number: '',
                description: '',
                part_type: '',
                system: 'Other',
                oe_part_number: '',
                last_known_price: '',
                last_known_supplier: '',
                purchase_url: '',
                notes: '',
                image_url: '',
                oe_description: '',
                availability: 'Available',
                alternatives: ''
            });
        }
    };

    const handleEdit = (part: Part) => {
        setEditingPart(part);
        setFormData({
            manufacturer_part_number: part.manufacturer_part_number,
            description: part.description,
            part_type: part.part_type,
            system: part.system,
            oe_part_number: part.oe_part_number || '',
            last_known_price: part.last_known_price?.toString() || '',
            last_known_supplier: part.last_known_supplier || '',
            purchase_url: part.purchase_url || '',
            notes: part.notes || '',
            image_url: part.image_url || '',
            oe_description: part.oe_description || '',
            availability: part.availability || 'Available',
            alternatives: part.alternatives?.join(', ') || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this part?')) return;

        const response = await fetch(`/api/v1/parts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });

        if (response.ok) {
            setParts(parts.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-8 bg-background min-h-screen text-foreground font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-12">
                    <div className="flex-1">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                            Parts Dashboard
                        </h1>
                        <Link to="/vehicles" className="text-primary hover:underline text-sm font-bold uppercase tracking-widest">Manage Vehicles →</Link>

                        <div className="mt-8 relative max-w-md group">
                            <input
                                type="text"
                                placeholder="Search MPN, description, or system..."
                                className="w-full bg-card border rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm group-hover:shadow-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${searchTerm ? 'text-primary' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            {isLoading && (
                                <div className="absolute right-4 top-4">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button
                        id="add-new-part"
                        onClick={() => { setEditingPart(null); setIsModalOpen(true); }}
                        className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg px-6 py-2 rounded-xl transition-all duration-200 mt-2"
                    >
                        Add New Part
                    </Button>
                </div>

                <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-8 py-4">Internal Code</th>
                                <th className="px-8 py-4">MPN</th>
                                <th className="px-8 py-4">Description</th>
                                <th className="px-8 py-4">Category</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-border">
                            {parts.map(part => (
                                <tr key={part.id} className="hover:bg-muted/50 transition-all duration-150 group">
                                    <td className="px-8 py-5">
                                        <Link
                                            to={`/parts/${part.id}`}
                                            className="font-mono text-primary hover:opacity-80 font-medium"
                                        >
                                            {part.internal_part_code}
                                        </Link>
                                    </td>
                                    <td className="px-8 py-5 font-medium">{part.manufacturer_part_number}</td>
                                    <td className="px-8 py-5 text-muted-foreground">{part.description}</td>
                                    <td className="px-8 py-5">
                                        <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border">
                                            {part.part_type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-3">
                                        <button
                                            onClick={() => handleEdit(part)}
                                            className="text-muted-foreground hover:text-foreground transition-colors edit-part"
                                            title="Edit Part"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(part.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors delete-part"
                                            title="Delete Part"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {parts.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            </div>
                            <h3 className="text-lg font-medium">No parts found</h3>
                            <p className="text-muted-foreground">Your parts inventory is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold">{editingPart ? 'Edit Part' : 'Complete Part Specification'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingPart(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-0">
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Manufacturer Part Number</label>
                                    <input
                                        id="mpn"
                                        required
                                        placeholder="e.g. SU-12345"
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        value={formData.manufacturer_part_number}
                                        onChange={(e) => setFormData({ ...formData, manufacturer_part_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Description</label>
                                    <textarea
                                        id="description"
                                        required
                                        rows={3}
                                        placeholder="Specify material, placement, and dimensions..."
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Component Type</label>
                                        <input
                                            id="type"
                                            required
                                            placeholder="e.g. Bushing"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.part_type}
                                            onChange={(e) => setFormData({ ...formData, part_type: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Vehicle System</label>
                                        <select
                                            id="system"
                                            required
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.system}
                                            onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                                        >
                                            {['Powertrain', 'Transmission', 'Suspension', 'Steering', 'Brakes', 'Electrical', 'Body', 'Interior', 'Other'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">OE Part Number</label>
                                        <input
                                            id="oe-number"
                                            placeholder="e.g. 123456789"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.oe_part_number}
                                            onChange={(e) => setFormData({ ...formData, oe_part_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Availability</label>
                                        <select
                                            id="availability"
                                            required
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.availability}
                                            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                        >
                                            {['Available', 'Backordered', 'Discontinued'].map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Known Price</label>
                                        <input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.last_known_price}
                                            onChange={(e) => setFormData({ ...formData, last_known_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Known Supplier</label>
                                        <input
                                            id="supplier"
                                            placeholder="e.g. PartsCo"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.last_known_supplier}
                                            onChange={(e) => setFormData({ ...formData, last_known_supplier: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Purchase URL</label>
                                    <input
                                        id="url"
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        value={formData.purchase_url}
                                        onChange={(e) => setFormData({ ...formData, purchase_url: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Image URL</label>
                                    <input
                                        id="image"
                                        placeholder="https://..."
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">OE Description</label>
                                    <input
                                        id="oe-description"
                                        placeholder="Manufacturer's original description..."
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        value={formData.oe_description}
                                        onChange={(e) => setFormData({ ...formData, oe_description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</label>
                                    <textarea
                                        id="notes"
                                        rows={2}
                                        placeholder="Additional information..."
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Alternatives (Internal Codes, comma-separated)</label>
                                    <input
                                        id="alternatives"
                                        placeholder="e.g. CODE-1, CODE-2"
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        value={formData.alternatives}
                                        onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-8 border-t bg-muted/30 flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingPart(null); }}
                                    className="flex-1 bg-background border hover:bg-muted text-muted-foreground font-bold py-3 px-6 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    id="submit-part"
                                    className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                                >
                                    {editingPart ? 'Save Changes' : 'Create Part'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartsPage;
