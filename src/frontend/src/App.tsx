import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PartsPage from './pages/PartsPage';
import PartDetailsPage from './pages/PartDetailsPage';
import VehiclesPage from './pages/VehiclesPage';
import LocationsPage from './pages/LocationsPage';
import Navbar from './components/Navbar';

function App() {
    return (
        <BrowserRouter>
            <div className="App flex flex-col min-h-screen bg-background">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<PartsPage />} />
                        <Route path="/parts/:id" element={<PartDetailsPage />} />
                        <Route path="/vehicles" element={<VehiclesPage />} />
                        <Route path="/locations" element={<LocationsPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
