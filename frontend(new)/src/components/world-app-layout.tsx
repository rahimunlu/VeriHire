'use client';

import { useMiniKit } from './minikit-provider';
import { ReactNode, useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorldAppLayoutProps {
    children: ReactNode;
    className?: string;
}

export function WorldAppLayout({ children, className = '' }: WorldAppLayoutProps) {
    const {
        isConnected,
        isLoading,
        safeAreaInsets,
        worldAppVersion,
        deviceOS
    } = useMiniKit();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading World Mini App...</p>
                </div>
            </div>
        );
    }

    const safeAreaStyle = isConnected && safeAreaInsets ? {
        paddingTop: `${safeAreaInsets.top}px`,
        paddingRight: `${safeAreaInsets.right}px`,
        paddingBottom: `${safeAreaInsets.bottom}px`,
        paddingLeft: `${safeAreaInsets.left}px`,
    } : {};

    return (
        <div
            className={`w-full min-h-screen ${className}`}
            style={safeAreaStyle}
        >
            {/* Development mode indicator */}
            {process.env.NODE_ENV === 'development' && !isConnected && (
                <Alert className="m-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Development mode: Not connected to World App.
                        {worldAppVersion && ` World App v${worldAppVersion}`}
                        {deviceOS && ` on ${deviceOS}`}
                    </AlertDescription>
                </Alert>
            )}

            {children}
        </div>
    );
}

export default WorldAppLayout; 