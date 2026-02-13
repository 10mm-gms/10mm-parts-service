import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="bg-card border-b sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-8">
                <div className="flex space-x-8 h-16 items-center">
                    <div className="flex-shrink-0 flex items-center mr-4">
                        <span className="text-primary font-black tracking-tighter text-xl">PARTS_PRO</span>
                    </div>
                    <div className="flex space-x-1 h-full">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => `
                                px-4 h-full flex items-center text-sm font-bold transition-all border-b-2
                                ${isActive
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}
                            `}
                        >
                            Parts
                        </NavLink>
                        <NavLink
                            to="/vehicles"
                            className={({ isActive }) => `
                                px-4 h-full flex items-center text-sm font-bold transition-all border-b-2
                                ${isActive
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}
                            `}
                        >
                            Vehicles
                        </NavLink>
                        <NavLink
                            to="/locations"
                            className={({ isActive }) => `
                                px-4 h-full flex items-center text-sm font-bold transition-all border-b-2
                                ${isActive
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'}
                            `}
                        >
                            Locations
                        </NavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
