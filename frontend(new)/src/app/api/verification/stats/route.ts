import { NextResponse } from "next/server";
import { supabase } from "../../supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get("candidate_id");

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidate_id is required" },
        { status: 400 },
      );
    }

    // Query verification_requests for pending/completed statuses
    const { data: requestsData, error: requestsError } = await supabase
      .from("verification_requests")
      .select("status")
      .eq("candidate_id", candidateId);

    if (requestsError) {
      console.error("Error fetching verification requests:", requestsError);
      return NextResponse.json(
        { error: "Failed to fetch verification requests" },
        { status: 500 },
      );
    }

    // Query verifications for verified/rejected statuses
    const { data: verificationsData, error: verificationsError } =
      await supabase
        .from("verifications")
        .select("verified")
        .eq("candidate_id", candidateId);

    if (verificationsError) {
      console.error("Error fetching verifications:", verificationsError);
      return NextResponse.json(
        { error: "Failed to fetch verifications" },
        { status: 500 },
      );
    }

    // Count statuses
    let verified = 0;
    let pending = 0;
    let rejected = 0;

    // Count from verification_requests
    requestsData.forEach((request) => {
      if (request.status === "pending") {
        pending++;
      } else if (request.status === "completed") {
        // For completed requests, we need to check if they were verified or rejected
        // This will be handled by the verifications table
      }
    });

    // Count from verifications
    verificationsData.forEach((verification) => {
      if (verification.verified === true) {
        verified++;
      } else if (verification.verified === false) {
        rejected++;
      }
    });

    // Format data for the pie chart
    const verificationData = [
      { name: "Verified", value: verified, color: "#4ade80" },
      { name: "Pending", value: pending, color: "#facc15" },
      { name: "Rejected", value: rejected, color: "#f87171" },
    ];

    return NextResponse.json({
      verification_data: verificationData,
      totals: { verified, pending, rejected },
    });
  } catch (error) {
    console.error("Error in verification stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
