'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Clock, Loader2, Send, AlertCircle, ChevronRight, RefreshCw, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Pie, Cell, Tooltip } from 'recharts';
import { useWorldIdVerification } from '@/hooks/use-world-id-verification';
import { WorldAppLayout } from '@/components/world-app-layout';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });

interface VerificationRequest {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  managerEmail: string;
  managerLinkedIn?: string;
  managerName?: string;
}

interface VerificationStatus {
  id: string;
  company: string;
  position: string;
  employer_email: string;
  status: 'pending' | 'sent' | 'verified' | 'rejected';
  verified?: boolean;
  created_at: string;
  updated_at?: string;
}

interface CandidateStatus {
  verificationRequests: VerificationStatus[];
  verifications: any[];
  resume?: any;
  credential?: any;
}

const user = {
  name: "Ayşe Yılmaz",
  profile_image: "https://placehold.co/100x100.png",
};

export default function VerificationTrackerStep() {
  const router = useRouter();
  const { isVerified, nullifier, isLoading: verificationLoading, isConnectedToWorldApp } = useWorldIdVerification();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [statusData, setStatusData] = useState<CandidateStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch verification status from API
  const fetchVerificationStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }

      // Get nullifier from World ID verification
      if (!nullifier) {
        throw new Error('Please verify your identity first');
      }

      const response = await fetch(`/api/candidate/status?candidateId=${nullifier}`);
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      setStatusData(data);
      setLastUpdated(new Date());
      setError('');
    } catch (err: any) {
      console.error('Error fetching verification status:', err);
      setError(err.message || 'Failed to fetch verification status');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Get verification requests from localStorage
    const storedRequests = localStorage.getItem('verificationRequests');
    if (storedRequests) {
      try {
        const requests: VerificationRequest[] = JSON.parse(storedRequests);
        setVerificationRequests(requests);
      } catch (err) {
        console.error('Error parsing verification requests:', err);
      }
    }

    // Only fetch if nullifier is available
    if (nullifier) {
      fetchVerificationStatus();
      setIsLoading(false);

      // Set up polling every 10 seconds
      const interval = setInterval(() => fetchVerificationStatus(), 10000);

      return () => clearInterval(interval);
    }
  }, [nullifier]);

  // Calculate verification statistics
  const getVerificationStats = () => {
    if (!statusData) {
      return {
        verified: 0,
        pending: verificationRequests.length,
        rejected: 0,
        total: verificationRequests.length
      };
    }

    const verifications = statusData.verifications || [];
    const requests = statusData.verificationRequests || [];

    const verified = verifications.filter(v => v.verified).length;
    const rejected = verifications.filter(v => v.verified === false).length;
    const pending = Math.max(0, requests.length - verifications.length);

    return {
      verified,
      pending,
      rejected,
      total: requests.length
    };
  };

  const stats = getVerificationStats();

  const verificationData = [
    { name: 'Verified', value: stats.verified, color: '#10b981' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ].filter(item => item.value > 0); // Only show categories with values > 0

  // Get status for a specific verification request
  const getRequestStatus = (company: string, position: string) => {
    if (!statusData) return 'pending';

    const request = statusData.verificationRequests?.find(
      req => req.company?.toLowerCase() === company.toLowerCase() &&
        req.position?.toLowerCase() === position.toLowerCase()
    );

    if (!request) return 'pending';

    const verification = statusData.verifications?.find(
      ver => ver.candidate_id === request.candidate_id &&
        ver.company?.toLowerCase() === company.toLowerCase()
    );

    if (verification) {
      return verification.verified ? 'verified' : 'rejected';
    }

    return 'sent';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'sent':
        return 'Sent';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'sent':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const handleContinue = () => {
    router.push('/tunnel/step5a-add-links');
  };

  const handleRefresh = () => {
    fetchVerificationStatus(true);
  };

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

  if (error && !statusData) {
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
                onClick={() => router.push('/tunnel/step4-add-employers')}
                className="w-full mt-4 rounded-full h-12 text-base font-semibold"
              >
                Go Back to Add Employers
              </Button>
            </CardContent>
          </Card>
        </div>
      </WorldAppLayout>
    );
  }

  return (
    <WorldAppLayout>
      <div className="p-4 space-y-4">
        <Card className="w-full max-w-md mx-auto border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Verification Tracker</CardTitle>
            <CardDescription>
              Track the status of your employment verification requests in real-time.
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
          <CardContent className="space-y-4">
            {/* Overview Chart */}
            {verificationData.length > 0 && (
              <Card>
                <CardHeader className="p-3 pb-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">Overview</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex justify-center items-center">
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={verificationData}
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {verificationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.verified}</div>
                  <div className="text-xs text-muted-foreground">Verified</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-xs text-muted-foreground">Rejected</div>
                </div>
              </Card>
            </div>

            {/* Individual Request Status */}
            {verificationRequests.length > 0 && (
              <Card>
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium">Request Status</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {verificationRequests.map((request, index) => {
                    const status = getRequestStatus(request.company, request.position);
                    return (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={`https://logo.clearbit.com/${request.company.toLowerCase()}.com`} />
                            <AvatarFallback className="text-xs">
                              {request.company.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{request.position}</p>
                            <p className="text-xs text-muted-foreground">{request.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                            {getStatusText(status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue to Online Presence
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                ⏱️ <strong>Real-time Updates:</strong> This page automatically refreshes every 10 seconds.
                You can continue to the next step anytime.
              </p>
            </div>

            {/* No Requests Message */}
            {verificationRequests.length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No verification requests sent</p>
                <p className="text-xs text-muted-foreground mt-2">
                  You can continue to the next step or go back to add employers
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WorldAppLayout>
  );
}
