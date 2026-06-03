import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateJSON } from "@/lib/ai";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  topic: z.string().min(1).max(100),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  count: z.number().min(5).max(20).default(10),
  type: z.enum(["MCQ", "CODING", "SHORT_ANSWER", "TRUE_FALSE", "MIXED"]).default("MCQ"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { topic, difficulty, count, type } = schema.parse(body);

  const cacheKey = CACHE_KEYS.quizList(topic, difficulty);
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  const questionsPrompt = `Generate ${count} ${type === "MIXED" ? "mixed type" : type} quiz questions about "${topic}" for ${difficulty} level candidates.

Return JSON with this exact structure:
{
  "title": "Quiz title",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "text": "Question text",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "points": 10
    }
  ]
}

For MCQ: always provide 4 options.
For CODING: include a codeSnippet field with buggy or incomplete code, set language field.
For SHORT_ANSWER: no options needed, correctAnswer is key terms.
For TRUE_FALSE: options should be ["True", "False"].
Make questions progressively harder. Include practical, real-interview-level questions.`;

  const quizData = await generateJSON<any>(questionsPrompt, "{ title, topic, difficulty, questions[] }");

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(quizData));

  return NextResponse.json(quizData);
}

// Submit quiz attempt
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { quizId, answers, timeTaken, questions } = await req.json();

  // Calculate score
  let earned = 0;
  let total = 0;
  for (const q of questions) {
    total += q.points;
    if (answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase()) {
      earned += q.points;
    }
  }
  const score = total > 0 ? (earned / total) * 100 : 0;

  // Generate personalized tips
  const wrong = questions.filter((q: any) => answers[q.id]?.toLowerCase() !== q.correctAnswer?.toLowerCase());
  const tipsPrompt = `A candidate scored ${Math.round(score)}% on a ${questions[0]?.topic || "technical"} quiz. They got wrong: ${wrong.map((q: any) => q.text).slice(0, 3).join("; ")}. Give 3 concise, specific improvement tips as a JSON array of strings.`;
  
  let tips: string[] = [];
  try {
    const tipsData = await generateJSON<{ tips: string[] }>(tipsPrompt, '{ "tips": string[] }');
    tips = tipsData.tips || [];
  } catch { tips = ["Review the topics you missed", "Practice more problems", "Study the fundamentals"]; }

  const attempt = await db.quizAttempt.create({
    data: {
      userId,
      quizId: quizId || "generated",
      score,
      totalPoints: total,
      earnedPoints: earned,
      timeTaken,
      answers,
      tips,
    },
  });

  return NextResponse.json({ attempt, score, tips });
}
