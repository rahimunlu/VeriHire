import { NextRequest, NextResponse } from "next/server";
import { IVerifyResponse, ISuccessResult } from "@worldcoin/idkit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { proof, merkle_root, nullifier_hash, verification_level } =
      await req.json();

    console.log("Received verification request:", {
      nullifier_hash,
      verification_level,
      proof: proof?.substring(0, 10) + "...", // Log partial proof for debugging
    });

    // Verify the World ID proof
    const app_id =
      process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID;
    const action = process.env.WORLD_ACTION_ID || "trust-match-verification";

    console.log("Environment variables:", {
      app_id,
      action,
      has_world_app_id: !!process.env.WORLD_APP_ID,
      has_next_public_world_app_id: !!process.env.NEXT_PUBLIC_WORLD_APP_ID,
    });

    if (!app_id) {
      console.error("No World App ID found in environment variables");
      return NextResponse.json(
        { error: "World App ID not configured" },
        { status: 500 },
      );
    }

    // Use the manual fetch approach as per World ID docs
    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/${app_id}`;
    const requestBody = {
      nullifier_hash,
      merkle_root,
      proof,
      verification_level,
      action,
    };

    // Validate required fields
    if (!proof || !merkle_root || !nullifier_hash || !verification_level) {
      console.error("Missing required fields:", {
        has_proof: !!proof,
        has_merkle_root: !!merkle_root,
        has_nullifier_hash: !!nullifier_hash,
        has_verification_level: !!verification_level,
      });
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 },
      );
    }

    console.log("Making verification request to World ID API");
    console.log("URL:", verifyUrl);
    console.log("Request body:", {
      ...requestBody,
      proof: proof?.substring(0, 10) + "...",
    });

    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("World ID API response status:", verifyRes.status);

    if (verifyRes.ok) {
      const responseData = await verifyRes.json();
      console.log("World ID API response data:", responseData);

      // Check for the 'success' field (not 'verified')
      if (responseData.success) {
        console.log("Verification successful for nullifier:", nullifier_hash);
        // Store user in database with nullifier hash for sybil protection
        // TODO: Add Supabase integration

        return NextResponse.json({
          success: true,
          verified: true, // for compatibility with frontend
          nullifier_hash,
          user_id: nullifier_hash, // Use nullifier as unique identifier
        });
      } else {
        console.log("Verification failed - proof not verified");
        return NextResponse.json(
          { error: "Invalid World ID proof" },
          { status: 400 },
        );
      }
    } else {
      // Get error details from the response
      console.error("World ID API returned error status:", verifyRes.status);
      console.error(
        "Response headers:",
        Object.fromEntries(verifyRes.headers.entries()),
      );

      let errorData;
      let responseText;

      try {
        // First try to get the raw text
        responseText = await verifyRes.text();
        console.error("Raw error response:", responseText);

        // Then try to parse as JSON
        if (responseText) {
          errorData = JSON.parse(responseText);
        } else {
          errorData = { message: "Empty response from World ID API" };
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        errorData = {
          message: "Failed to parse error response",
          raw_response: responseText,
          status: verifyRes.status,
          status_text: verifyRes.statusText,
          url: verifyRes.url,
        };
      }

      console.error("Processed error data:", errorData);
      return NextResponse.json(
        { error: "World ID verification failed", details: errorData },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("World ID verification error:", error);

    // Provide more specific error information
    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = `Internal server error: ${error.message}`;
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "World ID authentication endpoint",
    app_id: process.env.WORLD_APP_ID,
    action: process.env.WORLD_ACTION_ID || "trust-match-verification",
  });
}
