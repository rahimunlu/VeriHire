"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, Shield, Smartphone, Loader2, ExternalLink, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useMiniKit } from "@/components/minikit-provider";
import { useWorldIdVerification } from "@/hooks/use-world-id-verification";
import { toast } from "@/hooks/use-toast";
import { WorldAppLayout } from '@/components/world-app-layout';

// Add these utility functions after the imports
const generateWorldAppLink = (currentUrl: string) => {
    // World App deep link format
    const worldAppUrl = `https://worldapp.org/verify/${encodeURIComponent(currentUrl)}`;
    return worldAppUrl;
};

const detectMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Separate component that uses useSearchParams
function VerifyEmploymentContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [loading, setLoading] = useState(true);
    const [verificationData, setVerificationData] = useState<any>(null);
    const [error, setError] = useState("");
    const [submitStatus, setSubmitStatus] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [worldIdProof, setWorldIdProof] = useState<any>(null);

    // Mini app SDK hooks
    const { isConnected, worldAppVersion, deviceOS, isWorldIdVerified, worldIdNullifier } = useMiniKit();
    const { isVerified, nullifier, verifyWorldId } = useWorldIdVerification({ required: false });

    // World ID config
    const APP_ID = process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_test";
    const ACTION = "trust-match-verification";

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    useEffect(() => {
        if (!token) {
            setError("Missing verification token.");
            setLoading(false);
            return;
        }
        fetch(`/api/verification/verify-employment?token=${token}`)
            .then(async (res) => {
                if (!res.ok) throw new Error("Invalid or expired verification link.");
                const data = await res.json();
                setVerificationData(data.verificationData);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [token]);

    const handleWorldIdVerify = async (proof: ISuccessResult) => {
        setIsVerifying(true);
        try {
            console.log('Sending proof to backend:', proof);

            // Add World App context to the proof
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
                setWorldIdProof(proof);
                console.log('World ID verification successful:', data);

                toast({
                    title: "World ID Verified",
                    description: "Successfully verified your identity",
                });
            } else {
                console.error('Verification failed:', data);
                throw new Error(data.error || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast({
                title: "Verification Failed",
                description: error instanceof Error ? error.message : "Failed to verify World ID",
                variant: "destructive",
            });
            throw error; // Re-throw to let IDKit handle it
        } finally {
            setIsVerifying(false);
        }
    };

    const handleWorldIdSuccess = () => {
        console.log('World ID verification completed successfully');
    };

    const handleVerify = async (answer: "yes" | "no") => {
        if (!token) return;

        // Check if user is properly verified
        let userNullifier = null;
        let userProof = null;

        if (isConnected) {
            // User is in World App - already verified
            userNullifier = worldIdNullifier;
        } else if (isVerified && worldIdProof) {
            // User verified via IDKit
            userNullifier = worldIdProof.nullifier_hash;
            userProof = worldIdProof;
        } else {
            toast({
                title: "Verification Required",
                description: "Please verify your identity with World ID first",
                variant: "destructive",
            });
            return;
        }

        if (!userNullifier) {
            toast({
                title: "Verification Required",
                description: "Please verify your identity with World ID first",
                variant: "destructive",
            });
            return;
        }

        setSubmitStatus("Submitting...");

        try {
            const requestBody: any = {
                token,
                answer,
                nullifier_hash: userNullifier,
                verification_level: "device",
                worldApp: {
                    isConnected,
                    worldAppVersion,
                    deviceOS,
                }
            };

            // Include full proof for non-World App users
            if (userProof && !isConnected) {
                requestBody.proof = userProof.proof;
                requestBody.merkle_root = userProof.merkle_root;
            }

            const res = await fetch("/api/verification/verify-employment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();
            if (res.ok) {
                setSubmitStatus("Verification submitted. Thank you!");
                toast({
                    title: "Success",
                    description: "Employment verification submitted successfully",
                });
            } else {
                setSubmitStatus(data.error || "Failed to submit verification.");
                toast({
                    title: "Error",
                    description: data.error || "Failed to submit verification",
                    variant: "destructive",
                });
            }
        } catch (error) {
            setSubmitStatus("Network error. Please try again.");
            toast({
                title: "Network Error",
                description: "Please check your connection and try again",
                variant: "destructive",
            });
        }
    };

    const isUserVerified = isConnected || (isVerified && worldIdProof);

    if (loading) return (
        <WorldAppLayout>
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mt-1"></div>
                    </div>
                </div>
                <div className="text-center">Loading verification...</div>
            </div>
        </WorldAppLayout>
    );

    if (error) return (
        <WorldAppLayout>
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-red-200">
                        <AvatarFallback className="bg-red-100 text-red-600">
                            <Shield className="w-6 h-6" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold font-headline">Employment Verification</h1>
                        <p className="text-sm text-muted-foreground">Secure verification system</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center text-red-500">{error}</div>
                    </CardContent>
                </Card>
            </div>
        </WorldAppLayout>
    );

    if (!verificationData) return (
        <WorldAppLayout>
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <Shield className="w-6 h-6" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold font-headline">Employment Verification</h1>
                        <p className="text-sm text-muted-foreground">Secure verification system</p>
                    </div>
                </div>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">No verification data found.</div>
                    </CardContent>
                </Card>
            </div>
        </WorldAppLayout>
    );

    return (
        <WorldAppLayout>
            <div className="p-4 space-y-4">
                {/* World App Guidance */}
                <WorldAppGuidance />

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/50">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            <Shield className="w-6 h-6" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold font-headline">Employment Verification</h1>
                        <p className="text-sm text-muted-foreground">Secure verification system</p>
                        {isConnected && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                Running in World App
                            </p>
                        )}
                    </div>
                </div>

                {/* Verification Request */}
                <div className="space-y-2">
                    <h3 className="text-base font-semibold px-1">Verification Request</h3>
                    <motion.div className="space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                        <motion.div variants={itemVariants}>
                            <Card className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-lg">{verificationData.candidateName}</h4>
                                            <Badge variant="outline" className="flex items-center gap-1.5 border-yellow-400 bg-yellow-50 text-yellow-700">
                                                <Clock className="w-3 h-3 animate-pulse" /> New
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p><strong>Position:</strong> {verificationData.position}</p>
                                            <p><strong>Company:</strong> {verificationData.company}</p>
                                            <p><strong>Email:</strong> {verificationData.candidateEmail}</p>
                                            {verificationData.startDate && (
                                                <p><strong>Start Date:</strong> {verificationData.startDate}</p>
                                            )}
                                            {verificationData.endDate && (
                                                <p><strong>End Date:</strong> {verificationData.endDate}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* World ID Status */}
                                {isConnected && (
                                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">
                                                Verified via World App
                                            </span>
                                        </div>
                                        {worldAppVersion && (
                                            <p className="text-xs text-green-700 mt-1">
                                                World App v{worldAppVersion} • {deviceOS}
                                            </p>
                                        )}
                                        {worldIdNullifier && (
                                            <p className="text-xs text-green-700 mt-1">
                                                ID: {worldIdNullifier.slice(0, 8)}...{worldIdNullifier.slice(-8)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!isUserVerified ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800">
                                                <Shield className="w-4 h-4 inline mr-1" />
                                                Please verify your identity with World ID before proceeding with the verification.
                                            </p>
                                        </div>

                                        {/* IDKit Widget for non-World App users */}
                                        <IDKitWidget
                                            app_id={APP_ID}
                                            action={ACTION}
                                            onSuccess={handleWorldIdSuccess}
                                            handleVerify={handleWorldIdVerify}
                                            verification_level={VerificationLevel.Device}
                                        >
                                            {({ open }: { open: () => void }) => (
                                                <Button
                                                    onClick={open}
                                                    disabled={isVerifying}
                                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 text-base font-semibold"
                                                >
                                                    {isVerifying ? (
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
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <p className="text-sm text-green-800">
                                                <Shield className="w-4 h-4 inline mr-1" />
                                                Identity verified. You can now proceed with the employment verification.
                                            </p>
                                            {!isConnected && worldIdProof && (
                                                <p className="text-xs text-green-700 mt-1">
                                                    ID: {worldIdProof.nullifier_hash?.slice(0, 8)}...{worldIdProof.nullifier_hash?.slice(-8)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleVerify("yes")}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full h-12 font-semibold"
                                                disabled={submitStatus === "Submitting..."}
                                            >
                                                <Check className="w-4 h-4 mr-1.5" /> Verify Employment
                                            </Button>
                                            <Button
                                                onClick={() => handleVerify("no")}
                                                variant="destructive"
                                                className="flex-1 rounded-full h-12 font-semibold"
                                                disabled={submitStatus === "Submitting..."}
                                            >
                                                <X className="w-4 h-4 mr-1.5" /> Decline
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {submitStatus && (
                                    <div className="mt-3 text-sm text-center p-3 bg-gray-50 rounded-lg border">
                                        {submitStatus}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </WorldAppLayout>
    );
}

// Loading component for Suspense fallback
function LoadingFallback() {
    return (
        <WorldAppLayout>
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mt-1"></div>
                    </div>
                </div>
                <div className="text-center">Loading verification...</div>
            </div>
        </WorldAppLayout>
    );
}

// Add this component before VerifyEmploymentContent
function WorldAppGuidance() {
    const { isConnected } = useMiniKit();
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        // Show instructions if not in World App
        if (!isConnected) {
            setShowInstructions(true);
        }
    }, [isConnected]);

    if (isConnected || !showInstructions) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">
                        For the best experience, open in World App
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                        This verification link works best when opened in World App. Your identity will be automatically verified.
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-blue-800">Copy this link and open it in World App</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            <span className="text-blue-800">Or continue here with World ID verification</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast({ title: "Link copied!", description: "Open World App and paste the link" });
                            }}
                            className="text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                            Copy Link
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowInstructions(false)}
                            className="text-blue-700 hover:bg-blue-50"
                        >
                            Continue Here
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main page component with Suspense boundary
export default function VerifyEmploymentPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyEmploymentContent />
        </Suspense>
    );
} 