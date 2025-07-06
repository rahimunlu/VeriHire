import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../supabase";
import { jwtVerify } from "jose";
import { ethers } from "ethers";
import TrustCredentialAbi from "../../../../../../contracts/out/TrustCredential.sol/TrustCredential.json";

interface VerificationPayload {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  employerEmail: string;
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  verificationId: string;
  type: string;
}

interface VerificationResponse {
  token: string;
  verified: boolean;
  employerWorldId?: string;
  comments?: string;
}

const CONTRACT_ADDRESS = process.env.TRUST_CREDENTIAL_CONTRACT_ADDRESS!;
const RPC_URL = process.env.WORLD_CHAIN_RPC_URL!;
const PRIVATE_KEY = process.env.WORLD_CHAIN_PRIVATE_KEY!; // Backend signer (must be authorized verifier)

// Set these in your environment
const WORLD_APP_ID = process.env.WORLD_APP_ID!;
const WORLD_ACTION_ID = process.env.WORLD_ACTION_ID!;

function toBytes32(str: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(str));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      proof,
      merkle_root,
      nullifier_hash,
      verification_level,
      answer,
      token,
    } = body;

    // Require World ID login/proof fields
    if (!proof || !merkle_root || !nullifier_hash || !verification_level) {
      return NextResponse.json(
        {
          error:
            "World ID login required. Please login with World ID to verify.",
        },
        { status: 401 },
      );
    }
    if (!answer || !token) {
      return NextResponse.json(
        { error: "Missing required fields (answer or token)" },
        { status: 400 },
      );
    }

    // Verify JWT token (from magic link)
    let payload: VerificationPayload;
    try {
      const { payload: jwtPayload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!),
      );
      payload = jwtPayload as unknown as VerificationPayload;
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    // Prevent replay: check if this nullifier_hash has already been used for this candidate
    const { data: existing, error: existingError } = await supabase
      .from("verifications")
      .select("id")
      .eq("candidate_id", payload.candidateId)
      .eq("employer_nullifier", nullifier_hash)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "This employer has already verified this candidate." },
        { status: 409 },
      );
    }

    // Check if user is in World App - they're already verified
    const isWorldAppUser = body.worldApp?.isConnected;

    if (isWorldAppUser) {
      console.log("User is in World App - skipping World ID verification");
    } else {
      // Verify World ID proof with Worldcoin Cloud Verifier (v2 API) for external users
      const verifyRes = await fetch(
        `https://developer.worldcoin.org/api/v2/verify/${WORLD_APP_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nullifier_hash,
            merkle_root,
            proof,
            verification_level,
            action: WORLD_ACTION_ID,
            signal: payload.employerEmail, // or another unique signal if needed
          }),
        },
      );
      const verifyJson = await verifyRes.json();
      console.log("World ID verify response:", verifyJson);
      if (!verifyJson.success) {
        return NextResponse.json(
          { error: "World ID verification failed", details: verifyJson },
          { status: 400 },
        );
      }
    }

    // Store verification result in Supabase
    const verificationRecord = {
      id: payload.verificationId, // Use the verification ID as the primary key
      candidate_id: payload.candidateId,
      candidate_name: payload.candidateName,
      candidate_email: payload.candidateEmail,
      employer_email: payload.employerEmail,
      company: payload.company,
      position: payload.position,
      start_date: payload.startDate,
      end_date: payload.endDate,
      verified: answer === "yes",
      employer_world_id: nullifier_hash,
      verification_source: isWorldAppUser ? "world_app" : "world_id",
      verification_proof: generateVerificationProof({
        verified: answer === "yes",
        candidateId: payload.candidateId,
        company: payload.company,
        position: payload.position,
        employerWorldId: nullifier_hash,
        timestamp: Date.now(),
      }),
      timestamp: new Date().toISOString(),
      status: "completed",
    };
    const { error: dbError } = await supabase
      .from("verifications")
      .insert([verificationRecord]);
    if (dbError) {
      return NextResponse.json(
        {
          error: "Failed to store verification result",
          details: dbError.message,
        },
        { status: 500 },
      );
    }

    // Update verification request status
    await supabase
      .from("verification_requests")
      .update({ status: "completed" })
      .eq("verification_id", payload.verificationId);

    return NextResponse.json({ success: true });
  } catch (e) {
    let errorMessage = "Unknown error";
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === "string") {
      errorMessage = e;
    } else {
      try {
        errorMessage = JSON.stringify(e);
      } catch {
        errorMessage = String(e);
      }
    }
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Verification token required" },
      { status: 400 },
    );
  }

  try {
    // Verify and decode token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback-secret",
    );
    const { payload } = await jwtVerify(token, secret);
    const verificationData = payload as unknown as VerificationPayload;

    return NextResponse.json({
      success: true,
      verificationData: {
        candidateName: verificationData.candidateName,
        candidateEmail: verificationData.candidateEmail,
        company: verificationData.company,
        position: verificationData.position,
        startDate: verificationData.startDate,
        endDate: verificationData.endDate,
        verificationId: verificationData.verificationId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid or expired verification token" },
      { status: 401 },
    );
  }
}

// Generate a privacy-preserving verification proof
function generateVerificationProof(data: {
  verified: boolean;
  candidateId: string;
  company: string;
  position: string;
  employerWorldId?: string;
  timestamp: number;
}): string {
  // Simple hash-based proof for now
  // TODO: Implement proper ZK proof using circom/snarkjs
  const proofData = {
    verified: data.verified,
    candidateHash: hashString(data.candidateId),
    companyHash: hashString(data.company),
    positionHash: hashString(data.position),
    employerHash: data.employerWorldId
      ? hashString(data.employerWorldId)
      : null,
    timestamp: data.timestamp,
  };

  return hashString(JSON.stringify(proofData));
}

// Simple hash function (replace with proper cryptographic hash)
function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Update candidate's trust score based on verification
async function updateCandidateTrustScore(
  candidateId: string,
  verified: boolean,
): Promise<void> {
  try {
    // TODO: Implement sophisticated trust score calculation
    // For now, simple increment/decrement
    const scoreChange = verified ? 10 : -5;

    // TODO: Update in Supabase database
    console.log(
      `Updating trust score for candidate ${candidateId}: ${scoreChange > 0 ? "+" : ""}${scoreChange}`,
    );
  } catch (error) {
    console.error("Failed to update trust score:", error);
  }
}
