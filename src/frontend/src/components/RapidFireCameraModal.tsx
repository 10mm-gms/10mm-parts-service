import React, { useRef, useState, useEffect } from 'react';
import { Button, Modal } from '10mm-ui-core';
import imageCompression from 'browser-image-compression';

interface RapidFireCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotosCaptured: (files: File[]) => void;
}

export const RapidFireCameraModal: React.FC<RapidFireCameraModalProps> = ({
    isOpen,
    onClose,
    onPhotosCaptured
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedCount, setCapturedCount] = useState(0);
    const [captureQueue, setCaptureQueue] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen, facingMode]);

    const startCamera = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });

            // Apply US-002 optimization (Resize, WebP)
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 2000,
                useWebWorker: true,
                fileType: 'image/webp'
            };

            setIsProcessing(true);
            try {
                const optimizedFile = await imageCompression(file, options);
                setCaptureQueue(prev => [...prev, optimizedFile as File]);
                setCapturedCount(prev => prev + 1);
            } catch (err) {
                console.error("Optimization failed:", err);
            } finally {
                setIsProcessing(false);
            }
        }, 'image/jpeg', 0.95);
    };

    const handleDone = () => {
        onPhotosCaptured(captureQueue);
        setCaptureQueue([]);
        setCapturedCount(0);
        onClose();
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rapid-Fire Camera">
            <div className="space-y-6">
                <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-muted">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Viewfinder Overlay */}
                    <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none"></div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{capturedCount} Captured</span>
                    </div>

                    <button
                        onClick={toggleCamera}
                        className="absolute bottom-4 left-4 p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-6">
                    <button
                        onClick={capturePhoto}
                        disabled={isProcessing}
                        className="w-20 h-20 rounded-full border-4 border-primary p-1 transition-transform active:scale-95 disabled:opacity-50"
                    >
                        <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
                            {isProcessing ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <div className="w-8 h-8 text-white">
                                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>
                                </div>
                            )}
                        </div>
                    </button>

                    <div className="flex space-x-4 w-full">
                        <Button
                            variant="primary"
                            onClick={handleDone}
                            className="flex-1 py-4 font-black uppercase tracking-widest text-xs"
                            disabled={capturedCount === 0}
                        >
                            Review & Add {capturedCount > 0 ? `(${capturedCount})` : ''}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 py-4 font-black uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
