import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '10mm-ui-core';

interface Photograph {
    id: string;
    s3_key: string;
    original_filename: string;
    is_primary: boolean;
    view_url: string;
}

interface PhotoLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    photos: Photograph[];
    initialIndex: number;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
    isOpen,
    onClose,
    photos,
    initialIndex
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setCurrentIndex(initialIndex);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [initialIndex, isOpen]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [photos.length]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    }, [photos.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, handleNext, handlePrev]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => {
        setZoom(prev => {
            const newZoom = Math.max(prev - 0.5, 1);
            if (newZoom === 1) setPosition({ x: 0, y: 0 });
            return newZoom;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (!isOpen || photos.length === 0) return null;

    const currentPhoto = photos[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
                <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Photograph {currentIndex + 1} of {photos.length}</p>
                    <h3 className="text-lg font-bold tracking-tight">{currentPhoto.original_filename}</h3>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex bg-white/10 rounded-full p-1 border border-white/10">
                        <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" /></svg>
                        </button>
                        <span className="px-4 py-2 text-xs font-black text-white min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>

                    <a
                        href={currentPhoto.view_url}
                        download={currentPhoto.original_filename}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white border border-white/10"
                        title="Download"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </a>

                    <button
                        onClick={onClose}
                        className="p-3 bg-white/10 hover:bg-destructive rounded-full transition-all text-white border border-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    src={currentPhoto.view_url}
                    alt={currentPhoto.original_filename}
                    className="max-w-[90vw] max-h-[80vh] object-contain transition-transform duration-200 select-none shadow-2xl"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    draggable={false}
                />

                {/* Navigation Controls */}
                {photos.length > 1 && (
                    <div className="absolute inset-x-8 flex justify-between items-center pointer-events-none">
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="p-4 bg-black/40 hover:bg-black/80 rounded-full text-white transition-all border border-white/10 pointer-events-auto backdrop-blur-md group"
                        >
                            <svg className="w-8 h-8 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="p-4 bg-black/40 hover:bg-black/80 rounded-full text-white transition-all border border-white/10 pointer-events-auto backdrop-blur-md group"
                        >
                            <svg className="w-8 h-8 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer / Thumbnails */}
            <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center z-10">
                <div className="flex space-x-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 overflow-x-auto max-w-[80vw] no-scrollbar">
                    {photos.map((photo, idx) => (
                        <button
                            key={photo.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentIndex === idx ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                            <img src={photo.view_url} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
