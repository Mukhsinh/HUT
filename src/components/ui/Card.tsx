import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div
            className={`bg-card rounded-xl-xl border border-border/50 shadow-sm overflow-hidden ${className}`}
            style={{ borderRadius: '24px' }}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "" }: CardProps) {
    return <div className={`px-6 py-4 border-b border-border/30 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: CardProps) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardProps) {
    return <div className={`px-6 py-4 border-t border-border/30 bg-muted/20 ${className}`}>{children}</div>;
}
