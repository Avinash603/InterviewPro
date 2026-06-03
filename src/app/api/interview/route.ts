import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/db";
import { z } from "zod";

const generateSchema = z.object({
  targetRole: z.string(),
  type: z.enum(["TECHNICAL", "BEHAVIORAL", "SYSTEM_DESIGN", "CODING", "MIXED"]),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  technologies: z.array(z.string()).default([]),
  durationMinutes: z.number().default(30),
});

// Generate interview questions
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const params = generateSchema.parse(body);

  const prompt = `Generate a ${params.type} interview question set for a ${params.difficulty} ${params.targetRole} role.
Technologies: ${params.technologies.join(", ") || "general"}
Duration: ${params.durationMinutes} minutes

Return JSON:
{
  "title": "Interview title",
  "questions": [
    {
      "id": "q1",
      "text": "Question text",
      "type": "technical|behavioral|system_design|coding",
      "followUp": "Follow-up question",
      "hints": ["Hint 1", "Hint 2"],
      "expectedTopics": ["topic1", "topic2"]
    }
  ],
  "estimatedTime": 30
}

Generate 5-8 questions appropriate for ${params.durationMinutes} minutes. Mix difficulty within the set.`;

  const questionSet = await generateJSON<any>(prompt, "{ title, questions[], estimatedTime }");

  // Create interview record
  const interview = await db.interview.create({
    data: {
      userId,
      title: questionSet.title || `${params.type} Interview — ${params.targetRole}`,
      type: params.type,
      difficulty: params.difficulty,
      targetRole: params.targetRole,
      technologies: params.technologies,
      durationMinutes: params.durationMinutes,
      status: "pending",
    },
  });

  return NextResponse.json({ interview, questions: questionSet.questions });
}

// Submit interview feedback
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interviewId, transcript, responses } = await req.json();

  if (!interviewId) return NextResponse.json({ error: "Interview ID required" }, { status: 400 });

  const feedbackPrompt = `Evaluate this interview performance:

Transcript: ${JSON.stringify(transcript).slice(0, 3000)}

Score the interview (0-100) and provide structured feedback:
{
  "overallScore": 75,
  "communication": 80,
  "technicalDepth": 70,
  "problemSolving": 75,
  "confidence": 80,
  "strengths": ["Clear explanations", "Good examples"],
  "improvements": ["Be more specific about complexity", "Practice STAR method"],
  "summary": "Overall assessment paragraph",
  "nextSteps": ["Review big-O notation", "Practice system design"]
}`;

  const feedback = await generateJSON<any>(feedbackPrompt, "{ overallScore, communication, technicalDepth, problemSolving, confidence, strengths[], improvements[], summary, nextSteps[] }");

  const updated = await db.interview.update({
    where: { id: interviewId },
    data: {
      status: "completed",
      score: feedback.overallScore,
      transcript,
      feedback,
      strengths: feedback.strengths || [],
      improvements: feedback.improvements || [],
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ interview: updated, feedback });
}
