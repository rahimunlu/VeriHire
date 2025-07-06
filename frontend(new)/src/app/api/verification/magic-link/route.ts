import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../supabase";
import { Resend } from "resend";
import { SignJWT } from "jose";

const resend = new Resend(process.env.RESEND_API_KEY);

interface VerificationRequest {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  employerEmail: string;
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      candidateId,
      candidateName,
      candidateEmail,
      employerEmail,
      company,
      position,
      startDate,
      endDate,
    }: VerificationRequest = await req.json();

    // Validate required fields
    if (
      !candidateId ||
      !candidateName ||
      !employerEmail ||
      !company ||
      !position
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate secure JWT token for verification
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback-secret",
    );
    const verificationId = crypto.randomUUID();

    const token = await new SignJWT({
      candidateId,
      candidateName,
      candidateEmail,
      employerEmail,
      company,
      position,
      startDate,
      endDate,
      verificationId,
      type: "employment_verification",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15d") // 15 days expiration
      .sign(secret);

    // Generate magic link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/verify-employment?token=${token}`;

    // Send verification email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Employment Verification Request</h1>
        
        <p>Hello,</p>
        
        <p><strong>${candidateName}</strong> (${candidateEmail}) has listed you as a reference for employment verification on VeriHire.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Verification Details:</h3>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Position:</strong> ${position}</p>
          ${startDate ? `<p><strong>Start Date:</strong> ${startDate}</p>` : ""}
          ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ""}
        </div>
        
        <p>Please click the link below to verify this employment information. The verification is anonymous and only confirms whether the candidate worked at your company.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicLink}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Employment
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 15 days. If you have any questions about this verification request, please contact our support team.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          VeriHire - Revolutionizing recruitment with verified credentials
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "VeriHire <delivered@resend.dev>",
      to: [employerEmail],
      subject: `Employment Verification Request for ${candidateName}`,
      html: emailContent,
    });

    if (error) {
      console.error("Email sending error:", error);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      );
    }

    // Store verification request in database
    const { error: dbError } = await supabase
      .from("verification_requests")
      .insert([
        {
          candidate_id: candidateId,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          employer_email: employerEmail,
          company,
          position,
          start_date: startDate,
          end_date: endDate,
          magic_link_token: token,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);
    if (dbError) {
      return NextResponse.json(
        {
          message: "Verification request stored successfully",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
      verificationId,
      employerEmail,
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Magic link generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate verification link" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "Candidate ID required" },
      { status: 400 },
    );
  }

  // Query database for verification requests and their status
  const { data, error } = await supabase
    .from("verification_requests")
    .select(
      "id, employer_email, company, position, verification_id, status, created_at",
    )
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch verification requests",
        details: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    candidateId,
    verifications: data || [],
  });
}
