import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Vehicle {
    id: string;
    make: string;
    model: string;
}

interface StockLevel {
    id: string;
    location_id: string;
    quantity: number;
    location?: {
        name: string;
    };
}

interface Part {
    id: string;
    internal_part_code: string;
    manufacturer_part_number: string;
    description: string;
    part_type: string;
    system: string;
    oe_part_number: string | null;
    last_known_price: number | null;
    last_known_supplier: string | null;
    purchase_url: string | null;
    notes: string | null;
    image_url: string | null;
    oe_description: string | null;
    availability: string;
}

const PartDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [part, setPart] = useState<Part | null>(null);
    const [linkedVehicles, setLinkedVehicles] = useState<Vehicle[]>([]);
    const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
    const [locations, setLocations] = useState<{ id: string, name: string }[]>([]);
    const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
    const [isLinking, setIsLinking] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockFormData, setStockFormData] = useState({ location_id: '', quantity: 0 });

    useEffect(() => {
        const fetchPart = async () => {
            const response = await fetch(`/api/v1/parts/${id}`, {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                setPart(data);
            }
        };

        const fetchLinkedVehicles = async () => {
            const response = await fetch(`/api/v1/parts/${id}/vehicles`, {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                setLinkedVehicles(data);
            }
        };

        const fetchStock = async () => {
            const response = await fetch(`/api/v1/parts/${id}/stock`, {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                setStockLevels(data);
            }
        };

        const fetchAllVehicles = async () => {
            const response = await fetch('/api/v1/vehicles/', {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                setAllVehicles(data);
            }
        };

        const fetchLocations = async () => {
            const response = await fetch('/api/v1/locations/', {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                setLocations(data);
            }
        };

        fetchPart();
        fetchLinkedVehicles();
        fetchStock();
        fetchAllVehicles();
        fetchLocations();
    }, [id]);

    const handleLinkVehicle = async (vehicleId: string) => {
        const response = await fetch(`/api/v1/parts/${id}/vehicles/${vehicleId}`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer test-token' }
        });
        if (response.ok) {
            const vehiclesResponse = await fetch(`/api/v1/parts/${id}/vehicles`, {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            const data = await vehiclesResponse.json();
            setLinkedVehicles(data);
            setIsLinking(false);
        }
    };

    const handleUnlinkVehicle = async (vehicleId: string) => {
        const response = await fetch(`/api/v1/parts/${id}/vehicles/${vehicleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer test-token' }
        });
        if (response.ok) {
            setLinkedVehicles(linkedVehicles.filter(v => v.id !== vehicleId));
        }
    };

    const handleSetStock = async () => {
        if (!stockFormData.location_id) return;
        await handleUpdateStock(stockFormData.location_id, stockFormData.quantity);
        setIsStockModalOpen(false);
        setStockFormData({ location_id: '', quantity: 0 });
    };

    const handleUpdateStock = async (locationId: string, quantity: number) => {
        await fetch(`/api/v1/parts/${id}/stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({ location_id: locationId, quantity })
        });
        const response = await fetch(`/api/v1/parts/${id}/stock`, {
            headers: { 'Authorization': 'Bearer test-token' }
        });
        const data = await response.json();
        setStockLevels(data);
    };

    if (!part) return <div className="p-8 text-muted-foreground animate-pulse font-mono tracking-widest text-xs uppercase">Synchronizing Part Data...</div>;

    return (
        <div className="p-8 bg-background min-h-screen text-foreground font-sans selection:bg-primary/20">
            <div className="max-w-5xl mx-auto">
                <Link to="/">
                    <button className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all mb-12 group">
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to Dashboard</span>
                    </button>
                </Link>

                <div className="bg-card rounded-[32px] border shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <div className="bg-primary/5 p-12 border-b relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center relative z-10 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
                                        {part.part_type}
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${part.availability === 'Available' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        part.availability === 'Backordered' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-destructive/10 text-destructive border-destructive/20'
                                        }`}>
                                        {part.availability}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-6xl font-black tracking-tight leading-none text-foreground">
                                        {part.manufacturer_part_number}
                                    </h1>
                                    <p className="font-mono text-xl text-muted-foreground tracking-tighter opacity-70 italic">
                                        INTERNAL_REF: {part.internal_part_code}
                                    </p>
                                </div>
                            </div>

                            {part.image_url && (
                                <div className="w-48 h-48 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl shrink-0">
                                    <img src={part.image_url} alt={part.description} className="w-full h-full object-cover" />
                                </div>
                            )}

                            {!part.image_url && (
                                <div className="text-left lg:text-right">
                                    <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em] mb-2">Price Estimate</p>
                                    <p className="text-4xl font-black tracking-tighter">
                                        {part.last_known_price ? `$${part.last_known_price.toFixed(2)}` : 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-12 space-y-16">
                        <div className="grid lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2 space-y-12">
                                <section className="space-y-6">
                                    <label className="block text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Core Specifications</label>
                                    <div className="grid grid-cols-2 gap-8 p-8 bg-muted/30 rounded-3xl border">
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">System</p>
                                            <p className="text-lg font-bold">{part.system}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">OE Part Number</p>
                                            <p className="text-lg font-mono font-bold">{part.oe_part_number || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Supplier</p>
                                            <p className="text-lg font-bold">{part.last_known_supplier || 'Unknown'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Last Price</p>
                                            <p className="text-lg font-bold">{part.last_known_price ? `$${part.last_known_price.toFixed(2)}` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <label className="block text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Detailed Description</label>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-xl leading-relaxed font-medium">
                                            {part.description}
                                        </p>
                                        {part.oe_description && (
                                            <p className="text-sm text-muted-foreground border-l-2 pl-4 italic">
                                                OE Specification: {part.oe_description}
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {part.notes && (
                                    <section className="space-y-6">
                                        <label className="block text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Engineering Notes</label>
                                        <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl text-sm leading-loose">
                                            {part.notes}
                                        </div>
                                    </section>
                                )}

                                {part.purchase_url && (
                                    <section className="pt-4">
                                        <a href={part.purchase_url} target="_blank" rel="noopener noreferrer">
                                            <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                                                <span>Acquire from Supplier</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </button>
                                        </a>
                                    </section>
                                )}
                            </div>

                            <div className="space-y-16">
                                <section className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Compatibility</label>
                                        <button
                                            onClick={() => setIsLinking(!isLinking)}
                                            className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                                        >
                                            + Link
                                        </button>
                                    </div>
                                    {isLinking && (
                                        <div className="bg-muted p-4 rounded-2xl space-y-2 mb-4 animate-in slide-in-from-top-2 border">
                                            <select
                                                className="w-full bg-background border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                onChange={(e) => handleLinkVehicle(e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select vehicle...</option>
                                                {allVehicles.filter(v => !linkedVehicles.find(lv => lv.id === v.id)).map(v => (
                                                    <option key={v.id} value={v.id}>{v.make} {v.model}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        {linkedVehicles.map(v => (
                                            <div key={v.id} className="flex justify-between items-center bg-muted/30 px-6 py-4 rounded-2xl group border border-transparent hover:border-border transition-all">
                                                <span className="font-bold text-sm tracking-tight">{v.make} {v.model}</span>
                                                <button
                                                    onClick={() => handleUnlinkVehicle(v.id)}
                                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                        {linkedVehicles.length === 0 && <p className="text-xs text-muted-foreground italic pl-4">No compatibility records</p>}
                                    </div>
                                </section>

                                <section className="space-y-8">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Warehouse Status</label>
                                        <button
                                            onClick={() => setIsStockModalOpen(!isStockModalOpen)}
                                            className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
                                        >
                                            + Add Stock
                                        </button>
                                    </div>

                                    {isStockModalOpen && (
                                        <div className="bg-muted p-4 rounded-2xl space-y-4 mb-4 animate-in slide-in-from-top-2 border">
                                            <div className="space-y-4">
                                                <select
                                                    id="location"
                                                    className="w-full bg-background border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    value={stockFormData.location_id}
                                                    onChange={(e) => setStockFormData({ ...stockFormData, location_id: e.target.value })}
                                                >
                                                    <option value="" disabled>Select location...</option>
                                                    {locations.map(l => (
                                                        <option key={l.id} value={l.id}>{l.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    id="quantity"
                                                    type="number"
                                                    placeholder="Quantity"
                                                    className="w-full bg-background border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                    value={stockFormData.quantity}
                                                    onChange={(e) => setStockFormData({ ...stockFormData, quantity: parseInt(e.target.value) || 0 })}
                                                />
                                                <button
                                                    id="save-stock"
                                                    onClick={handleSetStock}
                                                    className="w-full bg-primary text-primary-foreground py-2 rounded-xl text-xs font-bold uppercase tracking-widest"
                                                >
                                                    Save Stock
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {stockLevels.map(stock => (
                                            <div key={stock.id} className="bg-muted/30 p-6 rounded-3xl border space-y-4 stock-item">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-[10px] uppercase tracking-widest opacity-50">
                                                        {locations.find(l => l.id === stock.location_id)?.name || 'Unknown Location'}
                                                    </span>
                                                    <span className={`w-2 h-2 rounded-full ${stock.quantity > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <button onClick={() => handleUpdateStock(stock.location_id, stock.quantity - 1)} className="w-10 h-10 flex items-center justify-center bg-background border rounded-xl hover:bg-muted font-black transition-all">-</button>
                                                    <span className="font-mono text-3xl font-black">{stock.quantity}</span>
                                                    <button onClick={() => handleUpdateStock(stock.location_id, stock.quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-background border rounded-xl hover:bg-muted font-black transition-all">+</button>
                                                </div>
                                            </div>
                                        ))}
                                        {stockLevels.length === 0 && (
                                            <div className="text-center py-8 border-2 border-dashed border-muted rounded-[32px] text-muted-foreground text-xs italic">
                                                No stock assigned to locations
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartDetailsPage;
