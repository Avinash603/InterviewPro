"use client";
import { Bell, Search } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  user: { name?: string | null; email?: string | null };
}

export default function TopBar({ user }: TopBarProps) {
  const [query, setQuery] = useState("");

  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="relative max-w-xs w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search topics, quizzes…"
          className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-500/40 focus:bg-white/8 transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg glass border border-white/5 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-sm cursor-pointer">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
