import React, { useState, useEffect } from 'react';
import { Button } from 'attono-ui-core';

interface Location {
    id: string;
    name: string;
    address: string;
    notes: string | null;
    telephone: string | null;
    email: string | null;
}

const LocationsPage: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        notes: '',
        telephone: '',
        email: ''
    });

    const fetchLocations = async () => {
        const response = await fetch('/api/v1/locations/', {
            headers: { 'Authorization': 'Bearer test-token' }
        });
        if (response.ok) {
            const data = await response.json();
            setLocations(data);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingLocation ? `/api/v1/locations/${editingLocation.id}` : '/api/v1/locations/';
        const method = editingLocation ? 'PATCH' : 'POST';

        const payload = {
            ...formData,
            notes: formData.notes || null,
            telephone: formData.telephone || null,
            email: formData.email || null,
        };

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            fetchLocations();
            setIsModalOpen(false);
            setEditingLocation(null);
            setFormData({ name: '', address: '', notes: '', telephone: '', email: '' });
        }
    };

    const handleEdit = (location: Location) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            address: location.address,
            notes: location.notes || '',
            telephone: location.telephone || '',
            email: location.email || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this location?')) return;

        const response = await fetch(`/api/v1/locations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer test-token' }
        });

        if (response.ok) {
            setLocations(locations.filter(l => l.id !== id));
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Locations</h1>
                        <p className="text-muted-foreground">Manage warehouses and storage sites</p>
                    </div>
                    <Button
                        onClick={() => { setEditingLocation(null); setFormData({ name: '', address: '', notes: '', telephone: '', email: '' }); setIsModalOpen(true); }}
                        className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg px-6 py-2 rounded-xl transition-all"
                    >
                        Add New Location
                    </Button>
                </div>

                <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-8 py-4">Name</th>
                                <th className="px-8 py-4">Address</th>
                                <th className="px-8 py-4">Contact</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-border">
                            {locations.map(location => (
                                <tr key={location.id} className="hover:bg-muted/50 transition-all duration-150 group">
                                    <td className="px-8 py-5 font-bold">{location.name}</td>
                                    <td className="px-8 py-5 text-sm text-muted-foreground">{location.address}</td>
                                    <td className="px-8 py-5 text-sm">
                                        {location.telephone && <div className="text-muted-foreground">{location.telephone}</div>}
                                        {location.email && <div className="text-primary font-medium">{location.email}</div>}
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-3">
                                        <button onClick={() => handleEdit(location)} className="text-muted-foreground hover:text-foreground edit-location">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(location.id)} className="text-muted-foreground hover:text-destructive delete-location">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {locations.length === 0 && (
                        <div className="py-20 text-center text-muted-foreground">No locations found</div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b bg-muted/30">
                            <h2 className="text-xl font-bold">{editingLocation ? 'Edit Location' : 'New Location'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Name</label>
                                    <input
                                        id="name"
                                        required
                                        className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Address</label>
                                    <textarea
                                        id="address"
                                        required
                                        rows={3}
                                        className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Telephone</label>
                                        <input
                                            id="telephone"
                                            className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                            value={formData.telephone}
                                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Notes</label>
                                    <textarea
                                        id="notes"
                                        rows={2}
                                        className="w-full bg-background border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <Button type="submit" id="submit-location" className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-xl">
                                    {editingLocation ? 'Save Changes' : 'Create Location'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsPage;
