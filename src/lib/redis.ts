import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Generic cache-aside helper
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  const fresh = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}

export const CACHE_KEYS = {
  userDashboard: (userId: string) => `dashboard:${userId}`,
  insights: (userId: string, industry: string) => `insights:${userId}:${industry}`,
  roadmap: (userId: string) => `roadmap:${userId}`,
  chatSession: (sessionId: string) => `chat:session:${sessionId}`,
  quizList: (topic: string, diff: string) => `quiz:${topic}:${diff}`,
  leaderboard: () => "leaderboard:global",
};
