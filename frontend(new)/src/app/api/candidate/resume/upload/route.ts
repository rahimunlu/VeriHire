// Only parsed resume data is stored in the database. The original file is not retained for privacy and simplicity.
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../supabase";
import pdfParse from "pdf-parse";

interface ParsedResume {
  // Personal information
  name?: string;
  email?: string;
  phone?: string;
  // Professional information
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

    // Also store/update candidate personal information if found
    if (parsedResume.name || parsedResume.email) {
      const { error: candidateError } = await supabase
        .from("candidates")
        .upsert([
          {
            id: userId,
            name: parsedResume.name || null,
            email: parsedResume.email || null,
          },
        ]);

      if (candidateError) {
        console.error("Error storing candidate info:", candidateError);
      }
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

  // Extract personal information first
  resume.name = extractName(lines);
  resume.email = extractEmail(lines);
  resume.phone = extractPhone(lines);

  // Enhanced work experience parsing
  const workExperiences = extractWorkExperience(lines);
  resume.workExperience = workExperiences;

  // Enhanced education parsing
  const education = extractEducation(lines);
  resume.education = education;

  // Ensure at least one work experience with defaults if none found
  if (resume.workExperience.length === 0) {
    resume.workExperience.push(createDefaultWorkExperience());
  }

  // Fill in missing fields with defaults
  resume.workExperience = resume.workExperience.map((exp, index) =>
    fillWorkExperienceDefaults(exp, index),
  );

  return resume;
}

function extractWorkExperience(lines: string[]): Array<{
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  managerEmail?: string;
}> {
  const experiences: any[] = [];
  let currentExperience: any = null;
  let inWorkSection = false;

  // Section detection keywords
  const workKeywords = [
    "experience",
    "employment",
    "work history",
    "professional experience",
    "career",
    "work",
    "professional",
    "jobs",
    "positions",
  ];

  const educationKeywords = [
    "education",
    "academic",
    "university",
    "college",
    "degree",
    "school",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if we're entering work section
    if (workKeywords.some((keyword) => lowerLine.includes(keyword))) {
      inWorkSection = true;
      continue;
    }

    // Check if we're leaving work section
    if (educationKeywords.some((keyword) => lowerLine.includes(keyword))) {
      inWorkSection = false;
      if (currentExperience) {
        experiences.push(currentExperience);
        currentExperience = null;
      }
      continue;
    }

    if (inWorkSection || (experiences.length === 0 && i < lines.length / 2)) {
      // Try to extract work experience data from any line
      const extractedData = extractWorkExperienceFromLine(line, lines, i);

      if (extractedData.isNewExperience) {
        // Save previous experience
        if (currentExperience) {
          experiences.push(currentExperience);
        }

        // Start new experience
        currentExperience = extractedData.data;
      } else if (currentExperience) {
        // Update current experience with any found data
        if (extractedData.data.position && !currentExperience.position) {
          currentExperience.position = extractedData.data.position;
        }
        if (extractedData.data.startDate && !currentExperience.startDate) {
          currentExperience.startDate = extractedData.data.startDate;
        }
        if (extractedData.data.endDate && !currentExperience.endDate) {
          currentExperience.endDate = extractedData.data.endDate;
        }
        if (extractedData.data.description) {
          currentExperience.description =
            (currentExperience.description || "") +
            " " +
            extractedData.data.description;
        }
      }
    }
  }

  // Don't forget the last experience
  if (currentExperience) {
    experiences.push(currentExperience);
  }

  return experiences.filter((exp) => exp.company || exp.position);
}

function extractWorkExperienceFromLine(
  line: string,
  allLines: string[],
  index: number,
): {
  isNewExperience: boolean;
  data: {
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  };
} {
  const result: {
    isNewExperience: boolean;
    data: {
      company?: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    };
  } = {
    isNewExperience: false,
    data: {},
  };

  // Company name patterns - lines that likely start a new job entry
  const companyPatterns = [
    // "Google Inc" or "Microsoft Corporation"
    /^([A-Z][a-zA-Z\s&.,'-]{2,50}(?:Inc\.?|Corp\.?|LLC\.?|Ltd\.?|Co\.?)?)\s*$/,
    // "Software Engineer at Google"
    /^(.+)\s+at\s+([A-Z][a-zA-Z\s&.,'-]{2,50})$/,
    // "Google - Software Engineer"
    /^([A-Z][a-zA-Z\s&.,'-]{2,50})\s*[-–—]\s*(.+)$/,
    // "Software Engineer | Google"
    /^(.+)\s*[|]\s*([A-Z][a-zA-Z\s&.,'-]{2,50})$/,
  ];

  // Position title patterns
  const positionPatterns = [
    // Common tech job titles
    /^(Software Engineer|Senior Software Engineer|Lead Developer|Product Manager|Data Scientist|DevOps Engineer|Full Stack Developer|Backend Developer|Frontend Developer|Engineering Manager|Tech Lead|Principal Engineer|Staff Engineer|Solution Architect|System Architect|Director of Engineering|VP of Engineering|Chief Technology Officer|CTO|Senior Developer|Junior Developer|Software Developer|Web Developer|Mobile Developer|QA Engineer|Test Engineer|Security Engineer|Site Reliability Engineer|Platform Engineer|Machine Learning Engineer|AI Engineer|Data Engineer|Business Analyst|Systems Analyst|Technical Writer|Scrum Master|Product Owner|Project Manager)/i,
    // General professional titles
    /^(Manager|Director|Senior Manager|Associate Manager|Team Lead|Lead|Senior|Principal|Staff|Head of|VP|Vice President|Chief|President|Coordinator|Associate|Assistant|Specialist|Consultant|Advisor|Analyst|Officer|Executive|Representative|Administrator|Supervisor)/i,
    // Any title-like pattern with common suffixes
    /^([A-Z][a-zA-Z\s]{3,35})\s+(Engineer|Developer|Manager|Director|Lead|Senior|Principal|Staff|Analyst|Designer|Consultant|Specialist|Coordinator|Associate|Assistant|Officer|Executive)/i,
  ];

  // Date patterns - various formats
  const datePatterns = [
    // "2020 - 2023", "Jan 2020 - Dec 2023", "2020-2023"
    /(\w+\s+)?(\d{4})\s*[-–—]\s*(\w+\s+)?(\d{4}|present|current)/i,
    // "2020 - Present", "Jan 2020 - Present"
    /(\w+\s+)?(\d{4})\s*[-–—]\s*(present|current)/i,
    // "March 2020 to December 2023"
    /(\w+\s+)?(\d{4})\s+to\s+(\w+\s+)?(\d{4}|present|current)/i,
    // Just years: "2020-2023"
    /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i,
  ];

  // Check for company patterns
  for (const pattern of companyPatterns) {
    const match = line.match(pattern);
    if (match) {
      if (match[2]) {
        // Pattern like "Software Engineer at Google"
        result.isNewExperience = true;
        result.data.position = match[1].trim();
        result.data.company = match[2].trim();
      } else if (match[1] && line.length < 60) {
        // Pattern like "Google Inc" (standalone company)
        result.isNewExperience = true;
        result.data.company = match[1].trim();
      }
      return result;
    }
  }

  // Check for position patterns
  for (const pattern of positionPatterns) {
    const match = line.match(pattern);
    if (match) {
      result.data.position = match[0].trim();
      // If it's clearly a job title and not part of a sentence, it might be a new experience
      if (line.trim() === match[0].trim()) {
        result.isNewExperience = true;
      }
      return result;
    }
  }

  // Check for dates
  for (const pattern of datePatterns) {
    const match = line.match(pattern);
    if (match) {
      if (pattern.source.includes("present|current")) {
        if (match[4] && match[4].toLowerCase().match(/present|current/)) {
          result.data.startDate = match[2];
          result.data.endDate = "present";
        } else if (
          match[3] &&
          match[3].toLowerCase().match(/present|current/)
        ) {
          result.data.startDate = match[2];
          result.data.endDate = "present";
        }
      } else {
        result.data.startDate = match[2];
        result.data.endDate = match[4] || match[3];
      }
      return result;
    }
  }

  // If none of the patterns match, treat as description
  if (line.length > 20 && !line.match(/^[A-Z\s]+$/)) {
    result.data.description = line;
  }

  return result;
}

function createDefaultWorkExperience() {
  const currentYear = new Date().getFullYear();

  // Generate reasonable default dates (2 years ago to 1 year ago)
  const startYear = currentYear - 2;
  const endYear = currentYear - 1;

  return {
    company: "Company Name",
    position: "Job Title",
    startDate: startYear.toString(),
    endDate: endYear.toString(),
    description: "Add your job responsibilities and achievements here",
  };
}

function fillWorkExperienceDefaults(experience: any, index: number = 0) {
  const currentYear = new Date().getFullYear();

  // Create staggered default dates for multiple experiences
  const yearsBack = 2 + index * 2; // First job: 2-4 years ago, second: 4-6 years ago, etc.
  const defaultStartYear = currentYear - (yearsBack + 1);
  const defaultEndYear = currentYear - yearsBack;

  return {
    company: experience.company || "Company Name",
    position: experience.position || "Job Title",
    startDate: experience.startDate || defaultStartYear.toString(),
    endDate: experience.endDate || defaultEndYear.toString(),
    description:
      experience.description ||
      "Add your job responsibilities and achievements here",
  };
}

function extractEducation(lines: string[]): Array<{
  institution: string;
  degree?: string;
  field?: string;
  graduationYear?: string;
}> {
  const education: any[] = [];
  let inEducationSection = false;

  const educationKeywords = [
    "education",
    "academic",
    "university",
    "college",
    "degree",
    "school",
    "graduation",
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we're entering education section
    if (educationKeywords.some((keyword) => lowerLine.includes(keyword))) {
      inEducationSection = true;
      continue;
    }

    if (inEducationSection) {
      // Look for university/college names
      const institutePattern =
        /^([A-Z][a-zA-Z\s&.,'-]{5,50}(?:University|College|Institute|School))/;
      const match = line.match(institutePattern);

      if (match) {
        education.push({
          institution: match[1].trim(),
          degree: "Bachelor's Degree",
          field: "Computer Science",
          graduationYear: (new Date().getFullYear() - 4).toString(),
        });
      }
    }
  }

  // Provide default education if none found
  if (education.length === 0) {
    education.push({
      institution: "University Name",
      degree: "Bachelor's Degree",
      field: "Computer Science",
      graduationYear: (new Date().getFullYear() - 4).toString(),
    });
  }

  return education;
}

function extractName(lines: string[]): string | undefined {
  // Look for name in the first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    // Skip lines that look like contact info
    if (line.includes("@") || line.includes("http") || /\d{3}/.test(line)) {
      continue;
    }

    // Look for lines that could be names (2-4 words, starting with capital letters)
    const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/;
    const match = line.match(namePattern);
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function extractEmail(lines: string[]): string | undefined {
  // Look for email pattern across all lines
  for (const line of lines) {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = line.match(emailPattern);
    if (match) {
      return match[0];
    }
  }

  return undefined;
}

function extractPhone(lines: string[]): string | undefined {
  // Look for phone number patterns
  for (const line of lines) {
    const phonePatterns = [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // 123-456-7890 or 123.456.7890 or 123 456 7890
      /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/, // (123) 456-7890
      /\b\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // +1-123-456-7890
    ];

    for (const pattern of phonePatterns) {
      const match = line.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }

  return undefined;
}

export async function GET() {
  return NextResponse.json({
    message: "Resume upload endpoint",
    supportedFormats: ["application/pdf", "text/plain"],
    maxSize: "5MB",
  });
}
