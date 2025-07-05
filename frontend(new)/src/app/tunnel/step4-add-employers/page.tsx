'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Linkedin, Mail, Shield, AlertCircle, CheckCircle, Loader2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWorldIdVerification } from "@/hooks/use-world-id-verification";
import { WorldAppLayout } from "@/components/world-app-layout";

interface WorkExperience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
}

interface VerificationRequest {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  managerEmail: string;
  managerLinkedIn?: string;
  managerName?: string;
}

export default function AddEmployersStep() {
  const router = useRouter();
  const { isVerified, nullifier, isLoading: verificationLoading, isConnectedToWorldApp } = useWorldIdVerification();
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sentRequests, setSentRequests] = useState(0);

  useEffect(() => {
    // Get confirmed work experiences from localStorage
    const storedExperiences = localStorage.getItem('confirmedWorkExperiences');
    if (storedExperiences) {
      try {
        const experiences: WorkExperience[] = JSON.parse(storedExperiences);
        setWorkExperiences(experiences);

        // Initialize verification requests
        const initialRequests: VerificationRequest[] = experiences.map(exp => ({
          company: exp.company || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          managerEmail: '',
          managerLinkedIn: '',
          managerName: ''
        }));

        setVerificationRequests(initialRequests);
      } catch (err) {
        console.error('Error parsing work experiences:', err);
        setError('Failed to load work experiences. Please go back and confirm your CV.');
      }
    } else {
      setError('No work experiences found. Please go back and confirm your CV.');
    }
  }, []);

  const handleRequestUpdate = (index: number, field: keyof VerificationRequest, value: string) => {
    const updatedRequests = [...verificationRequests];
    updatedRequests[index] = { ...updatedRequests[index], [field]: value };
    setVerificationRequests(updatedRequests);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendRequests = async () => {
    // Validate that at least one request has an email
    const validRequests = verificationRequests.filter(req => req.managerEmail.trim() !== '');

    if (validRequests.length === 0) {
      setError('Please provide at least one manager email address.');
      return;
    }

    // Validate email formats
    const invalidEmails = validRequests.filter(req => !validateEmail(req.managerEmail));
    if (invalidEmails.length > 0) {
      setError('Please provide valid email addresses for all managers.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);
    setSentRequests(0);

    try {
      // Get nullifier hash from World ID verification
      if (!nullifier) {
        throw new Error('Please verify your identity first');
      }

      // Get parsed resume data for candidate info
      const parsedResume = JSON.parse(localStorage.getItem('parsedResume') || '{}');
      const candidateName = parsedResume.name || 'Candidate';
      const candidateEmail = parsedResume.email || '';

      // Send verification requests for each valid entry
      const promises = validRequests.map(async (request, index) => {
        try {
          const response = await fetch('/api/verification/magic-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateId: nullifier,
              candidateName,
              candidateEmail,
              employerEmail: request.managerEmail,
              employerName: request.managerName,
              company: request.company,
              position: request.position,
              startDate: request.startDate,
              endDate: request.endDate,
              linkedInUrl: request.managerLinkedIn,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || `Failed to send verification to ${request.company}`);
          }

          setSentRequests(prev => prev + 1);
          return response.json();
        } catch (err) {
          console.error(`Error sending request for ${request.company}:`, err);
          throw err;
        }
      });

      await Promise.all(promises);

      setSuccess(true);

      // Store verification requests in localStorage
      localStorage.setItem('verificationRequests', JSON.stringify(validRequests));

      // Auto-navigate after brief delay
      setTimeout(() => {
        router.push('/tunnel/step5-verification-tracker');
      }, 2000);

    } catch (err: any) {
      console.error('Error sending verification requests:', err);
      setError(err.message || 'Failed to send verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow user to skip this step
    localStorage.setItem('verificationRequests', JSON.stringify([]));
    router.push('/tunnel/step5-verification-tracker');
  };

  if (error && workExperiences.length === 0) {
    return (
      <WorldAppLayout>
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardContent className="pt-6">
              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <p className="font-semibold text-destructive">Error</p>
                </div>
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button
                onClick={() => router.push('/tunnel/step3-parse-cv')}
                className="w-full mt-4 rounded-full h-12 text-base font-semibold"
              >
                Go Back to Confirm CV
              </Button>
            </CardContent>
          </Card>
        </div>
      </WorldAppLayout>
    );
  }

  if (success) {
    return (
      <WorldAppLayout>
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-headline text-green-600">Verification Requests Sent!</CardTitle>
              <CardDescription>
                Magic links have been sent to {sentRequests} manager(s). Redirecting to verification tracker...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        </div>
      </WorldAppLayout>
    );
  }

  // Show loading state if World ID verification is still loading
  if (verificationLoading) {
    return (
      <WorldAppLayout>
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
            <CardTitle className="text-2xl font-headline">Employer Information</CardTitle>
            <CardDescription>
              Provide verifier details for each role. We'll send them a secure verification link.
            </CardDescription>

            {/* World ID Status Indicator */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {isConnectedToWorldApp ? 'Verified via World App' : 'World ID Verified'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {verificationRequests.map((request, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{request.position || 'Position'}</p>
                    <p className="text-xs text-muted-foreground">{request.company || 'Company'}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.startDate && request.endDate
                        ? `${request.startDate} - ${request.endDate}`
                        : (request.startDate || request.endDate || 'Dates not specified')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`manager-name-${index}`} className="text-xs">Manager Name</Label>
                    <Input
                      id={`manager-name-${index}`}
                      value={request.managerName || ''}
                      onChange={(e) => handleRequestUpdate(index, 'managerName', e.target.value)}
                      placeholder="John Smith"
                      className="h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`manager-email-${index}`} className="text-xs">Manager Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id={`manager-email-${index}`}
                        type="email"
                        value={request.managerEmail}
                        onChange={(e) => handleRequestUpdate(index, 'managerEmail', e.target.value)}
                        placeholder="manager@company.com"
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`manager-linkedin-${index}`} className="text-xs">Manager LinkedIn (Optional)</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id={`manager-linkedin-${index}`}
                        value={request.managerLinkedIn || ''}
                        onChange={(e) => handleRequestUpdate(index, 'managerLinkedIn', e.target.value)}
                        placeholder="https://linkedin.com/in/manager"
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`manager-worldid-${index}`} className="text-xs">Manager World ID</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id={`manager-worldid-${index}`}
                        value=""
                        // onChange={(e) => handleRequestUpdate(index, 'managerWorldId', e.target.value)} 
                        placeholder="Enter World ID"
                        className="pl-10 h-9"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleSendRequests}
                disabled={isLoading}
                className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Requests... ({sentRequests}/{verificationRequests.filter(r => r.managerEmail).length})
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Verification Requests
                  </>
                )}
              </Button>

              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full rounded-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                Skip Verification
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                🔐 <strong>Secure Process:</strong> We send magic links to managers for one-click verification. No passwords or accounts required.
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              * Required fields • We'll only contact managers you specify
            </p>
          </CardContent>
        </Card>
      </div>
    </WorldAppLayout>
  );
}

