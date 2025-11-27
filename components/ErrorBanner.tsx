import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
    message: string | null;
    onClose: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto dismiss after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slideIn">
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span className="font-medium text-sm">{message}</span>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
