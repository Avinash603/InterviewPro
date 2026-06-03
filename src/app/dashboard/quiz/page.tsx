"use client";
import { useState } from "react";
import { Brain, Clock, Target, ChevronRight, CheckCircle2, XCircle, RotateCcw, Zap, Trophy } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";
import toast from "react-hot-toast";

const TOPICS = [
  "Data Structures & Algorithms", "System Design", "JavaScript", "Python",
  "Java", "React", "Node.js", "SQL & Databases", "Machine Learning",
  "Operating Systems", "Networks", "Object-Oriented Design",
  "Dynamic Programming", "Graphs & Trees", "C++ STL",
];

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
const QUESTION_COUNTS = [5, 10, 15, 20];

type Phase = "setup" | "quiz" | "result";

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState({ topic: "", difficulty: "INTERMEDIATE" as const, count: 10 });
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(0);

  async function startQuiz() {
    if (!config.topic) { toast.error("Please select a topic"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: config.topic, difficulty: config.difficulty, count: config.count }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setAnswers({});
      setCurrent(0);
      setStartTime(Date.now());
      setPhase("quiz");
    } catch {
      toast.error("Failed to generate quiz. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    setLoading(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    try {
      const res = await fetch("/api/quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken, questions }),
      });
      const data = await res.json();
      setResult({ ...data, timeTaken });
      setPhase("result");
    } catch {
      toast.error("Failed to submit quiz.");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(answer: string) {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: answer }));
  }

  if (phase === "setup") return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Quiz Arena</h1>
        <p className="text-white/40">Generate adaptive AI quizzes on any topic, at any difficulty</p>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/8 space-y-6">
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Select Topic</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setConfig((c) => ({ ...c, topic: t }))}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm border transition-all",
                  config.topic === t
                    ? "bg-brand-500/20 border-brand-500/30 text-brand-400"
                    : "glass border-white/8 text-white/50 hover:border-white/15 hover:text-white/70"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Difficulty</label>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                className={cn(
                  "py-2 rounded-lg text-sm border transition-all capitalize",
                  config.difficulty === d
                    ? "bg-brand-500/20 border-brand-500/30 text-brand-400"
                    : "glass border-white/8 text-white/40 hover:border-white/15"
                )}
              >
                {d.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Questions: {config.count}</label>
          <div className="flex gap-3">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setConfig((c) => ({ ...c, count: n }))}
                className={cn(
                  "w-14 py-2 rounded-lg text-sm border transition-all",
                  config.count === n
                    ? "bg-brand-500/20 border-brand-500/30 text-brand-400"
                    : "glass border-white/8 text-white/40 hover:border-white/15"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          disabled={!config.topic || loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Generating Quiz…" : (
            <><Zap className="w-4 h-4" /> Generate & Start Quiz</>
          )}
        </button>
      </div>
    </div>
  );

  if (phase === "quiz" && questions.length > 0) {
    const q = questions[current];
    const answered = answers[q.id];
    const progress = ((current + 1) / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress */}
        <div className="glass rounded-xl p-4 border border-white/8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-sm">Question {current + 1} of {questions.length}</span>
            <span className="text-white/50 text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {config.topic}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded text-xs bg-brand-500/15 text-brand-400 border border-brand-500/20">
              {q.type}
            </span>
            <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/30 border border-white/8">
              {q.points} pts
            </span>
          </div>

          <h2 className="font-display text-lg font-semibold text-white mb-2">{q.text}</h2>

          {q.codeSnippet && (
            <pre className="code-block p-4 text-sm text-green-300 overflow-x-auto mb-4 text-xs">
              {q.codeSnippet}
            </pre>
          )}

          {/* Options */}
          {q.options && (
            <div className="space-y-2 mt-4">
              {q.options.map((opt: string, i: number) => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(opt)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    answered === opt
                      ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                      : "glass border-white/8 text-white/70 hover:border-white/20 hover:text-white"
                  )}
                >
                  <span className="text-white/30 mr-3">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Text answer */}
          {q.type === "SHORT_ANSWER" && (
            <textarea
              placeholder="Type your answer…"
              className="input-field mt-4 h-24 resize-none"
              value={answers[q.id] || ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          )}
        </div>

        {/* Nav */}
        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => setCurrent((c) => c - 1)} className="btn-secondary flex-1">
              Previous
            </button>
          )}
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              disabled={!answered}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={loading || Object.keys(answers).length < questions.length}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? "Submitting…" : "Submit Quiz"}
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-6 h-6 rounded-full text-xs border transition-all",
                i === current ? "bg-brand-500 border-brand-500 text-black font-bold" :
                answers[questions[i].id] ? "bg-brand-500/30 border-brand-500/40 text-brand-400" :
                "glass border-white/10 text-white/30"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const { score, tips, timeTaken } = result;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score */}
        <div className={cn(
          "glass rounded-2xl p-8 border text-center",
          score >= 80 ? "border-green-500/30" : score >= 60 ? "border-yellow-500/30" : "border-red-500/30"
        )}>
          <Trophy className={cn("w-12 h-12 mx-auto mb-4", score >= 80 ? "text-gold-400" : score >= 60 ? "text-yellow-400" : "text-white/30")} />
          <div className={cn("font-display text-6xl font-bold mb-2", score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400")}>
            {Math.round(score)}%
          </div>
          <p className="text-white/50 text-sm">
            {score >= 80 ? "Excellent! 🎉" : score >= 60 ? "Good work! Keep practicing" : "Keep going! You'll improve"}
          </p>
          <div className="flex justify-center gap-6 mt-5 text-sm text-white/40">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(timeTaken)}</span>
            <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{config.topic}</span>
          </div>
        </div>

        {/* Review */}
        <div className="glass rounded-2xl border border-white/8">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">Answer Review</h3>
          </div>
          <div className="p-4 space-y-3">
            {questions.map((q, i) => {
              const correct = answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase();
              return (
                <div key={q.id} className={cn("p-3 rounded-xl border", correct ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20")}>
                  <div className="flex items-start gap-2">
                    {correct ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm">{q.text}</p>
                      {!correct && (
                        <div className="mt-1">
                          <span className="text-red-400 text-xs">Your answer: {answers[q.id] || "Skipped"}</span>
                          <span className="text-green-400 text-xs ml-3">Correct: {q.correctAnswer}</span>
                        </div>
                      )}
                      {q.explanation && <p className="text-white/40 text-xs mt-1">{q.explanation}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        {tips?.length > 0 && (
          <div className="glass rounded-2xl p-5 border border-white/8">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-400" /> AI Improvement Tips
            </h3>
            <ul className="space-y-2">
              {tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-brand-400 font-semibold shrink-0">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setPhase("setup")}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Try Another Quiz
        </button>
      </div>
    );
  }

  return null;
}
