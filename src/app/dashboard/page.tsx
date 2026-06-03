import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Mic, Brain, Code2, FileText, TrendingUp, MessageSquare, ArrowRight, Target, ChevronRight } from "lucide-react";

const QUICK_ACTIONS = [
  { href: "/dashboard/interview", icon: Mic, label: "Start Interview", desc: "Voice mock session", color: "from-green-500/20 to-emerald-500/5 border-green-500/20" },
  { href: "/dashboard/quiz", icon: Brain, label: "Take Quiz", desc: "Test your knowledge", color: "from-blue-500/20 to-cyan-500/5 border-blue-500/20" },
  { href: "/dashboard/code", icon: Code2, label: "Code Lab", desc: "Practice problems", color: "from-purple-500/20 to-violet-500/5 border-purple-500/20" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Coach", desc: "Get guidance", color: "from-orange-500/20 to-amber-500/5 border-orange-500/20" },
  { href: "/dashboard/resume", icon: FileText, label: "Resume Builder", desc: "ATS optimization", color: "from-pink-500/20 to-rose-500/5 border-pink-500/20" },
  { href: "/dashboard/roadmap", icon: TrendingUp, label: "Learning Roadmap", desc: "Personalized path", color: "from-teal-500/20 to-cyan-500/5 border-teal-500/20" },
];

async function getDashboardData(userId: string) {
  const [interviews, quizAttempts, chatSessions] = await Promise.all([
    db.interview.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.quizAttempt.findMany({ where: { userId }, orderBy: { completedAt: "desc" }, take: 5 }),
    db.chatSession.count({ where: { userId } }),
  ]);

  const avgScore = interviews.filter(i => i.score).length
    ? interviews.filter(i => i.score).reduce((a, i) => a + (i.score || 0), 0) / interviews.filter(i => i.score).length
    : 0;

  return { interviews, quizAttempts, chatSessions, avgScore };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const data = await getDashboardData(userId);
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const STATS = [
    { label: "Interviews Done", value: data.interviews.length, icon: Mic, color: "text-green-400" },
    { label: "Avg Score", value: data.avgScore ? `${Math.round(data.avgScore)}%` : "—", icon: Target, color: "text-blue-400" },
    { label: "Quizzes Taken", value: data.quizAttempts.length, icon: Brain, color: "text-purple-400" },
    { label: "Chat Sessions", value: data.chatSessions, icon: MessageSquare, color: "text-orange-400" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-1">Good day, {firstName} 👋</h1>
        <p className="text-white/40">Ready to level up your interview game today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass rounded-xl p-5 border border-white/5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/40 text-sm">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-lg font-semibold text-white mb-4">Quick Start</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}
                className={`group rounded-xl p-5 bg-gradient-to-br ${action.color} border card-hover block`}>
                <Icon className="w-6 h-6 text-white mb-3" />
                <div className="font-semibold text-white text-sm">{action.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{action.desc}</div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all mt-3" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl border border-white/5">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">Recent Interviews</h3>
            <Link href="/dashboard/interview" className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {data.interviews.length === 0 ? (
              <div className="text-center py-6">
                <Mic className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-sm">No interviews yet</p>
                <Link href="/dashboard/interview" className="text-brand-400 text-xs mt-1 hover:text-brand-300 block">Start your first →</Link>
              </div>
            ) : (
              data.interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-sm font-medium">{interview.title}</div>
                    <div className="text-white/30 text-xs">{interview.type} · {interview.targetRole}</div>
                  </div>
                  {interview.score != null && (
                    <span className={`text-sm font-semibold ${interview.score >= 70 ? "text-green-400" : interview.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                      {Math.round(interview.score)}%
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass rounded-xl border border-white/5">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">Quiz Results</h3>
            <Link href="/dashboard/quiz" className="text-brand-400 text-xs flex items-center gap-1 hover:text-brand-300">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {data.quizAttempts.length === 0 ? (
              <div className="text-center py-6">
                <Brain className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/30 text-sm">No quizzes taken yet</p>
                <Link href="/dashboard/quiz" className="text-brand-400 text-xs mt-1 hover:text-brand-300 block">Try a quiz →</Link>
              </div>
            ) : (
              data.quizAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-sm font-medium">Quiz Attempt</div>
                    <div className="text-white/30 text-xs">{Math.round(attempt.timeTaken / 60)} min · {attempt.totalPoints} pts</div>
                  </div>
                  <span className={`text-sm font-semibold ${attempt.score >= 70 ? "text-green-400" : attempt.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                    {Math.round(attempt.score)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
