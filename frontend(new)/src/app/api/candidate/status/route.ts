import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../supabase";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 },
    );
  }

  // Fetch resume status
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch verification requests
  const { data: verificationRequests, error: vrError } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  // Fetch verification results
  const { data: verifications, error: vError } = await supabase
    .from("verifications")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("timestamp", { ascending: false });

  // Fetch credential status
  const { data: credential, error: credError } = await supabase
    .from("credentials")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    resume: resume || null,
    resumeError: resumeError?.message || null,
    verificationRequests: verificationRequests || [],
    verificationRequestsError: vrError?.message || null,
    verifications: verifications || [],
    verificationsError: vError?.message || null,
    credential: credential || null,
    credentialError: credError?.message || null,
  });
}
