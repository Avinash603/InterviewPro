"use client";
import { useState } from "react";
import { Mic, MicOff, ChevronRight, ArrowLeft, CheckCircle2, Target, MessageSquare, Zap, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const ROLES = ["Software Engineer", "Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "ML Engineer", "Data Engineer", "DevOps Engineer", "SDE-2", "Senior Engineer", "Engineering Manager"];
const TYPES = [
  { id: "TECHNICAL", label: "Technical", desc: "Algorithms, data structures, coding" },
  { id: "BEHAVIORAL", label: "Behavioral", desc: "STAR method, leadership, teamwork" },
  { id: "SYSTEM_DESIGN", label: "System Design", desc: "Scalability, architecture, APIs" },
  { id: "MIXED", label: "Mixed", desc: "Combination of all types" },
];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
const TECH_OPTIONS = ["React", "Node.js", "Python", "Java", "C++", "TypeScript", "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "System Design"];

type Phase = "setup" | "interview" | "result";

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState({ targetRole: "", type: "TECHNICAL", difficulty: "INTERMEDIATE", technologies: [] as string[], durationMinutes: 30 });
  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  function toggleTech(tech: string) {
    setConfig((c) => ({
      ...c,
      technologies: c.technologies.includes(tech)
        ? c.technologies.filter((t) => t !== tech)
        : [...c.technologies, tech],
    }));
  }

  async function startInterview() {
    if (!config.targetRole) { toast.error("Select a target role"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setInterview(data.interview);
      setQuestions(data.questions || []);
      setPhase("interview");
    } catch {
      toast.error("Failed to generate interview.");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (currentResponse.trim()) {
      setResponses((prev) => ({ ...prev, [questions[current].id]: currentResponse }));
    }
    setCurrentResponse("");
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    }
  }

  async function submitInterview() {
    const finalResponses = { ...responses };
    if (currentResponse.trim()) finalResponses[questions[current].id] = currentResponse;

    const transcript = questions.map((q) => ({
      question: q.text,
      answer: finalResponses[q.id] || "",
      type: q.type,
    }));

    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.id, transcript, responses: finalResponses }),
      });
      const data = await res.json();
      setResult(data.feedback);
      setPhase("result");
    } catch {
      toast.error("Failed to generate feedback.");
    } finally {
      setLoading(false);
    }
  }

  // Setup Phase
  if (phase === "setup") return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Mock Interview</h1>
        <p className="text-white/40">AI-powered interview simulation with real-time feedback</p>
      </div>

      <div className="space-y-6 glass rounded-2xl p-6 border border-white/8">
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Target Role</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button key={r} onClick={() => setConfig((c) => ({ ...c, targetRole: r }))}
                className={cn("px-3 py-1.5 rounded-lg text-sm border transition-all",
                  config.targetRole === r ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : "glass border-white/8 text-white/50 hover:border-white/15")}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Interview Type</label>
          <div className="grid grid-cols-2 gap-3">
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => setConfig((c) => ({ ...c, type: t.id }))}
                className={cn("p-3 rounded-xl text-left border transition-all",
                  config.type === t.id ? "bg-brand-500/15 border-brand-500/30" : "glass border-white/8 hover:border-white/15")}>
                <div className={cn("font-medium text-sm mb-0.5", config.type === t.id ? "text-brand-400" : "text-white")}>{t.label}</div>
                <div className="text-white/40 text-xs">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map((d) => (
              <button key={d} onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                className={cn("py-2 rounded-lg text-sm border transition-all capitalize",
                  config.difficulty === d ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : "glass border-white/8 text-white/40")}>
                {d.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Technologies (optional)</label>
          <div className="flex flex-wrap gap-2">
            {TECH_OPTIONS.map((t) => (
              <button key={t} onClick={() => toggleTech(t)}
                className={cn("px-3 py-1 rounded-lg text-xs border transition-all",
                  config.technologies.includes(t) ? "bg-brand-500/20 border-brand-500/30 text-brand-400" : "glass border-white/8 text-white/40 hover:border-white/15")}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={startInterview} disabled={!config.targetRole || loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? "Generating Interview…" : <><Zap className="w-4 h-4" />Start Interview</>}
        </button>
      </div>
    </div>
  );

  // Interview Phase
  if (phase === "interview" && questions.length > 0) {
    const q = questions[current];
    const isLast = current === questions.length - 1;

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-white">{interview?.title}</h2>
            <p className="text-white/40 text-sm">Question {current + 1} of {questions.length}</p>
          </div>
          <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="glass rounded-2xl p-6 border border-brand-500/15">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded text-xs bg-brand-500/15 text-brand-400 border border-brand-500/20 capitalize">
              {q.type?.toLowerCase().replace("_", " ")}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold text-white mb-4 leading-relaxed">{q.text}</h3>

          {q.followUp && (
            <div className="glass rounded-xl p-3 border border-white/5 mb-4">
              <p className="text-white/40 text-xs mb-1">Follow-up:</p>
              <p className="text-white/60 text-sm">{q.followUp}</p>
            </div>
          )}

          {q.hints && q.hints.length > 0 && (
            <details className="mb-4">
              <summary className="text-brand-400 text-xs cursor-pointer hover:text-brand-300">Show hints</summary>
              <ul className="mt-2 space-y-1">
                {q.hints.map((h: string, i: number) => (
                  <li key={i} className="text-white/40 text-xs flex items-start gap-1.5">
                    <span className="text-brand-500 mt-0.5">→</span>{h}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Type your answer here… Be thorough and use the STAR method for behavioral questions."
            className="input-field h-40 resize-none mt-2"
          />

          {/* Recording hint */}
          <div className="flex items-center gap-2 mt-3 text-white/25 text-xs">
            <Mic className="w-3 h-3" />
            <span>Voice feature available with VAPI integration</span>
          </div>
        </div>

        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => { setCurrent((c) => c - 1); setCurrentResponse(responses[questions[current - 1].id] || ""); }}
              className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {isLast ? (
            <button onClick={submitInterview} disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? "Analyzing…" : <><CheckCircle2 className="w-4 h-4" />Submit & Get Feedback</>}
            </button>
          ) : (
            <button onClick={nextQuestion} className="btn-primary flex-1 flex items-center justify-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Result Phase
  if (phase === "result" && result) {
    const scoreColor = result.overallScore >= 75 ? "text-green-400" : result.overallScore >= 55 ? "text-yellow-400" : "text-red-400";
    const METRICS = [
      { label: "Communication", value: result.communication },
      { label: "Technical Depth", value: result.technicalDepth },
      { label: "Problem Solving", value: result.problemSolving },
      { label: "Confidence", value: result.confidence },
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score */}
        <div className="glass rounded-2xl p-8 text-center border border-white/8">
          <div className={cn("font-display text-7xl font-bold mb-2", scoreColor)}>
            {result.overallScore}
          </div>
          <div className="text-white/40 mb-4">Overall Interview Score</div>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">{result.summary}</p>
        </div>

        {/* Metrics */}
        <div className="glass rounded-2xl p-5 border border-white/8">
          <h3 className="font-semibold text-white mb-4">Performance Breakdown</h3>
          <div className="space-y-3">
            {METRICS.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{m.label}</span>
                  <span className={m.value >= 75 ? "text-green-400" : m.value >= 55 ? "text-yellow-400" : "text-red-400"}>{m.value}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full">
                  <div className={cn("h-full rounded-full transition-all", m.value >= 75 ? "bg-green-500" : m.value >= 55 ? "bg-yellow-500" : "bg-red-500")}
                    style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-4 border border-green-500/15">
            <h4 className="text-green-400 font-semibold text-sm mb-3">✓ Strengths</h4>
            <ul className="space-y-1.5">
              {result.strengths?.map((s: string, i: number) => (
                <li key={i} className="text-white/60 text-xs">{s}</li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-xl p-4 border border-orange-500/15">
            <h4 className="text-orange-400 font-semibold text-sm mb-3">→ Improve</h4>
            <ul className="space-y-1.5">
              {result.improvements?.map((s: string, i: number) => (
                <li key={i} className="text-white/60 text-xs">{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps */}
        {result.nextSteps && (
          <div className="glass rounded-xl p-5 border border-white/8">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-400" /> Next Steps
            </h3>
            <ul className="space-y-2">
              {result.nextSteps.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-brand-400 font-semibold shrink-0">{i + 1}.</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={() => { setPhase("setup"); setResult(null); setCurrent(0); }}
          className="btn-primary w-full flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4" /> New Interview
        </button>
      </div>
    );
  }

  return null;
}
