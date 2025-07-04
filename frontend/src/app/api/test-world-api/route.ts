import { NextResponse } from "next/server";

export async function GET() {
  try {
    const app_id =
      process.env.WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID;

    if (!app_id) {
      return NextResponse.json(
        {
          error: "No app_id configured",
          has_world_app_id: !!process.env.WORLD_APP_ID,
          has_next_public_world_app_id: !!process.env.NEXT_PUBLIC_WORLD_APP_ID,
        },
        { status: 400 },
      );
    }

    const verifyUrl = `https://developer.worldcoin.org/api/v2/verify/${app_id}`;

    // Make a test request with invalid data to see what kind of error we get
    const testResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nullifier_hash: "test",
        merkle_root: "test",
        proof: "test",
        verification_level: "device",
        action: "trust-match-verification",
      }),
    });

    console.log("Test API response status:", testResponse.status);
    console.log(
      "Test API response headers:",
      Object.fromEntries(testResponse.headers.entries()),
    );

    let responseText;
    let responseData;

    try {
      responseText = await testResponse.text();
      console.log("Test API raw response:", responseText);

      if (responseText) {
        responseData = JSON.parse(responseText);
      }
    } catch (error) {
      console.error("Failed to parse test response:", error);
    }

    return NextResponse.json({
      message: "World ID API connectivity test",
      app_id,
      verify_url: verifyUrl,
      test_status: testResponse.status,
      test_status_text: testResponse.statusText,
      test_response_text: responseText,
      test_response_data: responseData,
      api_reachable: testResponse.status !== undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
