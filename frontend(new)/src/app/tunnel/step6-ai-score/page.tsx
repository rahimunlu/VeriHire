'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Brain, TrendingUp, Star, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TrustScoreBreakdown {
  employment_verification: number;
  career_progression: number;
  skill_consistency: number;
  timeline_consistency: number;
  online_presence: number;
  overall_rating: number;
}

interface TrustScoreData {
  score: number;
  breakdown: TrustScoreBreakdown;
  analysis: string;
  recommendations: string[];
  badge_tier: string;
  risk_factors?: string[];
  strengths?: string[];
}

export default function AiScoreStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [scoreData, setScoreData] = useState<TrustScoreData | null>(null);

  // NFT minting state
  const [walletAddress, setWalletAddress] = useState('');
  const [nftMintingLoading, setNftMintingLoading] = useState(false);
  const [nftMintingError, setNftMintingError] = useState('');
  const [nftMintingSuccess, setNftMintingSuccess] = useState(false);
  const [nftData, setNftData] = useState<any>(null);

  useEffect(() => {
    calculateTrustScore();
  }, []);

  const calculateTrustScore = async () => {
    try {
      // Get nullifier hash from localStorage
      const nullifierHash = localStorage.getItem('worldId_nullifier');
      if (!nullifierHash) {
        throw new Error('Please verify your identity first');
      }

      setIsLoading(true);
      setError('');

      const response = await fetch('/api/candidate/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: nullifierHash }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate trust score');
      }

      // Map the API response to match our interface
      const mappedData: TrustScoreData = {
        score: data?.score || 30,
        breakdown: {
          employment_verification: data.breakdown?.verification_rate || 0,
          career_progression: data.breakdown?.career_progression || 0,
          skill_consistency: data.breakdown?.response_quality || 0,
          timeline_consistency: data.breakdown?.timeline_consistency || 0,
          online_presence: data.breakdown?.online_presence || 0,
          overall_rating: data.breakdown?.overall_rating || data?.score || 30,
        },
        analysis: data.analysis || 'No analysis available',
        recommendations: data.recommendations || [],
        badge_tier: data.badge_tier || getBadgeTier(data?.score || 30),
        risk_factors: data.risk_factors || [],
        strengths: data.strengths || [],
      };

      console.log('Mapped data:', mappedData);
      setScoreData(mappedData);

      // Store trust score data in localStorage
      localStorage.setItem('trustScoreData', JSON.stringify(mappedData));

    } catch (err: any) {
      console.error('Trust score calculation error:', err);
      setError(err.message || 'Failed to calculate trust score');
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeTier = (score: number): string => {
    if (score >= 90) return 'platinum';
    if (score >= 75) return 'gold';
    if (score >= 60) return 'silver';
    if (score >= 40) return 'bronze';
    return 'bronze';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-800';
    if (score >= 75) return 'text-blue-800';
    if (score >= 60) return 'text-yellow-800';
    if (score >= 40) return 'text-orange-800';
    return 'text-red-800';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 border-green-300';
    if (score >= 75) return 'bg-blue-100 border-blue-300';
    if (score >= 60) return 'bg-yellow-100 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getBadgeEmoji = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return '🏆';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⚪';
    }
  };

  const formatBreakdownKey = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleMintNFT = async () => {
    if (!walletAddress) {
      setNftMintingError('Please enter your wallet address');
      return;
    }

    // Basic wallet address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setNftMintingError('Please enter a valid Ethereum wallet address');
      return;
    }

    const nullifierHash = localStorage.getItem('worldId_nullifier');
    if (!nullifierHash) {
      setNftMintingError('World ID verification required');
      return;
    }

    setNftMintingLoading(true);
    setNftMintingError('');
    setNftMintingSuccess(false);

    try {
      const response = await fetch('/api/credential/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: nullifierHash,
          walletAddress: walletAddress.trim()
        }),
      });

      const data = await response.json();
      console.log('NFT Minting API Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      console.log('NFT Data received:', {
        tokenId: data.tokenId,
        transactionHash: data.transactionHash,
        trustScore: data.trustScore,
        verificationCount: data.verificationCount,
        tokenURI: data.tokenURI
      });

      setNftData(data);
      setNftMintingSuccess(true);

    } catch (err: any) {
      console.error('NFT minting error:', err);
      setNftMintingError(err.message || 'Failed to mint NFT');
    } finally {
      setNftMintingLoading(false);
    }
  };

  const handleRetry = () => {
    calculateTrustScore();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-[60vh]">
        <div className="relative">
          <Brain className="w-12 h-12 text-primary mb-6" />
        </div>
        <h2 className="text-2xl font-bold font-headline mb-2">Calculating Trust Score...</h2>
        <p className="text-muted-foreground max-w-xs">
          Our ASI-powered AI is analyzing your verified credentials and calculating your trust score.
        </p>
      </div>
    );
  }

  if (error) {
    return (
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
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleRetry}
                className="flex-1 rounded-full h-12 text-base font-semibold"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/tunnel/step5-verification-tracker')}
                variant="outline"
                className="flex-1 rounded-full h-12 text-base font-semibold"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="p-4">
        <Card className="w-full max-w-md mx-auto border-none shadow-none">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No score data available</p>
            <Button onClick={handleRetry} className="mt-4">
              Calculate Score
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-md mx-auto border-none shadow-none text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Your AI Trust Score</CardTitle>
          <CardDescription>
            This score reflects the strength of your verified credentials and professional profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 overflow-hidden">
          {/* Main Score Display */}
          <div className={`mx-auto w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center ${getScoreBgColor(scoreData.score)}`}>
            <p className={`text-5xl font-bold ${getScoreColor(scoreData.score)}`}>
              {scoreData.score}
            </p>
            <p className={`text-sm font-medium ${getScoreColor(scoreData.score)}`}>
              {getScoreLabel(scoreData.score)}
            </p>
          </div>

          {/* Badge Tier */}
          {scoreData.badge_tier && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">{getBadgeEmoji(scoreData.badge_tier)}</span>
                <span className="font-semibold text-gray-700 capitalize">
                  {scoreData.badge_tier} Badge
                </span>
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          {scoreData.breakdown && (
            <div className="bg-white border rounded-xl p-4">
              <h3 className="text-left font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Score Breakdown
              </h3>
              <div className="space-y-2">
                {Object.entries(scoreData.breakdown)
                  .filter(([key]) => key !== 'overall_rating')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-left">
                        {formatBreakdownKey(key)}
                      </span>
                      <span className={`text-sm font-semibold ${getScoreColor(value as number)}`}>
                        {value}/100
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {scoreData.analysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Analysis
              </h4>
              <p className="text-sm text-blue-700">{scoreData.analysis}</p>
            </div>
          )}

          {/* Recommendations */}
          {scoreData.recommendations && scoreData.recommendations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
              <h4 className="font-semibold text-green-800 mb-2">
                💡 Recommendations
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                {scoreData.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {scoreData.strengths && scoreData.strengths.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">
                ⭐ Strengths
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {scoreData.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {scoreData.risk_factors && scoreData.risk_factors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Risk Factors
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {scoreData.risk_factors.slice(0, 3).map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!nftMintingSuccess ? (
              <div className="space-y-4">
                {/* Wallet Address Input */}
                <div className="bg-white border rounded-xl p-4 max-w-full">
                  <h3 className="font-semibold mb-3 text-left">Create Soul-Bound NFT Credential</h3>
                  <p className="text-sm text-muted-foreground mb-4 text-left">
                    Enter your wallet address to mint your verified trust credential as an NFT on World Chain
                  </p>
                  <Input
                    type="text"
                    placeholder="0x... (Your wallet address)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="mb-3 w-full"
                  />
                  {nftMintingError && (
                    <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive">{nftMintingError}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* <Button
                      onClick={() => router.push('/tunnel/step5-verification-tracker')}
                      variant="outline"
                      className="flex-1 rounded-full h-12 text-base font-semibold"
                      disabled={nftMintingLoading}
                    >
                      Back to Status
                    </Button> */}
                    <Button
                      onClick={handleMintNFT}
                      disabled={nftMintingLoading || !walletAddress.trim()}
                      className="flex-1 rounded-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {nftMintingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Minting NFT...
                        </>
                      ) : (
                        <>
                          <Star className="w-5 h-5 mr-2" />
                          Mint ZK Soulbound NFT
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* NFT Minting Success */
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-300 mb-2">NFT Minted Successfully!</h3>
                  <p className="text-green-800">Your trust credential is now a soul-bound NFT on World Chain</p>
                </div>

                {nftData && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-800">Token ID:</span>
                      <span className="text-green-700 font-mono">#{nftData.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Trust Score:</span>
                      <span className="text-green-700 font-semibold">{nftData.trustScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Verifications:</span>
                      <span className="text-green-700">{nftData.verificationCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-800">Transaction:</span>
                      <a
                        href={`https://worldscan.org/tx/${nftData.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-900 hover:text-green-700 underline font-mono text-xs"
                      >
                        {nftData.transactionHash?.slice(0, 8)}...{nftData.transactionHash?.slice(-8)}
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push('/tunnel/step5-verification-tracker')}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                      Back to Status
                    </button>
                    <button
                      onClick={() => {
                        if (nftData?.tokenURI) {
                          window.open(nftData.tokenURI, '_blank');
                        }
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                    >
                      View NFT Metadata
                    </button>
                  </div>
                  <button
                    onClick={() => router.push('/tunnel/step8-rewards')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    Continue to Rewards →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Score Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              🎯 <strong>Trust Score Benefits:</strong> Higher scores unlock better job matches,
              premium features, and increased visibility to recruiters.
            </p>
          </div>

          {/* Token Reward */}
          <p className="text-sm text-center font-semibold text-green-600">
            +{Math.floor(scoreData.score / 10) * 5} TRUST tokens earned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
