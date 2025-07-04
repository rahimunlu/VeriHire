// Only parsed resume data is stored in the database. The original file is not retained for privacy and simplicity.
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../supabase";
import pdfParse from "pdf-parse";

interface ParsedResume {
  workExperience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    managerEmail?: string;
  }>;
  education: Array<{
    institution: string;
    degree?: string;
    field?: string;
    graduationYear?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const userId = formData.get("user_id") as string;

    console.log(file);
    console.log(userId);

    if (!file) {
      return NextResponse.json(
        { error: "No resume file provided" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Convert file to buffer for parsing
    const buffer = Buffer.from(await file.arrayBuffer());

    let parsedText: string;

    if (file.type === "application/pdf") {
      const data = await pdfParse(buffer);
      parsedText = data.text;
    } else if (file.type === "text/plain") {
      parsedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF or TXT files." },
        { status: 400 },
      );
    }

    // Parse the resume text into structured data
    const parsedResume = parseResumeText(parsedText);
    // Store only the parsed data in the database (no file storage)
    const { error: dbError } = await supabase.from("resumes").insert([
      {
        user_id: userId,
        work_experience: parsedResume.workExperience,
        education: parsedResume.education,
      },
    ]);
    if (dbError) {
      return NextResponse.json(
        { error: "Failed to store resume", details: dbError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      data: parsedResume,
      userId,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 },
    );
  }
}

function parseResumeText(text: string): ParsedResume {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const resume: ParsedResume = {
    workExperience: [],
    education: [],
  };

  // Section detection
  const workKeywords = [
    "experience",
    "employment",
    "work history",
    "professional experience",
  ];
  const educationKeywords = [
    "education",
    "academic",
    "university",
    "college",
    "degree",
  ];

  let currentSection = "";
  let workExperience: any = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    // Detect sections
    if (workKeywords.some((keyword) => line.includes(keyword))) {
      currentSection = "work";
      continue;
    } else if (educationKeywords.some((keyword) => line.includes(keyword))) {
      currentSection = "education";
      continue;
    }

    // Parse work experience
    if (currentSection === "work") {
      // Look for company names (followed by position/dates)
      const companyPattern =
        /^([A-Z][a-zA-Z\s&.,'-]+)(?:\s*[-\u2013\u2014]\s*([A-Za-z][a-zA-Z\s]+))?/;
      const match = lines[i].match(companyPattern);
      if (match) {
        if (workExperience.company) {
          resume.workExperience.push(workExperience);
        }
        workExperience = {
          company: match[1].trim(),
          position: match[2]?.trim() || "",
          description: "",
        };
        continue;
      }
      // Look for dates
      const datePattern =
        /(\d{4})\s*[-\u2013\u2014]\s*(\d{4}|present|current)/i;
      const dateMatch = lines[i].match(datePattern);
      if (dateMatch && workExperience.company) {
        workExperience.startDate = dateMatch[1];
        workExperience.endDate = ["present", "current"].includes(
          dateMatch[2].toLowerCase(),
        )
          ? "present"
          : dateMatch[2];
      }
      // Accumulate description
      if (workExperience.company && !lines[i].match(companyPattern)) {
        workExperience.description =
          (workExperience.description || "") + " " + lines[i];
      }
    }

    // Parse education
    if (currentSection === "education") {
      const eduPattern =
        /^([A-Z][a-zA-Z\s&.,'-]+)(?:,\s*([A-Za-z\s]+))?(?:,\s*(\d{4}))?/;
      const match = lines[i].match(eduPattern);
      if (match) {
        resume.education.push({
          institution: match[1].trim(),
          degree: match[2]?.trim() || undefined,
          graduationYear: match[3]?.trim() || undefined,
        });
      }
    }
  }

  // Push last work experience
  if (workExperience.company) {
    resume.workExperience.push(workExperience);
  }

  return resume;
}

export async function GET() {
  return NextResponse.json({
    message: "Resume upload endpoint",
    supportedFormats: ["application/pdf", "text/plain"],
    maxSize: "5MB",
  });
}
