'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Mail, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WorldAppLayout } from "@/components/world-app-layout";

export default function CollectEmailStep() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleContinue = async () => {
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Get the existing parsed resume from localStorage
            const storedResume = localStorage.getItem('parsedResume');
            if (storedResume) {
                const parsedResume = JSON.parse(storedResume);

                // Add the email to the parsed resume
                parsedResume.email = email;

                // Store the updated resume back to localStorage
                localStorage.setItem('parsedResume', JSON.stringify(parsedResume));

                // Navigate to add employers step
                router.push('/tunnel/step4-add-employers');
            } else {
                setError('Resume data not found. Please go back and upload your CV again.');
            }
        } catch (err) {
            console.error('Error updating resume with email:', err);
            setError('Failed to save email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <WorldAppLayout>
            <div className="p-4">
                <Card className="w-full max-w-md mx-auto border-none shadow-none">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-headline">Your Email Address</CardTitle>
                        <CardDescription>
                            We need your email address to send verification requests to your employers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    className="pl-10 h-12 text-base"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full rounded-full h-12 text-base font-semibold"
                        >
                            {isLoading ? 'Saving...' : 'Continue'}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-800 text-sm">
                                📧 <strong>Privacy Note:</strong> Your email will only be used to send verification requests to your employers and provide updates about your verification status.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </WorldAppLayout>
    );
} 