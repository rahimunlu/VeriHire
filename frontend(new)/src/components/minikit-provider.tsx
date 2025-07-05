'use client';

import { MiniKit } from '@worldcoin/minikit-js';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface MiniKitContextType {
    miniKit: MiniKit | null;
    isConnected: boolean;
    isLoading: boolean;
    worldAppVersion: number | null;
    safeAreaInsets: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | null;
    deviceOS: string | null;
    optedIntoOptionalAnalytics: boolean;
    // World ID verification state
    isWorldIdVerified: boolean;
    worldIdNullifier: string | null;
    setWorldIdVerified: (verified: boolean, nullifier?: string) => void;
    clearWorldIdVerification: () => void;
}

const MiniKitContext = createContext<MiniKitContextType | undefined>(undefined);

export function MiniKitProvider({ children }: { children: ReactNode }) {
    const [miniKit, setMiniKit] = useState<MiniKit | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [worldAppVersion, setWorldAppVersion] = useState<number | null>(null);
    const [safeAreaInsets, setSafeAreaInsets] = useState<{
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | null>(null);
    const [deviceOS, setDeviceOS] = useState<string | null>(null);
    const [optedIntoOptionalAnalytics, setOptedIntoOptionalAnalytics] = useState(false);

    // World ID verification state
    const [isWorldIdVerified, setIsWorldIdVerified] = useState(false);
    const [worldIdNullifier, setWorldIdNullifier] = useState<string | null>(null);

    // World ID verification functions
    const setWorldIdVerified = (verified: boolean, nullifier?: string) => {
        setIsWorldIdVerified(verified);
        setWorldIdNullifier(nullifier || null);

        // Only use localStorage when NOT in World App
        if (!isConnected) {
            if (verified && nullifier) {
                localStorage.setItem('worldId_verified', 'true');
                localStorage.setItem('worldId_nullifier', nullifier);
            } else {
                localStorage.removeItem('worldId_verified');
                localStorage.removeItem('worldId_nullifier');
            }
        }
    };

    const clearWorldIdVerification = () => {
        // Don't allow clearing verification when inside World App
        if (isConnected) {
            console.log('Cannot clear World ID verification when inside World App');
            return;
        }

        setIsWorldIdVerified(false);
        setWorldIdNullifier(null);
        localStorage.removeItem('worldId_verified');
        localStorage.removeItem('worldId_nullifier');
    };

    useEffect(() => {
        const initializeMiniKit = async () => {
            try {
                // Check if we're in World App
                if (typeof window !== 'undefined' && window.WorldApp) {
                    const worldApp = window.WorldApp;

                    // Set device properties
                    setWorldAppVersion(worldApp.world_app_version);
                    setSafeAreaInsets(worldApp.safe_area_insets);
                    setDeviceOS(worldApp.device_os);
                    setOptedIntoOptionalAnalytics(worldApp.is_optional_analytics);

                    // Initialize MiniKit
                    const miniKitInstance = new MiniKit();
                    setMiniKit(miniKitInstance);
                    setIsConnected(true);

                    // If we're in World App, user is already verified with World ID
                    setIsWorldIdVerified(true);
                    setWorldIdNullifier('world_app_verified'); // Special marker for World App users

                    console.log('World Mini App initialized successfully - User auto-verified');
                } else {
                    console.log('Not running in World App - using fallback mode');
                    setIsConnected(false);

                    // Only check localStorage when NOT in World App
                    const storedVerified = localStorage.getItem('worldId_verified');
                    const storedNullifier = localStorage.getItem('worldId_nullifier');

                    if (storedVerified === 'true' && storedNullifier) {
                        setIsWorldIdVerified(true);
                        setWorldIdNullifier(storedNullifier);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize MiniKit:', error);
                setIsConnected(false);
            } finally {
                setIsLoading(false);
            }
        };

        initializeMiniKit();
    }, []);

    const value: MiniKitContextType = {
        miniKit,
        isConnected,
        isLoading,
        worldAppVersion,
        safeAreaInsets,
        deviceOS,
        optedIntoOptionalAnalytics,
        // World ID verification state
        isWorldIdVerified,
        worldIdNullifier,
        setWorldIdVerified,
        clearWorldIdVerification,
    };

    return (
        <MiniKitContext.Provider value={value}>
            {children}
        </MiniKitContext.Provider>
    );
}

export function useMiniKit() {
    const context = useContext(MiniKitContext);
    if (context === undefined) {
        throw new Error('useMiniKit must be used within a MiniKitProvider');
    }
    return context;
}

// Type declaration for window.WorldApp
declare global {
    interface Window {
        WorldApp?: {
            pending_notifications: number;
            supported_commands: Array<{
                name: string;
                supported_versions: number[];
            }>;
            world_app_version: number;
            safe_area_insets: {
                top: number;
                right: number;
                bottom: number;
                left: number;
            };
            device_os: string;
            is_optional_analytics: boolean;
        };
    }
} 