import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Environment variable test",
    world_app_id: process.env.WORLD_APP_ID || "NOT_SET",
    next_public_world_app_id: process.env.NEXT_PUBLIC_WORLD_APP_ID || "NOT_SET",
    world_action_id: process.env.WORLD_ACTION_ID || "NOT_SET",
    env_keys: Object.keys(process.env).filter((key) => key.includes("WORLD")),
    timestamp: new Date().toISOString(),
  });
}
