import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase";

// AgentVerse API configuration
const AGENTVERSE_API_URL =
  process.env.AGENTVERSE_API_URL || "https://agentverse.ai/v1/submit";
const AGENTVERSE_API_KEY = process.env.AGENTVERSE_API_KEY;
const AGENT_ADDRESS =
  "agent1qd9zadpfnxr28t7nmnr7nmtzlcs3kglyvslkagr7hzr6t64vrrpus036ads";

export async function POST(request: NextRequest) {
  try {
    const { candidateId } = await request.json();

    console.log("🔄 Analyzing online presence for candidate:", candidateId);
    console.log("🤖 AgentVerse API configured:", !!AGENTVERSE_API_KEY);

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 },
      );
    }

    // Fetch candidate's social profiles
    const { data: candidateData, error: candidateError } = await supabase
      .from("candidates")
      .select("github_profile, linkedin_profile, resume_data")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidateData) {
      console.error("Error fetching candidate data:", candidateError);
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    const { github_profile, linkedin_profile, resume_data } = candidateData;

    if (!github_profile && !linkedin_profile) {
      return NextResponse.json(
        {
          error:
            "No social profiles found. Please add GitHub or LinkedIn profile first.",
        },
        { status: 400 },
      );
    }

    // Call AgentVerse agent for analysis
    console.log("🤖 Calling AgentVerse agent for online presence analysis...");
    let agentAnalysis;

    try {
      agentAnalysis = await callAgentVerseAgent(
        candidateId,
        github_profile,
        linkedin_profile,
        resume_data,
      );
      console.log("✅ AgentVerse analysis completed");
    } catch (agentError) {
      console.error("❌ AgentVerse error:", agentError);
      // Fallback to basic analysis if agent fails
      agentAnalysis = createFallbackAnalysis(github_profile, linkedin_profile);
    }

    // Store analysis results
    const analysisData = {
      candidate_id: candidateId,
      github_profile,
      linkedin_profile,
      github_analysis: agentAnalysis.github_analysis || {},
      linkedin_analysis: agentAnalysis.linkedin_analysis || {},
      combined_score: agentAnalysis.combined_score || 50,
      analysis_summary: agentAnalysis.analysis_summary || "Analysis completed",
      activity_score: agentAnalysis.activity_score || 50,
      reputation_score: agentAnalysis.reputation_score || 50,
      consistency_score: agentAnalysis.consistency_score || 50,
      agent_response: agentAnalysis.agent_response || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("online_presence_analysis")
      .upsert(analysisData, {
        onConflict: "candidate_id",
      });

    if (error) {
      console.error("Database error storing analysis:", error);
      return NextResponse.json(
        { error: "Failed to store analysis results" },
        { status: 500 },
      );
    }

    console.log("✅ Online presence analysis stored successfully");

    return NextResponse.json({
      success: true,
      analysis: agentAnalysis,
      message: "Online presence analysis completed successfully",
    });
  } catch (error) {
    console.error("❌ Error analyzing online presence:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function callAgentVerseAgent(
  candidateId: string,
  githubProfile: string,
  linkedinProfile: string,
  resumeData: any,
) {
  if (!AGENTVERSE_API_KEY) {
    throw new Error("AgentVerse API key not configured");
  }

  const prompt = `Analyze the online presence of this candidate:
  
Candidate ID: ${candidateId}
GitHub Profile: ${githubProfile || "Not provided"}
LinkedIn Profile: ${linkedinProfile || "Not provided"}
Resume Data: ${JSON.stringify(resumeData, null, 2)}

Please provide a comprehensive analysis of their online presence including:
1. GitHub activity and code quality (if available)
2. LinkedIn professional presence and network
3. Consistency between profiles and resume
4. Overall online reputation and credibility
5. Activity level and engagement

Return analysis in JSON format with:
{
  "combined_score": <0-100>,
  "analysis_summary": "<detailed summary>",
  "activity_score": <0-100>,
  "reputation_score": <0-100>,
  "consistency_score": <0-100>,
  "github_analysis": {
    "repositories_count": <number>,
    "contribution_activity": "<high/medium/low>",
    "code_quality_indicators": "<assessment>",
    "professional_presence": "<assessment>"
  },
  "linkedin_analysis": {
    "profile_completeness": "<assessment>",
    "network_size": "<assessment>",
    "professional_updates": "<assessment>",
    "endorsements_recommendations": "<assessment>"
  },
  "strengths": ["<strength1>", "<strength2>"],
  "areas_for_improvement": ["<area1>", "<area2>"],
  "credibility_indicators": ["<indicator1>", "<indicator2>"]
}`;

  const response = await fetch(AGENTVERSE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGENTVERSE_API_KEY}`,
    },
    body: JSON.stringify({
      type: "agent_communication",
      agent_address: AGENT_ADDRESS,
      schema_digest:
        "proto:a90b71c8142c6b6c317d7297ef67015e90000361bb73b86eb9c70fb7a5ce1ce5",
      session_id: `session_${candidateId}_${Date.now()}`,
      payload: {
        message: prompt,
        request_id: `req_${candidateId}_${Date.now()}`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `AgentVerse API error: ${response.status} ${response.statusText}`,
    );
  }

  const agentResponse = await response.json();
  console.log(
    "AgentVerse raw response:",
    JSON.stringify(agentResponse, null, 2),
  );

  // Parse the agent response
  try {
    const analysisContent =
      agentResponse.response || agentResponse.payload || agentResponse;

    if (typeof analysisContent === "string") {
      // Try to parse JSON from string response
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          agent_response: agentResponse,
        };
      }
    }

    // If response is already an object, use it directly
    if (typeof analysisContent === "object") {
      return {
        ...analysisContent,
        agent_response: agentResponse,
      };
    }

    throw new Error("Could not parse agent response");
  } catch (parseError) {
    console.error("Error parsing agent response:", parseError);
    throw new Error(`Failed to parse agent response: ${parseError}`);
  }
}

function createFallbackAnalysis(
  githubProfile: string,
  linkedinProfile: string,
) {
  return {
    combined_score: 50,
    analysis_summary:
      "Fallback analysis - AgentVerse agent unavailable. Basic profile presence detected.",
    activity_score: githubProfile ? 60 : 30,
    reputation_score: 50,
    consistency_score: githubProfile && linkedinProfile ? 70 : 40,
    github_analysis: githubProfile
      ? {
          repositories_count: "unknown",
          contribution_activity: "unknown",
          code_quality_indicators:
            "Profile exists but detailed analysis unavailable",
          professional_presence: "Profile detected",
        }
      : {},
    linkedin_analysis: linkedinProfile
      ? {
          profile_completeness: "unknown",
          network_size: "unknown",
          professional_updates: "unknown",
          endorsements_recommendations:
            "Profile exists but detailed analysis unavailable",
        }
      : {},
    strengths: [
      ...(githubProfile ? ["GitHub profile present"] : []),
      ...(linkedinProfile ? ["LinkedIn profile present"] : []),
    ],
    areas_for_improvement: [
      "Enable detailed analysis by configuring AgentVerse API",
      ...(!githubProfile ? ["Add GitHub profile"] : []),
      ...(!linkedinProfile ? ["Add LinkedIn profile"] : []),
    ],
    credibility_indicators: [
      "Profile presence indicates some level of online activity",
    ],
    agent_response: {
      status: "fallback",
      reason: "AgentVerse agent unavailable",
    },
  };
}
