import { NextResponse } from "next/server";

export async function GET() {
  try {
    const app_id =
      process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID;
    const action = process.env.WORLD_ACTION_ID || "trust-match-verification";
    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/${app_id}`;

    return NextResponse.json({
      message: "World ID API configuration test",
      approach: "Manual fetch (as per docs)",
      app_id,
      action,
      verify_url: verifyUrl,
      has_app_id: !!app_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
