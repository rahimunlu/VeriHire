'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, ChevronRight, Link, Github, Linkedin, Twitter, Globe, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { WorldAppLayout } from '@/components/world-app-layout';

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
  placeholder: string;
  verified: boolean;
}

export default function AddLinksStep() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState('');
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      platform: 'LinkedIn',
      url: '',
      icon: <Linkedin className="w-4 h-4" />,
      placeholder: 'https://linkedin.com/in/yourprofile',
      verified: false
    },
    {
      platform: 'GitHub',
      url: '',
      icon: <Github className="w-4 h-4" />,
      placeholder: 'https://github.com/yourusername',
      verified: false
    },
    {
      platform: 'Twitter',
      url: '',
      icon: <Twitter className="w-4 h-4" />,
      placeholder: 'https://twitter.com/yourusername',
      verified: false
    },
    {
      platform: 'Portfolio',
      url: '',
      icon: <Globe className="w-4 h-4" />,
      placeholder: 'https://yourportfolio.com',
      verified: false
    }
  ]);

  // Handle auto-redirect when verification is complete
  useEffect(() => {
    if (verificationComplete) {
      const timer = setTimeout(() => {
        router.push('/tunnel/step6-ai-score');
      }, 2000);
      setRedirectTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [verificationComplete, router]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [redirectTimer]);

  const handleLinkChange = (index: number, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].url = value;
    setSocialLinks(updatedLinks);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleVerifyLinks = async () => {
    // Get only non-empty links
    const linksToVerify = socialLinks.filter(link => link.url.trim() !== '');

    if (linksToVerify.length === 0) {
      setError('Please add at least one social media or portfolio link to verify.');
      return;
    }

    // Validate URLs
    const invalidLinks = linksToVerify.filter(link => !validateUrl(link.url));
    if (invalidLinks.length > 0) {
      setError('Please provide valid URLs for all links.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Mock verification - always succeeds after 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mark all provided links as verified
      const updatedLinks = socialLinks.map(link => ({
        ...link,
        verified: link.url.trim() !== ''
      }));

      setSocialLinks(updatedLinks);

      // Store verified links in localStorage (only serializable data)
      const verifiedLinks = updatedLinks
        .filter(link => link.verified)
        .map(link => ({
          platform: link.platform,
          url: link.url,
          verified: link.verified
        }));

      localStorage.setItem('verifiedSocialLinks', JSON.stringify(verifiedLinks));

      // Set verification complete - this will trigger the useEffect redirect
      setVerificationComplete(true);

    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    // Store empty array for skipped verification
    localStorage.setItem('verifiedSocialLinks', JSON.stringify([]));
    router.push('/tunnel/step6-ai-score');
  };

  const handleContinue = () => {
    // Clear any existing timer and navigate immediately
    if (redirectTimer) clearTimeout(redirectTimer);
    router.push('/tunnel/step6-ai-score');
  };

  if (verificationComplete) {
    const verifiedCount = socialLinks.filter(link => link.verified).length;

    return (
      <WorldAppLayout>
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto border-none shadow-none">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-headline text-green-600">Links Verified!</CardTitle>
              <CardDescription>
                Successfully verified {verifiedCount} online presence link(s). Redirecting to trust score calculation...
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />

              {/* Fallback continue button in case auto-redirect fails */}
              <Button
                onClick={handleContinue}
                variant="outline"
                className="mt-4 rounded-full"
              >
                Continue Now
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
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
            <CardTitle className="text-2xl font-headline">Online Presence</CardTitle>
            <CardDescription>
              Add your social media and portfolio links to strengthen your professional profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={link.platform} className="space-y-2">
                  <Label htmlFor={`link-${index}`} className="flex items-center gap-2 text-sm">
                    {link.icon}
                    {link.platform}
                  </Label>
                  <Input
                    id={`link-${index}`}
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder={link.placeholder}
                    className="h-11"
                  />
                </div>
              ))}
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
              <Button
                onClick={handleVerifyLinks}
                disabled={isVerifying}
                className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent/50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Links...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Verify Online Presence
                  </>
                )}
              </Button>

              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full rounded-full h-12 text-base font-semibold"
                disabled={isVerifying}
              >
                Skip This Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✨ <strong>Boost Your Score:</strong> Adding verified social links can increase your trust score by demonstrating consistent professional presence.
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Optional step • Your privacy is protected • Links are only used for verification
            </p>
          </CardContent>
        </Card>
      </div>
    </WorldAppLayout>
  );
}
