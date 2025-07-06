import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const origin = req.headers.get("origin") || "";

  return NextResponse.json({
    message: "World App integration debug endpoint",
    timestamp: new Date().toISOString(),
    headers: {
      userAgent,
      origin,
    },
    environment: {
      hasWorldAppId: !!process.env.WORLD_APP_ID,
      hasNextPublicWorldAppId: !!process.env.NEXT_PUBLIC_WORLD_APP_ID,
      worldAppId:
        process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID,
      worldActionId: process.env.WORLD_ACTION_ID || "trust-match-verification",
    },
    instructions: {
      worldAppUsers: "Should be automatically verified without World ID step",
      externalUsers: "Need to complete World ID verification",
      verificationFlow:
        "World App users click email -> World App opens -> Direct yes/no verification",
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  return NextResponse.json({
    message: "World App debug test",
    receivedData: body,
    isWorldAppUser: body.worldApp?.isConnected,
    timestamp: new Date().toISOString(),
  });
}
