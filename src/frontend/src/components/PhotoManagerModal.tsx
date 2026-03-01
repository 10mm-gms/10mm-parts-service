import React, { useState, useEffect } from 'react';
import { Button, Modal } from '10mm-ui-core';
import imageCompression from 'browser-image-compression';
import { RapidFireCameraModal } from './RapidFireCameraModal';

interface Photograph {
    id: string;
    s3_key: string;
    original_filename: string;
    is_primary: boolean;
    view_url: string;
}

interface PhotoManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    partId: string;
    initialPhotos: Photograph[];
    onPhotosUpdated: (photos: Photograph[]) => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
    isOpen,
    onClose,
    partId,
    initialPhotos,
    onPhotosUpdated
}) => {
    const [photos, setPhotos] = useState<Photograph[]>(initialPhotos);
    const [isUploading, setIsUploading] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    useEffect(() => {
        setPhotos(initialPhotos);
    }, [initialPhotos]);

    const uploadFiles = async (files: FileList | File[]) => {
        if (photos.length + files.length > 30) {
            alert('Maximum 30 photographs allowed per part.');
            return;
        }

        setIsUploading(true);

        const uploadPromises = Array.from(files).map(async (file) => {
            try {
                // 1. Client-side optimization (Standard: Resize 2000px, WebP, 0.75 quality)
                // Note: RapidFireCameraModal already does this for its files, 
                // but we do it again here for safety or for direct file selection.
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 2000,
                    useWebWorker: true,
                    fileType: 'image/webp'
                };

                // If the file is already WebP (e.g. from camera), imageCompression will still process it
                const compressedFile = await imageCompression(file, options);

                // 2. Get Upload Intent from Backend
                const intentResponse = await fetch(`/api/v1/parts/${partId}/photographs/intent?filename=${encodeURIComponent(file.name)}`, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer test-token' }
                });
                if (!intentResponse.ok) throw new Error('Failed to get upload intent');
                const { upload_url, s3_key } = await intentResponse.json();

                // 3. Direct Upload to S3/MinIO
                const uploadResponse = await fetch(upload_url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'image/webp' },
                    body: compressedFile
                });
                if (!uploadResponse.ok) throw new Error('S3 upload failed');

                // 4. Confirm Upload with Backend
                const confirmResponse = await fetch(`/api/v1/parts/${partId}/photographs/confirm`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token'
                    },
                    body: JSON.stringify({
                        s3_key,
                        original_filename: file.name
                    })
                });
                if (!confirmResponse.ok) throw new Error('Finalization failed');

                const newPhoto = await confirmResponse.json();
                return newPhoto;
            } catch (err) {
                console.error('Upload failed for', file.name, err);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter((p): p is Photograph => p !== null);

        const updatedPhotos = [...photos, ...successfulUploads];
        setPhotos(updatedPhotos);
        onPhotosUpdated(updatedPhotos);
        setIsUploading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            uploadFiles(e.target.files);
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!window.confirm('Delete this photograph?')) return;

        const response = await fetch(`/api/v1/parts/${partId}/photographs/${photoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer test-token' }
        });

        if (response.ok) {
            const updatedPhotos = photos.filter(p => p.id !== photoId);
            setPhotos(updatedPhotos);
            onPhotosUpdated(updatedPhotos);
        }
    };

    const handleSetPrimary = async (photoId: string) => {
        const response = await fetch(`/api/v1/parts/${partId}/photographs/${photoId}/primary`, {
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer test-token' }
        });

        if (response.ok) {
            const updatedPhotos = photos.map(p => ({
                ...p,
                is_primary: p.id === photoId
            }));
            setPhotos(updatedPhotos);
            onPhotosUpdated(updatedPhotos);
        }
    };

    return (
        <React.Fragment>
            <Modal isOpen={isOpen} onClose={onClose} title="Manage Photographs">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {photos.map(photo => (
                            <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-muted border border-border transition-all hover:ring-2 hover:ring-primary">
                                <img src={photo.view_url} alt={photo.original_filename} className="w-full h-full object-cover" />

                                {photo.is_primary && (
                                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                        Primary
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2 p-4">
                                    {!photo.is_primary && (
                                        <button
                                            onClick={() => handleSetPrimary(photo.id)}
                                            className="w-full bg-white text-black py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-white/90"
                                        >
                                            Set Primary
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        className="w-full bg-destructive text-destructive-foreground py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all hover:opacity-90"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {photos.length < 30 && (
                            <div className="contents">
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Upload</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </label>

                                <button
                                    onClick={() => setIsCameraOpen(true)}
                                    disabled={isUploading}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <svg className="w-5 h-5 text-primary/60 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary">Camera</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {isUploading && (
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
                            <div className="flex-1 space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest">Processing & Uploading...</p>
                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-[upload_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <Button onClick={onClose} className="flex-1 py-3 font-bold uppercase tracking-widest text-xs">
                            Done
                        </Button>
                    </div>
                </div>
            </Modal>

            <RapidFireCameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onPhotosCaptured={(capturedFiles) => {
                    uploadFiles(capturedFiles);
                    setIsCameraOpen(false);
                }}
            />
        </React.Fragment>
    );
};
