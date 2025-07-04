import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase";

// ASI API configuration
const ASI_API_URL =
  process.env.ASI_API_URL || "https://api.asi1.ai/v1/chat/completions";
const ASI_API_KEY = process.env.ASI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { candidateId } = await request.json();
    console.log("🔄 AI Score calculation started for candidate:", candidateId);
    console.log(
      "🤖 Scoring Method:",
      ASI_API_KEY ? "ASI Alliance AI" : "Fallback Scoring",
    );
    console.log("🔑 ASI API Key configured:", !!ASI_API_KEY);
    console.log("🌐 ASI API URL:", ASI_API_URL);

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 },
      );
    }

    // Fetch candidate data for analysis
    console.log("📊 Fetching candidate data...");
    let candidateData;
    try {
      candidateData = await fetchCandidateData(candidateId);
      console.log(
        "📋 Candidate data fetched:",
        JSON.stringify(candidateData, null, 2),
      );
    } catch (fetchError) {
      console.error("❌ Error in fetchCandidateData:", fetchError);
      throw new Error(`Failed to fetch candidate data: ${fetchError}`);
    }

    if (!candidateData) {
      return NextResponse.json(
        { error: "Candidate not found or no data available" },
        { status: 404 },
      );
    }

    // Generate trust score using ASI LLM or fallback
    console.log("🧮 Starting trust score calculation...");
    let trustScore;
    try {
      trustScore = await calculateTrustScore(candidateData);
      console.log(
        "✨ Raw trust score result:",
        JSON.stringify(trustScore, null, 2),
      );
      console.log("📈 Final trust score:", trustScore.score);
      console.log("🔍 Score source:", trustScore.source || "Not specified");
    } catch (calculateError) {
      console.error("❌ Error in calculateTrustScore:", calculateError);
      throw new Error(`Failed to calculate trust score: ${calculateError}`);
    }

    // Store the trust score in database
    console.log("💾 Storing trust score...");
    try {
      await storeTrustScore(candidateId, trustScore);
      console.log("✅ Trust score stored successfully");
    } catch (storeError) {
      console.error("❌ Error in storeTrustScore:", storeError);
      throw new Error(`Failed to store trust score: ${storeError}`);
    }

    return NextResponse.json({
      success: true,
      trustScore: trustScore.score,
      analysis: trustScore.analysis,
      breakdown: trustScore.breakdown,
      source: trustScore.source || "Not specified",
    });
  } catch (error) {
    console.error("❌ AI Score calculation error:", error);
    console.error("Error type:", typeof error);
    console.error("Error constructor:", error?.constructor?.name);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    // Try to extract more detailed error information
    let errorMessage = "Unknown error";
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === "object" && error !== null) {
      // Handle Supabase or other object errors
      const errorObj = error as any;
      errorMessage =
        errorObj.message ||
        errorObj.error_description ||
        errorObj.hint ||
        JSON.stringify(error);
      errorDetails = {
        fullError: error,
        message: errorObj.message,
        code: errorObj.code,
        details: errorObj.details,
        hint: errorObj.hint,
      };
    } else {
      errorMessage = String(error);
      errorDetails = { rawError: error };
    }

    console.error("🔍 Processed error details:", errorDetails);

    return NextResponse.json(
      {
        error: "Failed to calculate trust score",
        details: errorMessage,
        debugInfo: errorDetails,
      },
      { status: 500 },
    );
  }
}

async function fetchCandidateData(candidateId: string) {
  try {
    console.log("Fetching verification requests for candidate:", candidateId);

    // Fetch verification requests
    const { data: verificationRequests, error: vrError } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("candidate_id", candidateId);

    if (vrError) {
      console.error("Error fetching verification requests:", vrError);
    }

    console.log("Fetching verifications for candidate:", candidateId);

    // Fetch completed verifications
    const { data: verifications, error: vError } = await supabase
      .from("verifications")
      .select("*")
      .eq("candidate_id", candidateId);

    if (vError) {
      console.error("Error fetching verifications:", vError);
    }

    console.log("Fetching resume data for candidate:", candidateId);

    // Fetch resume data if available (don't fail if not found)
    const { data: resumeData, error: rError } = await supabase
      .from("candidates")
      .select("github_profile, linkedin_profile, resume_data")
      .eq("id", candidateId)
      .single();

    console.log(
      "Fetching online presence analysis for candidate:",
      candidateId,
    );

    // Fetch online presence analysis if available
    const { data: onlinePresenceData, error: opError } = await supabase
      .from("online_presence_analysis")
      .select("*")
      .eq("candidate_id", candidateId)
      .single();

    if (rError && rError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error fetching resume data:", rError);
    }

    if (opError && opError.code !== "PGRST116") {
      console.error("Error fetching online presence data:", opError);
    }

    const requests = verificationRequests || [];
    const verifs = verifications || [];
    const successfulVerifs = verifs.filter((v) => v.verified);

    console.log("Data summary:", {
      totalRequests: requests.length,
      totalVerifications: verifs.length,
      successfulVerifications: successfulVerifs.length,
      hasOnlinePresence: !!onlinePresenceData,
      hasSocialProfiles: !!(
        resumeData?.github_profile || resumeData?.linkedin_profile
      ),
    });

    // Return data even if some parts are missing
    return {
      candidateId,
      verificationRequests: requests,
      verifications: verifs,
      resumeData: resumeData || null,
      onlinePresence: onlinePresenceData || null,
      socialProfiles: {
        github: resumeData?.github_profile || null,
        linkedin: resumeData?.linkedin_profile || null,
      },
      totalRequests: requests.length,
      successfulVerifications: successfulVerifs.length,
      verificationRate:
        requests.length > 0 ? successfulVerifs.length / requests.length : 0,
    };
  } catch (error) {
    console.error("Error fetching candidate data:", error);
    return null;
  }
}

async function calculateTrustScore(candidateData: any) {
  console.log("🧮 Starting trust score calculation");
  console.log(
    "📊 Using scoring method:",
    ASI_API_KEY ? "ASI Alliance AI" : "Fallback Algorithm",
  );

  // If no verification requests, return a base score
  if (candidateData.totalRequests === 0) {
    console.log("⚠️ No verification requests found, using base score");
    return {
      score: 30,
      analysis: "No verification requests have been sent yet.",
      source: "fallback_no_requests",
      breakdown: {
        verification_rate: 30,
        career_progression: 75,
        response_quality: 70,
        timeline_consistency: 80,
      },
      recommendations: ["Send verification requests to employers"],
      risk_factors: ["No verification data available"],
      strengths: [],
    };
  }

  // If no ASI API key, use fallback scoring
  if (!ASI_API_KEY) {
    console.log("⚠️ No ASI API key configured, using fallback scoring");
    const trustScore = calculateFallbackScore(candidateData);
    return {
      ...trustScore,
      source: "fallback_no_api_key",
    };
  }

  // Include online presence data in the prompt
  const onlinePresenceInfo = candidateData.onlinePresence
    ? `Online Presence Analysis (via OnlinePresence AgentVerse AI Agent):
- Combined online presence score: ${candidateData.onlinePresence.combined_score}/100
- Activity score: ${candidateData.onlinePresence.activity_score}/100
- Reputation score: ${candidateData.onlinePresence.reputation_score}/100
- Consistency score: ${candidateData.onlinePresence.consistency_score}/100
- Analysis summary: ${candidateData.onlinePresence.analysis_summary}
- GitHub analysis: ${JSON.stringify(candidateData.onlinePresence.github_analysis, null, 2)}
- LinkedIn analysis: ${JSON.stringify(candidateData.onlinePresence.linkedin_analysis, null, 2)}`
    : `Online Presence Analysis: Not available
- GitHub profile: ${candidateData.socialProfiles.github || "Not provided"}
- LinkedIn profile: ${candidateData.socialProfiles.linkedin || "Not provided"}
- Note: Run online presence analysis first for detailed scoring`;

  const prompt = `You are an AI expert in employment verification and candidate assessment. Analyze the following candidate data and provide a comprehensive trust score from 0-100.

Candidate Data:
- Total verification requests sent: ${candidateData.totalRequests}
- Successful verifications received: ${candidateData.successfulVerifications}
- Verification success rate: ${(candidateData.verificationRate * 100).toFixed(1)}%
- Verification details: ${JSON.stringify(candidateData.verifications, null, 2)}

${onlinePresenceInfo}

Please analyze the following factors and provide a detailed assessment:

1. **Employment Verification Success Rate** (30% weight)
   - High success rate (80%+): Excellent credibility
   - Medium success rate (50-79%): Good credibility with some concerns
   - Low success rate (<50%): Significant credibility issues

2. **Role Consistency and Career Progression** (25% weight)
   - Logical career progression and role advancement
   - Consistency in job titles and responsibilities
   - Industry relevance and growth trajectory

3. **Online Presence & Professional Reputation** (20% weight)
   - GitHub activity and code quality (if available)
   - LinkedIn professional presence and network
   - Consistency between online profiles and resume
   - Overall digital footprint credibility

4. **Verification Response Quality** (15% weight)
   - Speed of employer responses
   - Quality and detail of verification information
   - Multiple verification sources

5. **Timeline Consistency** (10% weight)
   - No overlapping employment periods
   - Reasonable gaps between positions
   - Consistent employment history

Based on your analysis, provide a JSON response with:
{
  "score": <number 0-100>,
  "analysis": "<detailed explanation of the score>",
  "breakdown": {
    "verification_rate": <score 0-100>,
    "career_progression": <score 0-100>,
    "online_presence": <score 0-100>,
    "response_quality": <score 0-100>,
    "timeline_consistency": <score 0-100>
  },
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "risk_factors": ["<risk 1>", "<risk 2>"],
  "strengths": ["<strength 1>", "<strength 2>"]
}

Respond only with valid JSON.`;

  try {
    console.log("🤖 Calling ASI API for trust score calculation...");
    const response = await fetch(ASI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ASI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "asi1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert AI analyst specializing in employment verification and candidate assessment. Provide accurate, fair, and detailed analysis of candidate trustworthiness based on verification data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.log("❌ ASI API error, falling back to basic scoring");
      throw new Error(
        `ASI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("🔍 Raw ASI API response:", JSON.stringify(data, null, 2));

    const content = data.choices?.[0]?.message?.content;
    console.log("📝 ASI content response:", content);

    if (!content) {
      console.log("❌ No content from ASI API, falling back to basic scoring");
      throw new Error("No content received from ASI API");
    }

    // Parse ASI response (handle both direct JSON and markdown-wrapped JSON)
    try {
      // First try to parse as direct JSON
      const asiScore = JSON.parse(content);
      console.log("✅ ASI trust score parsed successfully (direct JSON):", {
        score: asiScore.score,
        method: "ASI Alliance AI",
        breakdown: asiScore.breakdown,
      });
      return {
        ...asiScore,
        source: "asi_alliance",
      };
    } catch (parseError) {
      console.log(
        "🔍 Direct JSON parsing failed, trying markdown extraction...",
      );
      console.log("📝 Raw ASI content:", content);

      try {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const extractedJson = jsonMatch[1].trim();
          console.log("📄 Extracted JSON from markdown:", extractedJson);
          const asiScore = JSON.parse(extractedJson);
          console.log(
            "✅ ASI trust score parsed successfully (markdown-wrapped):",
            {
              score: asiScore.score,
              method: "ASI Alliance AI",
              breakdown: asiScore.breakdown,
            },
          );
          return {
            ...asiScore,
            source: "asi_alliance",
          };
        } else {
          throw new Error("No JSON found in markdown blocks");
        }
      } catch (markdownParseError) {
        console.error(
          "❌ Failed to parse ASI response as JSON or extract from markdown",
        );
        console.error("Original content:", content);
        console.error("Direct parse error:", parseError);
        console.error("Markdown extraction error:", markdownParseError);

        console.log("⚠️ Falling back to basic scoring algorithm");
        // Fallback to basic scoring if JSON parsing fails
        const fallbackScore = calculateFallbackScore(candidateData);
        return {
          ...fallbackScore,
          source: "fallback_parse_error",
        };
      }
    }
  } catch (error) {
    console.error("ASI API call failed:", error);
    // Fallback scoring mechanism
    const fallbackScore = calculateFallbackScore(candidateData);
    return {
      ...fallbackScore,
      source: "fallback_api_error",
    };
  }
}

function calculateFallbackScore(candidateData: any) {
  const verificationRate = candidateData.verificationRate;
  const fallbackScore = Math.round(verificationRate * 100);

  return {
    score: fallbackScore,
    analysis: `Fallback trust score based on ${(verificationRate * 100).toFixed(1)}% verification success rate. ${candidateData.successfulVerifications} out of ${candidateData.totalRequests} verifications completed successfully.`,
    breakdown: {
      verification_rate: fallbackScore,
      career_progression: 75,
      response_quality: 70,
      timeline_consistency: 80,
    },
    recommendations: ["Complete more verifications for accurate scoring"],
    risk_factors: verificationRate < 0.5 ? ["Low verification rate"] : [],
    strengths: verificationRate > 0.8 ? ["High verification rate"] : [],
  };
}

async function storeTrustScore(candidateId: string, trustScore: any) {
  try {
    console.log("Storing trust score for candidate:", candidateId);
    console.log(
      "Trust score data to store:",
      JSON.stringify(trustScore, null, 2),
    );

    // Prepare the data for storage
    const dataToStore = {
      candidate_id: candidateId,
      score: trustScore.score,
      analysis: trustScore.analysis,
      breakdown: trustScore.breakdown || {},
      recommendations: trustScore.recommendations || [],
      risk_factors: trustScore.risk_factors || [],
      strengths: trustScore.strengths || [],
      calculated_at: new Date().toISOString(),
    };

    console.log(
      "Prepared data for storage:",
      JSON.stringify(dataToStore, null, 2),
    );

    const { data, error } = await supabase
      .from("trust_scores")
      .upsert(dataToStore, {
        onConflict: "candidate_id",
      });

    if (error) {
      console.error("Supabase error storing trust score:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      // Create a more descriptive error
      const errorMessage = `Database error: ${error.message}${error.details ? ` - ${error.details}` : ""}${error.hint ? ` (Hint: ${error.hint})` : ""}`;
      throw new Error(errorMessage);
    }

    console.log("Trust score stored successfully:", data);
  } catch (error) {
    console.error("Failed to store trust score:", error);

    // Re-throw with better error information
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        `Unknown error storing trust score: ${JSON.stringify(error)}`,
      );
    }
  }
}
