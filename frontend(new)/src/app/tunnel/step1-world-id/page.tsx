'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Loader2, AlertCircle, Smartphone } from 'lucide-react';
import { WorldAppLayout } from '@/components/world-app-layout';
import { useMiniKit } from '@/components/minikit-provider';
import { useWorldMiniApp } from '@/hooks/use-world-mini-app';
import { useWorldIdVerification } from '@/hooks/use-world-id-verification';

export default function WorldIdStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // World Mini App context
  const { isConnected, worldAppVersion, deviceOS } = useMiniKit();
  const { share } = useWorldMiniApp();

  // World ID verification context (with required=false since this is the verification page)
  const { isVerified, nullifier, verifyWorldId } = useWorldIdVerification({ required: false });

  // Get World ID configuration
  const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_test";
  const ACTION = "trust-match-verification";

  useEffect(() => {
    setMounted(true);

    // If user is in World App, they're already verified - redirect immediately
    if (isConnected) {
      console.log('User is in World App - automatically verified');
      router.push('/tunnel/step2-upload-cv');
      return;
    }

    // If already verified, redirect to next step after a delay
    if (isVerified) {
      setTimeout(() => {
        router.push('/tunnel/step2-upload-cv');
      }, 1500);
    }
  }, [isVerified, router, isConnected]);

  if (!mounted) {
    return (
      <WorldAppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </WorldAppLayout>
    );
  }

  const handleVerify = async (proof: ISuccessResult) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending proof to backend:', proof);

      // Add World Mini App context to the proof
      const proofWithContext = {
        ...proof,
        worldApp: {
          isConnected,
          worldAppVersion,
          deviceOS,
          timestamp: new Date().toISOString(),
        }
      };

      const response = await fetch('/api/auth/world-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proofWithContext),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok && data.success) {
        verifyWorldId(data.nullifier_hash);
        localStorage.setItem('worldApp_connected', isConnected.toString());
        console.log('World ID verification successful:', data);

        // Auto-navigate to next step after brief delay
        setTimeout(() => {
          router.push('/tunnel/step2-upload-cv');
        }, 1500);
      } else {
        console.error('Verification failed:', data);
        const errorDetail = data.details ? ` (${JSON.stringify(data.details)})` : '';
        setError(`Verification failed: ${data.error || 'Unknown error'}${errorDetail}`);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Network error during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSuccess = () => {
    console.log('World ID verification completed successfully');
  };

  if (isVerified) {
    return (
      <WorldAppLayout>
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-headline text-green-600">Verified!</CardTitle>
              <CardDescription>
                Identity confirmed with World ID. Redirecting to CV upload...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Nullifier: {nullifier?.slice(0, 8)}...{nullifier?.slice(-8)}
                  </p>
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
                </div>

                {/* World Mini App Status */}
                {isConnected && (
                  <div className="flex items-center justify-center gap-2 text-xs text-green-600">
                    <Smartphone className="w-3 h-3" />
                    <span>Verified in World App</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </WorldAppLayout>
    );
  }

  return (
    <WorldAppLayout>
      <div className="p-4">
        <Card className="w-full max-w-md mx-auto border-none shadow-none">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-headline">Verify Your Identity</CardTitle>
            <CardDescription>
              Secure biometric verification powered by World ID.
              {isConnected ? 'Running in World App' : 'No personal data is stored.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-green-500 text-xl mb-1">⚡</div>
                  <div className="text-xs">Instant verification</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-blue-500 text-xl mb-1">🔒</div>
                  <div className="text-xs">Privacy preserved</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-purple-500 text-xl mb-1">🛡️</div>
                  <div className="text-xs">Sybil-proof</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-3 text-center">
                  <div className="text-orange-500 text-xl mb-1">🌐</div>
                  <div className="text-xs">Global access</div>
                </div>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">Configuration Status:</p>
              <div className="space-y-1">
                <p className="text-xs">App ID: {APP_ID}</p>
                <p className="text-xs">Action: {ACTION}</p>
                <p className="text-xs">Verification: Device Level</p>
                {isConnected && (
                  <>
                    <p className="text-xs">World App: v{worldAppVersion}</p>
                    <p className="text-xs">Device OS: {deviceOS}</p>
                  </>
                )}
              </div>
              {APP_ID === "app_staging_test" && (
                <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>Using test configuration</span>
                </div>
              )}
              {isConnected && (
                <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                  <Smartphone className="w-3 h-3" />
                  <span>World Mini App Connected</span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <IDKitWidget
                app_id={APP_ID}
                action={ACTION}
                onSuccess={onSuccess}
                handleVerify={handleVerify}
                verification_level={VerificationLevel.Device}
              >
                {({ open }: { open: () => void }) => (
                  <Button
                    onClick={open}
                    disabled={isLoading}
                    className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify with World ID
                      </>
                    )}
                  </Button>
                )}
              </IDKitWidget>

              <p className="text-xs text-center text-muted-foreground">
                Secure biometric verification • No personal data stored
              </p>
            </div>

            {APP_ID === "app_staging_test" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  📝 <strong>Setup Required:</strong> Create your World ID app at{' '}
                  <a
                    href="https://developer.worldcoin.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-600"
                  >
                    developer.worldcoin.org
                  </a>
                </p>
                <p className="text-yellow-700 text-xs mt-2">
                  See frontend/SETUP_GUIDE.md for instructions
                </p>
              </div>
            )}

            {/* Share success functionality for World Mini App */}
            {isConnected && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Share your VeriHire profile after verification
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => share({
                    text: "I'm building my verified career profile on VeriHire! 🚀",
                    url: window.location.origin
                  })}
                  className="text-xs"
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  Share VeriHire
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WorldAppLayout>
  );
}
