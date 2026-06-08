import React from "react";
import { X } from "lucide-react";

interface FullscreenFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    isLoading?: boolean;
}

export function FullscreenFormModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    isLoading
}: FullscreenFormModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 flex justify-between items-center p-6 border-b border-border/20 bg-white/95 backdrop-blur-sm rounded-t-3xl">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold">{title}</h2>
                        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-secondary rounded-full transition-colors ml-4 flex-shrink-0"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
