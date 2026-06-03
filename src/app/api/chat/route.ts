import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/ai";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";

const SYSTEM_PROMPTS: Record<string, string> = {
  career: `You are InterviewPro's expert AI career coach. You help software engineers and CS students prepare for technical interviews. You provide:
- Detailed, actionable interview preparation advice
- Industry-specific insights about companies like Google, Amazon, Microsoft, Meta
- Resume and portfolio feedback
- Behavioral interview coaching using the STAR method
- Technical interview strategies
Be encouraging, specific, and practical. Keep responses concise but comprehensive.`,

  technical: `You are a senior software engineer and technical interview coach. Help candidates with:
- Data structures and algorithms explanations with examples
- System design interview preparation
- Code review and optimization tips
- Common interview patterns and problem-solving strategies
- Language-specific best practices
Provide working code examples when helpful. Be precise and educational.`,

  behavioral: `You are a behavioral interview coach specializing in helping engineers articulate their experiences. Help with:
- STAR method responses for common behavioral questions
- Leadership, conflict resolution, and teamwork scenarios
- Company culture fit preparation
- Weakness framing and growth mindset communication
Ask follow-up questions to help the user refine their stories.`,

  code: `You are a competitive programming and technical interview coding coach. Help with:
- Step-by-step problem-solving approaches
- Time and space complexity analysis
- Multiple solution approaches from brute force to optimal
- Edge case identification
- Clean, production-quality code
Format code in markdown code blocks with language specified.`,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { messages, sessionId, mode = "career" } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  // Buffer to Redis
  const cacheKey = `chat:active:${sessionId}`;
  await redis.setex(cacheKey, 3600, JSON.stringify(messages));

  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.career;

  const stream = await groq.chat.completions.create({
    model: MODELS.GROQ_SMART,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  });

  const encoder = new TextEncoder();
  let fullContent = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
          }
        }

        // Persist to DB asynchronously
        if (sessionId && fullContent) {
          Promise.all([
            db.chatMessage.createMany({
              data: [
                {
                  sessionId,
                  role: "user",
                  content: messages[messages.length - 1].content,
                },
                {
                  sessionId,
                  role: "assistant",
                  content: fullContent,
                  model: MODELS.GROQ_SMART,
                },
              ],
            }),
            db.chatSession.update({
              where: { id: sessionId },
              data: { updatedAt: new Date() },
            }),
          ]).catch(console.error);
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
