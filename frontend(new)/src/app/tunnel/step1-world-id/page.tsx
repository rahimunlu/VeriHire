'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function WorldIdStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [nullifierHash, setNullifierHash] = useState<string>('');

  // Get World ID configuration
  const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_test";
  const ACTION = "trust-match-verification";

  const handleVerify = async (proof: ISuccessResult) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Sending proof to backend:', proof);

      const response = await fetch('/api/auth/world-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proof),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok && data.success) {
        setIsVerified(true);
        setNullifierHash(data.nullifier_hash);
        // Store in localStorage for use in other steps
        localStorage.setItem('worldId_nullifier', data.nullifier_hash);
        localStorage.setItem('worldId_verified', 'true');
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
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Nullifier: {nullifierHash.slice(0, 8)}...{nullifierHash.slice(-8)}
              </p>
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
            Secure biometric verification powered by World ID. No personal data is stored.
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
            </div>
            {APP_ID === "app_staging_test" && (
              <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600">
                <AlertCircle className="w-3 h-3" />
                <span>Using test configuration</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
