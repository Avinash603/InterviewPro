import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/db";

// ATS Analysis
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { resumeText, jobDescription, resumeId } = await req.json();

  const analysisPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription || "Software Engineer role — general analysis"}

Provide detailed ATS analysis:
{
  "atsScore": 78,
  "keywordMatch": 65,
  "formatScore": 90,
  "contentScore": 75,
  "matchedKeywords": ["Python", "React", "AWS"],
  "missingKeywords": ["Kubernetes", "GraphQL", "TypeScript"],
  "sections": {
    "summary": { "score": 70, "feedback": "Strengthen with quantifiable achievements" },
    "experience": { "score": 80, "feedback": "Good use of action verbs" },
    "skills": { "score": 85, "feedback": "Well organized" },
    "education": { "score": 90, "feedback": "Clear and complete" }
  },
  "improvements": [
    { "priority": "high", "section": "summary", "issue": "Missing keywords", "suggestion": "Add specific tech stack mentions" }
  ],
  "enhancedSummary": "Rewritten summary with better ATS optimization",
  "overallFeedback": "Comprehensive paragraph feedback"
}`;

  const analysis = await generateJSON<any>(analysisPrompt, "ATS analysis object");

  // Save suggestions to resume if resumeId provided
  if (resumeId) {
    await db.resume.update({
      where: { id: resumeId, userId },
      data: { atsScore: analysis.atsScore, suggestions: analysis },
    });
  }

  return NextResponse.json(analysis);
}

// Enhance specific resume section
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, content, targetRole, jobDescription } = await req.json();

  const prompt = `Rewrite this resume ${section} section to be stronger, more ATS-friendly, and impactful for a ${targetRole || "software engineer"} role.

Original:
${content}

Job context: ${jobDescription || "general software engineering"}

Return JSON:
{
  "enhanced": "Rewritten content",
  "changes": ["What was improved"],
  "keywords_added": ["keyword1", "keyword2"]
}

Make it more quantifiable, action-verb driven, and keyword-rich. Keep the same factual content.`;

  const result = await generateJSON<any>(prompt, "{ enhanced, changes[], keywords_added[] }");
  return NextResponse.json(result);
}
