import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '10mm-ui-core';

interface Vehicle {
    id: string;
    make: string;
    model: string;
    from_year: number;
    to_year: number | null;
    power_type: string;
    variant: string | null;
    body_style: string;
    drive_type: string;
    trim_level: string | null;
}

const VehiclesPage: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        from_year: new Date().getFullYear(),
        to_year: null as number | null,
        power_type: 'EV',
        variant: '',
        body_style: 'Saloon',
        drive_type: 'RWD',
        trim_level: ''
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            const response = await fetch('/api/v1/vehicles/', {
                headers: { 'Authorization': 'Bearer test-token' }
            });
            if (response.ok) {
                const data = await response.json();
                setVehicles(data);
            }
        };
        fetchVehicles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingVehicle ? `/api/v1/vehicles/${editingVehicle.id}` : '/api/v1/vehicles/';
        const method = editingVehicle ? 'PATCH' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const updatedVehicle = await response.json();
            if (editingVehicle) {
                setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
            } else {
                setVehicles([...vehicles, updatedVehicle]);
            }
            setIsModalOpen(false);
            setEditingVehicle(null);
            setFormData({
                make: '',
                model: '',
                from_year: new Date().getFullYear(),
                to_year: null,
                power_type: 'EV',
                variant: '',
                body_style: 'Saloon',
                drive_type: 'RWD',
                trim_level: ''
            });
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            make: vehicle.make,
            model: vehicle.model,
            from_year: vehicle.from_year,
            to_year: vehicle.to_year,
            power_type: vehicle.power_type,
            variant: vehicle.variant || '',
            body_style: vehicle.body_style,
            drive_type: vehicle.drive_type,
            trim_level: vehicle.trim_level || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

        const response = await fetch(`/api/v1/vehicles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });

        if (response.ok) {
            setVehicles(vehicles.filter(v => v.id !== id));
        }
    };

    return (
        <div className="p-8 bg-background min-h-screen text-foreground font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                            Vehicles
                        </h1>
                        <p className="text-muted-foreground">Manage supported vehicles and compatibility profiles</p>
                    </div>
                    <Button
                        onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}
                        className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg px-6 py-2 rounded-xl transition-all duration-200"
                    >
                        Add New Vehicle
                    </Button>
                </div>

                <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-8 py-4">Make & Model</th>
                                <th className="px-8 py-4">Year Range</th>
                                <th className="px-8 py-4">Configuration</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-border">
                            {vehicles.map(vehicle => (
                                <tr key={vehicle.id} className="hover:bg-muted/50 transition-all duration-150 group">
                                    <td className="px-8 py-5">
                                        <div className="font-bold">{vehicle.make} {vehicle.model}</div>
                                        <div className="text-xs text-muted-foreground flex items-center space-x-2 mt-1">
                                            {vehicle.variant && <span>{vehicle.variant}</span>}
                                            {vehicle.variant && vehicle.trim_level && <span>•</span>}
                                            {vehicle.trim_level && <span>{vehicle.trim_level}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-mono text-sm">
                                        {vehicle.from_year} {vehicle.to_year ? `- ${vehicle.to_year}` : '(Ongoing)'}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                                {vehicle.power_type}
                                            </span>
                                            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-border">
                                                {vehicle.body_style}
                                            </span>
                                            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-border">
                                                {vehicle.drive_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-3">
                                        <button
                                            onClick={() => handleEdit(vehicle)}
                                            className="text-muted-foreground hover:text-foreground transition-colors edit-vehicle"
                                            title="Edit Vehicle"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors delete-vehicle"
                                            title="Delete Vehicle"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vehicles.length === 0 && (
                        <div className="py-20 text-center">
                            <h3 className="text-lg font-medium">No vehicles found</h3>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b flex justify-between items-center bg-muted/30">
                            <h2 className="text-xl font-bold">{editingVehicle ? 'Edit Vehicle' : 'New Vehicle Profile'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-0">
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Make</label>
                                        <input
                                            id="make"
                                            required
                                            placeholder="e.g. Tesla"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.make}
                                            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Model</label>
                                        <input
                                            id="model"
                                            required
                                            placeholder="e.g. Model 3"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">From Year</label>
                                        <input
                                            id="from_year"
                                            type="number"
                                            required
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.from_year}
                                            onChange={(e) => setFormData({ ...formData, from_year: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">To Year</label>
                                        <input
                                            id="to_year"
                                            type="number"
                                            placeholder="Ongoing"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.to_year || ''}
                                            onChange={(e) => setFormData({ ...formData, to_year: e.target.value ? parseInt(e.target.value) : null })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Power Type</label>
                                        <select
                                            id="power_type"
                                            required
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.power_type}
                                            onChange={(e) => setFormData({ ...formData, power_type: e.target.value })}
                                        >
                                            {['EV', 'PHEV', 'MHEV'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Drive Type</label>
                                        <select
                                            id="drive_type"
                                            required
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                            value={formData.drive_type}
                                            onChange={(e) => setFormData({ ...formData, drive_type: e.target.value })}
                                        >
                                            {['RWD', 'FWD', 'AWD'].map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Body Style</label>
                                    <select
                                        id="body_style"
                                        required
                                        className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                        value={formData.body_style}
                                        onChange={(e) => setFormData({ ...formData, body_style: e.target.value })}
                                    >
                                        {['Hatchback', 'Saloon', 'Estate', 'SUV', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Van'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Variant</label>
                                        <input
                                            id="variant"
                                            placeholder="e.g. Long Range"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.variant}
                                            onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Trim Level</label>
                                        <input
                                            id="trim_level"
                                            placeholder="e.g. Performance"
                                            className="w-full bg-background border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            value={formData.trim_level}
                                            onChange={(e) => setFormData({ ...formData, trim_level: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t bg-muted/30 flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingVehicle(null); }}
                                    className="flex-1 bg-background border hover:bg-muted text-muted-foreground font-bold py-3 px-6 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    id="submit-vehicle"
                                    className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
                                >
                                    {editingVehicle ? 'Save Changes' : 'Create Vehicle'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;
