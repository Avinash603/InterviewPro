"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Code2, Heart, BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

const MODES = [
  { id: "career", label: "Career Coach", icon: Sparkles, desc: "Job strategy, negotiation, career planning" },
  { id: "technical", label: "Technical", icon: Code2, desc: "DSA, system design, architecture" },
  { id: "behavioral", label: "Behavioral", icon: Heart, desc: "STAR stories, soft skills, culture fit" },
  { id: "code", label: "Code Helper", icon: BookOpen, desc: "Code review, debugging, optimization" },
];

const STARTERS = {
  career: ["How do I negotiate a higher salary?", "What skills should I focus on for a FAANG role?", "How do I transition from backend to ML engineering?"],
  technical: ["Explain the difference between HashMap and TreeMap", "How would you design WhatsApp?", "Walk me through dynamic programming approaches"],
  behavioral: ["Help me answer 'Tell me about yourself'", "How do I explain a gap in my resume?", "Give me STAR examples for leadership questions"],
  code: ["Review my binary search implementation", "How do I optimize this O(n²) solution?", "Explain time complexity of merge sort"],
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [mode, setMode] = useState("career");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg: Message = { id: uuidv4(), role: "user", content };
    const assistantMsg: Message = { id: uuidv4(), role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          sessionId,
          mode,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const { content: delta } = JSON.parse(line.slice(6));
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m))
              );
            } catch {}
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, content: "Sorry, something went wrong. Please try again." } : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, mode, sessionId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Mode Selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all border",
                mode === m.id
                  ? "bg-brand-500/15 border-brand-500/30 text-brand-400"
                  : "glass border-white/8 text-white/50 hover:text-white/70 hover:border-white/15"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto glass rounded-2xl border border-white/8 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mb-4">
              <currentMode.icon className="w-7 h-7 text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-semibold text-white mb-2">{currentMode.label}</h2>
            <p className="text-white/40 text-sm mb-6 max-w-sm">{currentMode.desc}</p>
            <div className="grid gap-2 w-full max-w-sm">
              {STARTERS[mode as keyof typeof STARTERS].map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-2.5 rounded-xl glass border border-white/8 text-white/60 text-sm hover:border-white/15 hover:text-white/80 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-brand-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-brand-500/20 border border-brand-500/30 text-white rounded-tr-sm"
                      : "glass border border-white/8 text-white/85 rounded-tl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className={cn("prose prose-invert prose-sm max-w-none", !msg.content && "cursor-blink")}>
                      {msg.content ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        <span className="text-white/40">Thinking…</span>
                      )}
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask your ${currentMode.label} anything… (Enter to send, Shift+Enter for new line)`}
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-500/40 resize-none transition-all max-h-32 overflow-y-auto"
              style={{ minHeight: "44px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-400 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
