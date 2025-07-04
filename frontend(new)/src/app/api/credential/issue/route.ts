import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../supabase";

interface CredentialRequest {
  candidateId: string;
  resumeData: {
    personalInfo: any;
    workExperience: any[];
    education: any[];
    skills: string[];
  };
  verifications: Array<{
    company: string;
    position: string;
    verified: boolean;
    employerWorldId?: string;
  }>;
}

interface TrustScoreFactors {
  employmentVerificationRate: number;
  careerProgression: number;
  skillConsistency: number;
  timelineConsistency: number;
  verificationCount: number;
}

export async function POST(req: NextRequest) {
  try {
    const { candidateId, resumeData, verifications }: CredentialRequest =
      await req.json();

    if (!candidateId || !resumeData || !verifications) {
      return NextResponse.json(
        { error: "Missing required data for credential issuance" },
        { status: 400 },
      );
    }

    // Calculate trust score based on multiple factors
    const trustScore = calculateTrustScore({
      employmentVerificationRate: calculateVerificationRate(verifications),
      careerProgression: analyzeCareerProgression(resumeData.workExperience),
      skillConsistency: analyzeSkillConsistency(
        resumeData.workExperience,
        resumeData.skills,
      ),
      timelineConsistency: analyzeTimelineConsistency(
        resumeData.workExperience,
      ),
      verificationCount: verifications.filter((v) => v.verified).length,
    });

    // Generate credential hash
    const credentialHash = generateCredentialHash({
      candidateId,
      workExperience: resumeData.workExperience,
      education: resumeData.education,
      verifications: verifications.filter((v) => v.verified),
      timestamp: Date.now(),
    });

    // Generate ZK proof for privacy
    const zkProof = generateZKProof({
      candidateId,
      trustScore,
      verificationCount: verifications.filter((v) => v.verified).length,
      skillsHash: hashArray(resumeData.skills),
      timestamp: Date.now(),
    });

    // Store credential in database
    const credential = {
      id: crypto.randomUUID(),
      candidateId,
      credentialHash,
      zkProof,
      trustScore,
      verificationCount: verifications.filter((v) => v.verified).length,
      issuanceDate: new Date().toISOString(),
      status: "active",
    };

    const { error: dbError } = await supabase
      .from("credentials")
      .insert([credential]);
    if (dbError) {
      return NextResponse.json(
        { error: "Failed to store credential", details: dbError.message },
        { status: 500 },
      );
    }

    // Prepare NFT metadata
    const nftMetadata = generateNFTMetadata({
      trustScore,
      verificationCount: verifications.filter((v) => v.verified).length,
      skillCount: resumeData.skills.length,
      experienceYears: calculateExperienceYears(resumeData.workExperience),
    });

    return NextResponse.json({
      success: true,
      message: "Credential issued successfully",
      credential: {
        id: credential.id,
        credentialHash,
        trustScore,
        verificationCount: credential.verificationCount,
        issuanceDate: credential.issuanceDate,
      },
      zkProof,
      nftMetadata,
      shareableLink: `${process.env.NEXT_PUBLIC_BASE_URL}/credential/${credential.id}`,
    });
  } catch (error) {
    console.error("Credential issuance error:", error);
    return NextResponse.json(
      { error: "Failed to issue credential" },
      { status: 500 },
    );
  }
}

// Calculate trust score from 0-100 based on multiple factors
function calculateTrustScore(factors: TrustScoreFactors): number {
  const weights = {
    employmentVerificationRate: 0.4, // 40% weight - most important
    careerProgression: 0.2, // 20% weight
    skillConsistency: 0.15, // 15% weight
    timelineConsistency: 0.15, // 15% weight
    verificationCount: 0.1, // 10% weight
  };

  let score = 0;
  score +=
    factors.employmentVerificationRate * weights.employmentVerificationRate;
  score += factors.careerProgression * weights.careerProgression;
  score += factors.skillConsistency * weights.skillConsistency;
  score += factors.timelineConsistency * weights.timelineConsistency;
  score +=
    (Math.min(factors.verificationCount * 20, 100) *
      weights.verificationCount) /
    100;

  return Math.round(Math.min(Math.max(score, 0), 100));
}

function calculateVerificationRate(verifications: any[]): number {
  if (verifications.length === 0) return 0;
  const verifiedCount = verifications.filter((v) => v.verified).length;
  return (verifiedCount / verifications.length) * 100;
}

function analyzeCareerProgression(workExperience: any[]): number {
  if (workExperience.length <= 1) return 70; // Default for single job

  // Simple progression analysis based on role changes
  let progressionScore = 50;

  // Look for upward movement in titles
  const titleProgression = [
    "intern",
    "junior",
    "associate",
    "senior",
    "lead",
    "principal",
    "manager",
    "director",
    "vp",
  ];

  for (let i = 1; i < workExperience.length; i++) {
    const prevTitle = workExperience[i].position?.toLowerCase() || "";
    const currentTitle = workExperience[i - 1].position?.toLowerCase() || "";

    const prevLevel = titleProgression.findIndex((level) =>
      prevTitle.includes(level),
    );
    const currentLevel = titleProgression.findIndex((level) =>
      currentTitle.includes(level),
    );

    if (currentLevel > prevLevel) {
      progressionScore += 15; // Bonus for promotion
    }
  }

  return Math.min(progressionScore, 100);
}

function analyzeSkillConsistency(
  workExperience: any[],
  skills: string[],
): number {
  if (skills.length === 0) return 50;

  // Check if skills mentioned align with job positions
  let consistencyScore = 60; // Base score

  const techSkills = skills.filter((skill) =>
    [
      "javascript",
      "python",
      "react",
      "node",
      "sql",
      "aws",
      "docker",
      "kubernetes",
    ].some((tech) => skill.toLowerCase().includes(tech)),
  );

  const hasRelevantExperience = workExperience.some((exp) =>
    ["engineer", "developer", "architect", "technical"].some((role) =>
      exp.position?.toLowerCase().includes(role),
    ),
  );

  if (techSkills.length > 0 && hasRelevantExperience) {
    consistencyScore += 30;
  }

  return Math.min(consistencyScore, 100);
}

function analyzeTimelineConsistency(workExperience: any[]): number {
  if (workExperience.length <= 1) return 90;

  let consistencyScore = 80;

  // Check for employment gaps
  for (let i = 1; i < workExperience.length; i++) {
    const prevEnd = workExperience[i].endDate;
    const currentStart = workExperience[i - 1].startDate;

    // Simple gap detection (would need better date parsing in production)
    if (prevEnd && currentStart && prevEnd !== "present") {
      // If there's a reasonable transition, maintain score
      consistencyScore += 5;
    }
  }

  return Math.min(consistencyScore, 100);
}

function calculateExperienceYears(workExperience: any[]): number {
  // Simple calculation - in production would parse actual dates
  return workExperience.length * 1.5; // Assume 1.5 years average per role
}

function generateCredentialHash(data: any): string {
  // In production, use proper cryptographic hash
  const hashInput = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

function generateZKProof(data: any): string {
  // Simplified ZK proof - in production use proper circom/snarkjs
  const proofInput = {
    candidateHash: hashString(data.candidateId),
    trustScoreCommitment: data.trustScore,
    verificationCountCommitment: data.verificationCount,
    skillsCommitment: data.skillsHash,
    timestamp: data.timestamp,
  };

  return hashString(JSON.stringify(proofInput));
}

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function hashArray(arr: string[]): string {
  return hashString(arr.sort().join(","));
}

function generateNFTMetadata(data: {
  trustScore: number;
  verificationCount: number;
  skillCount: number;
  experienceYears: number;
}) {
  let trustLevel: string;
  let badgeColor: string;

  if (data.trustScore >= 90) {
    trustLevel = "Platinum";
    badgeColor = "#E5E7EB";
  } else if (data.trustScore >= 75) {
    trustLevel = "Gold";
    badgeColor = "#FCD34D";
  } else if (data.trustScore >= 60) {
    trustLevel = "Silver";
    badgeColor = "#9CA3AF";
  } else if (data.trustScore >= 40) {
    trustLevel = "Bronze";
    badgeColor = "#92400E";
  } else {
    trustLevel = "Unverified";
    badgeColor = "#6B7280";
  }

  return {
    name: `VeriHire ${trustLevel} Badge`,
    description: `Verified employment credential with ${data.verificationCount} verifications`,
    attributes: [
      { trait_type: "Trust Level", value: trustLevel },
      { trait_type: "Trust Score", value: data.trustScore },
      { trait_type: "Verifications", value: data.verificationCount },
      { trait_type: "Skills Count", value: data.skillCount },
      { trait_type: "Experience Years", value: data.experienceYears },
      {
        trait_type: "Issue Date",
        value: new Date().toISOString().split("T")[0],
      },
    ],
    badge_color: badgeColor,
  };
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "Candidate ID required" },
      { status: 400 },
    );
  }

  // TODO: Query database for existing credential
  return NextResponse.json({
    message: "Credential lookup endpoint",
    candidateId,
    // credential: null // TODO: Return actual credential data
  });
}
