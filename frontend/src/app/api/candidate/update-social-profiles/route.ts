import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase";

export async function POST(request: NextRequest) {
  try {
    const { candidateId, githubProfile, linkedinProfile } = await request.json();
    
    console.log("🔄 Updating social profiles for candidate:", candidateId);
    
    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    if (githubProfile && !isValidGitHubUrl(githubProfile)) {
      return NextResponse.json(
        { error: "Invalid GitHub profile URL" },
        { status: 400 }
      );
    }

    if (linkedinProfile && !isValidLinkedInUrl(linkedinProfile)) {
      return NextResponse.json(
        { error: "Invalid LinkedIn profile URL" },
        { status: 400 }
      );
    }

    // Update candidate social profiles
    const { data, error } = await supabase
      .from("candidates")
      .update({
        github_profile: githubProfile,
        linkedin_profile: linkedinProfile,
        social_profiles_updated_at: new Date().toISOString(),
      })
      .eq("id", candidateId);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update social profiles" },
        { status: 500 }
      );
    }

    console.log("✅ Social profiles updated successfully");
    
    return NextResponse.json({
      success: true,
      message: "Social profiles updated successfully",
    });

  } catch (error) {
    console.error("❌ Error updating social profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function isValidGitHubUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').length >= 2;
  } catch {
    return false;
  }
}

function isValidLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'linkedin.com' || urlObj.hostname === 'www.linkedin.com';
  } catch {
    return false;
  }
} 