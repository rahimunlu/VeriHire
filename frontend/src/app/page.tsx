'use client';

import React, { useState } from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [userType, setUserType] = useState<'candidate' | 'recruiter' | null>(null);
  const [nullifierHash, setNullifierHash] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Add candidate flow state
  const [candidateStep, setCandidateStep] = useState<'resume' | 'employer' | 'status' | 'ai-score'>('resume');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploadLoading, setResumeUploadLoading] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState('');
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false);

  const [employerEmail, setEmployerEmail] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState('');
  const [magicLinkSuccess, setMagicLinkSuccess] = useState(false);

  const [statusData, setStatusData] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Add AI score state
  const [aiScoreData, setAiScoreData] = useState<any>(null);
  const [aiScoreLoading, setAiScoreLoading] = useState(false);
  const [aiScoreError, setAiScoreError] = useState('');

  // Add NFT minting state
  const [nftMintingLoading, setNftMintingLoading] = useState(false);
  const [nftMintingError, setNftMintingError] = useState('');
  const [nftMintingSuccess, setNftMintingSuccess] = useState(false);
  const [nftData, setNftData] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');

  // Add state for parsed resume data
  const [parsedResume, setParsedResume] = useState<any>(null);

  // Add state for candidate name, email, start/end date
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      console.log('Response status:', response.status);

      if (response.ok) {
        setIsVerified(true);
        setNullifierHash(data.nullifier_hash);
        console.log('World ID verification successful:', data);
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
    console.log('World ID verification completed');
  };

  // Resume upload handler
  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;
    setResumeUploadLoading(true);
    setResumeUploadError('');
    setResumeUploadSuccess(false);
    setParsedResume(null);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('user_id', nullifierHash);
      const res = await fetch('/api/candidate/resume/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resume upload failed');
      setResumeUploadSuccess(true);
      setParsedResume(data.data);
      setCandidateStep('employer');
    } catch (err: any) {
      setResumeUploadError(err.message || 'Resume upload failed');
    } finally {
      setResumeUploadLoading(false);
    }
  };

  // When parsedResume changes, prefill candidateName and candidateEmail if available
  React.useEffect(() => {
    if (parsedResume) {
      // Try to extract from first work experience or education if available
      if (parsedResume.workExperience && parsedResume.workExperience.length > 0) {
        setCompany(parsedResume.workExperience[0].company || '');
        setPosition(parsedResume.workExperience[0].position || '');
        setStartDate(parsedResume.workExperience[0].startDate || '');
        setEndDate(parsedResume.workExperience[0].endDate || '');
      }
      // If you have logic to extract name/email from resume text, set here
      // setCandidateName(parsedResume.name || '');
      // setCandidateEmail(parsedResume.email || '');
    }
  }, [parsedResume]);

  // Magic link handler
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkLoading(true);
    setMagicLinkError('');
    setMagicLinkSuccess(false);
    try {
      const res = await fetch('/api/verification/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: nullifierHash,
          candidateName,
          candidateEmail,
          employerEmail,
          company,
          position,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Magic link request failed');
      setMagicLinkSuccess(true);
      setCandidateStep('status');
    } catch (err: any) {
      setMagicLinkError(err.message || 'Magic link request failed');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  // AI Score calculation handler
  const handleCalculateAiScore = async () => {
    setAiScoreLoading(true);
    setAiScoreError('');
    try {
      const res = await fetch('/api/candidate/ai-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: nullifierHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate trust score');
      setAiScoreData(data);
      setCandidateStep('ai-score');
    } catch (err: any) {
      setAiScoreError(err.message || 'Failed to calculate trust score');
    } finally {
      setAiScoreLoading(false);
    }
  };

  // NFT Minting handler
  const handleMintNFT = async () => {
    if (!walletAddress) {
      setNftMintingError('Please enter your wallet address');
      return;
    }

    setNftMintingLoading(true);
    setNftMintingError('');
    setNftMintingSuccess(false);

    try {
      const res = await fetch('/api/credential/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: nullifierHash,
          walletAddress: walletAddress.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      setNftData(data);
      setNftMintingSuccess(true);

    } catch (err: any) {
      setNftMintingError(err.message || 'Failed to mint NFT');
    } finally {
      setNftMintingLoading(false);
    }
  };

  // Status polling
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (userType === 'candidate' && candidateStep === 'status') {
      const fetchStatus = async () => {
        setStatusLoading(true);
        setStatusError('');
        try {
          const res = await fetch(`/api/candidate/status?candidateId=${nullifierHash}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to fetch status');
          setStatusData(data);
        } catch (err: any) {
          setStatusError(err.message || 'Failed to fetch status');
        } finally {
          setStatusLoading(false);
        }
      };
      fetchStatus();
      interval = setInterval(fetchStatus, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [userType, candidateStep, nullifierHash]);

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">VeriHire</h1>
              <p className="text-blue-100 text-lg">
                Revolutionary recruitment with verified credentials
              </p>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-100">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">⚡</div>
                  <div>Hours not weeks</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">🔒</div>
                  <div>Privacy preserved</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">💰</div>
                  <div>70%+ cost savings</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-green-400 text-2xl mb-2">🛡️</div>
                  <div>Sybil-proof</div>
                </div>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-blue-300 mb-2">Configuration Status:</p>
              <p className="text-xs text-white">App ID: {APP_ID}</p>
              <p className="text-xs text-white">Action: {ACTION}</p>
              <p className="text-xs text-white">Verification: Device Level (No Orb required)</p>
              {APP_ID === "app_staging_test" && (
                <p className="text-xs text-yellow-300 mt-2">
                  ⚠️ Using test configuration. See SETUP_GUIDE.md
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-blue-200 mb-4">
                Get started by verifying your identity with World ID (device verification)
              </p>

              <IDKitWidget
                app_id={APP_ID}
                action={ACTION}
                onSuccess={onSuccess}
                handleVerify={handleVerify}
                verification_level={VerificationLevel.Device}
              >
                {({ open }: { open: () => void }) => (
                  <button
                    onClick={open}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-xl transition-colors duration-200 shadow-lg"
                  >
                    {isLoading ? 'Verifying...' : 'Verify with World ID'}
                  </button>
                )}
              </IDKitWidget>
            </div>

            <p className="text-xs text-blue-300">
              Secure biometric verification • No personal data stored
            </p>

            {APP_ID === "app_staging_test" && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  📝 <strong>Setup Required:</strong> Create your World ID app at{' '}
                  <a
                    href="https://developer.worldcoin.org"
                    target="_blank"
                    className="underline hover:text-yellow-100"
                  >
                    developer.worldcoin.org
                  </a>
                </p>
                <p className="text-yellow-300 text-xs mt-2">
                  See <code>frontend/SETUP_GUIDE.md</code> for instructions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Verified!</h1>
              <p className="text-blue-100">
                Identity confirmed with World ID
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setUserType('candidate')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg"
              >
                <div className="text-left">
                  <div className="text-lg font-semibold">I'm a Candidate</div>
                  <div className="text-sm text-blue-100">Get verified credentials</div>
                </div>
              </button>

              <button
                onClick={() => setUserType('recruiter')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg"
              >
                <div className="text-left">
                  <div className="text-lg font-semibold">I'm a Recruiter</div>
                  <div className="text-sm text-purple-100">Find verified candidates</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'candidate') {
    // Step 1: Resume upload
    if (candidateStep === 'resume') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Your Resume</h2>
            <form onSubmit={handleResumeUpload} className="space-y-4">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={e => setResumeFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-blue-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              {resumeUploadError && <div className="text-red-300 text-sm">{resumeUploadError}</div>}
              <button
                type="submit"
                disabled={resumeUploadLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg"
              >
                {resumeUploadLoading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </form>
          </div>
        </div>
      );
    }
    // Step 2: Employer email/magic link
    if (candidateStep === 'employer') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Verify Employment</h2>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <input
                type="text"
                placeholder="Candidate Name (optional)"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
              />
              <input
                type="email"
                placeholder="Candidate Email (optional)"
                value={candidateEmail}
                onChange={e => setCandidateEmail(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
              />
              <input
                type="email"
                placeholder="Employer Email"
                value={employerEmail}
                onChange={e => setEmployerEmail(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
                required
              />
              <input
                type="text"
                placeholder="Company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
                required
              />
              <input
                type="text"
                placeholder="Position"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
                required
              />
              <input
                type="text"
                placeholder="Start Date (optional)"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
              />
              <input
                type="text"
                placeholder="End Date (optional)"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="block w-full rounded-lg p-3 bg-white/20 text-white placeholder-blue-200"
              />
              {magicLinkError && <div className="text-red-300 text-sm">{magicLinkError}</div>}
              <button
                type="submit"
                disabled={magicLinkLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg"
              >
                {magicLinkLoading ? 'Sending...' : 'Send Verification Link'}
              </button>
            </form>
          </div>
        </div>
      );
    }
    // Step 3: Status polling
    if (candidateStep === 'status') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Verification Status</h2>
            {statusLoading && <div className="text-blue-200">Loading status...</div>}
            {statusError && <div className="text-red-300 text-sm">{statusError}</div>}
            {statusData && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-blue-100 text-sm mb-1">Resume</div>
                  {statusData.resume ? (
                    <div className="text-green-300 text-sm">Uploaded: {statusData.resume.name || '✓'}</div>
                  ) : (
                    <div className="text-yellow-200 text-sm">Not uploaded</div>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-blue-100 text-sm mb-1">Verification Requests</div>
                  {statusData.verificationRequests && statusData.verificationRequests.length > 0 ? (
                    <ul className="text-blue-200 text-xs">
                      {statusData.verificationRequests.map((req: any, i: number) => (
                        <li key={i}>
                          {req.employer_email} - {req.status}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-yellow-200 text-sm">No requests sent</div>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-blue-100 text-sm mb-1">Verifications</div>
                  {statusData.verifications && statusData.verifications.length > 0 ? (
                    <ul className="text-green-200 text-xs">
                      {statusData.verifications.map((ver: any, i: number) => (
                        <li key={i}>
                          {ver.company} - {ver.verified ? 'Verified' : 'Rejected'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-yellow-200 text-sm">No verifications yet</div>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-blue-100 text-sm mb-1">Credential</div>
                  {statusData.credential ? (
                    <div className="text-green-300 text-sm">Issued: {statusData.credential.id || '✓'}</div>
                  ) : (
                    <div className="text-yellow-200 text-sm">Not issued</div>
                  )}
                </div>
              </div>
            )}

            {/* Show AI Score button when verifications are complete */}
            {/* {statusData && statusData.verifications && statusData.verifications.length > 0 && ( */}
            <div className="mt-6">
              {aiScoreError && <div className="text-red-300 text-sm mb-4">{aiScoreError}</div>}
              <button
                onClick={handleCalculateAiScore}
                disabled={aiScoreLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg"
              >
                {aiScoreLoading ? 'Calculating Trust Score...' : 'Calculate AI Trust Score'}
              </button>
              <p className="text-purple-200 text-xs mt-2 text-center">
                🤖 Powered by ASI Alliance AI
              </p>
            </div>
            {/* )} */}
          </div>
        </div>
      );
    }

    // Step 4: AI Score Results
    if (candidateStep === 'ai-score') {
      const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-300';
        if (score >= 75) return 'text-blue-300';
        if (score >= 60) return 'text-yellow-300';
        return 'text-red-300';
      };

      const getScoreBadge = (score: number) => {
        if (score >= 90) return { label: 'Platinum', color: 'bg-green-500' };
        if (score >= 75) return { label: 'Gold', color: 'bg-blue-500' };
        if (score >= 60) return { label: 'Silver', color: 'bg-yellow-500' };
        return { label: 'Bronze', color: 'bg-red-500' };
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">AI Trust Score</h2>
              <p className="text-purple-200">Powered by ASI Alliance Intelligence</p>
            </div>

            {aiScoreData && (
              <div className="space-y-6">
                {/* Main Score Display */}
                <div className="text-center bg-white/5 rounded-xl p-6">
                  <div className={`text-6xl font-bold ${getScoreColor(aiScoreData.trustScore)} mb-2`}>
                    {aiScoreData.trustScore}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${getScoreBadge(aiScoreData.trustScore).color}`}>
                      {getScoreBadge(aiScoreData.trustScore).label}
                    </span>
                    <span className="text-white text-sm">Trust Level</span>
                  </div>
                  <p className="text-purple-200 text-sm">Out of 100</p>
                </div>

                {/* Analysis */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">AI Analysis</h3>
                  <p className="text-purple-200 text-sm">{aiScoreData.analysis}</p>
                </div>

                {/* Breakdown */}
                {aiScoreData.breakdown && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Score Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(aiScoreData.breakdown).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-purple-200 text-sm capitalize">
                            {key.replace('_', ' ')}
                          </span>
                          <span className={`text-sm font-semibold ${getScoreColor(value)}`}>
                            {value}/100
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wallet Address Input for NFT Minting */}
                {!nftMintingSuccess && (
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="text-white font-semibold mb-3">Create Soul-Bound NFT Credential</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Enter your wallet address to mint your verified trust credential as an NFT on World Chain
                    </p>
                    <input
                      type="text"
                      placeholder="0x... (Your wallet address)"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 mb-3"
                    />
                    {nftMintingError && (
                      <div className="text-red-300 text-sm mb-3">{nftMintingError}</div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCandidateStep('status')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                      >
                        Back to Status
                      </button>
                      <button
                        onClick={handleMintNFT}
                        disabled={nftMintingLoading || !walletAddress.trim()}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                      >
                        {nftMintingLoading ? 'Minting NFT...' : 'Create Credential NFT'}
                      </button>
                    </div>
                  </div>
                )}

                {/* NFT Minting Success */}
                {nftMintingSuccess && nftData && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-green-300 mb-2">NFT Minted Successfully!</h3>
                      <p className="text-green-200">Your trust credential is now a soul-bound NFT on World Chain</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-200">Token ID:</span>
                        <span className="text-green-100 font-mono">#{nftData.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-200">Trust Score:</span>
                        <span className="text-green-100 font-semibold">{nftData.trustScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-200">Verifications:</span>
                        <span className="text-green-100">{nftData.verificationCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-200">Transaction:</span>
                        <a
                          href={`https://worldscan.org/tx/${nftData.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-300 hover:text-green-100 underline font-mono text-xs"
                        >
                          {/* {nftData.transactionHash.slice(0, 8)}...{nftData.transactionHash.slice(-8)} */}
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => setCandidateStep('status')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                      >
                        Back to Status
                      </button>
                      <button
                        onClick={() => {
                          if (nftData.tokenURI) {
                            window.open(nftData.tokenURI, '_blank');
                          }
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                      >
                        View NFT Metadata
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Recruiter Dashboard</h1>
            <p className="text-purple-100">Find and hire verified candidates</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Job Posting */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Post a Job</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <textarea
                  placeholder="Job Description"
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <input
                  type="text"
                  placeholder="Required Skills (comma separated)"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg">
                  Post Job & Find Candidates
                </button>
              </div>
            </div>

            {/* Candidate Search */}
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Search Candidates</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Skills or Job Title"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
                  <option value="">Trust Score Range</option>
                  <option value="90-100">Platinum (90-100)</option>
                  <option value="75-89">Gold (75-89)</option>
                  <option value="60-74">Silver (60-74)</option>
                  <option value="40-59">Bronze (40-59)</option>
                </select>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
                  Search Candidates
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-white font-semibold mb-2">Sample Verified Candidates</h4>
                <div className="space-y-2">
                  <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">Software Engineer</div>
                      <div className="text-purple-200 text-sm">Trust Score: 95</div>
                    </div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Verified
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">Product Manager</div>
                      <div className="text-purple-200 text-sm">Trust Score: 87</div>
                    </div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-purple-200 text-sm">
              Recruiter ID: {nullifierHash.slice(0, 8)}...{nullifierHash.slice(-8)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
