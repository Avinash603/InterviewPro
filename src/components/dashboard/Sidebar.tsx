"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Mic, Brain, Code2, FileText, TrendingUp,
  MessageSquare, BarChart3, Trophy, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/interview", icon: Mic, label: "Mock Interview" },
  { href: "/dashboard/quiz", icon: Brain, label: "Quiz Arena" },
  { href: "/dashboard/code", icon: Code2, label: "Code Lab" },
  { href: "/dashboard/resume", icon: FileText, label: "Resume Builder" },
  { href: "/dashboard/roadmap", icon: TrendingUp, label: "Learning Roadmap" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Career Coach" },
  { href: "/dashboard/insights", icon: BarChart3, label: "Industry Insights" },
  { href: "/dashboard/achievements", icon: Trophy, label: "Achievements" },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function Sidebar({ user }: SidebarProps) {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-display font-bold text-lg text-white">InterviewPro</span>
        </Link>
        <div className="mt-2 text-xs text-brand-400 font-medium">Free · All Features Unlocked</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} className={cn(active ? "sidebar-item-active" : "sidebar-item")}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl glass border border-white/5">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-medium truncate">{user?.name || "User"}</div>
            <div className="text-white/30 text-xs truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
