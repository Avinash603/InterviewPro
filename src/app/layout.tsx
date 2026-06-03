import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "InterviewPro — AI Career Preparation Platform",
  description: "Master your interviews with AI-powered mock sessions, adaptive quizzes, resume optimization, and real-time coaching.",
  keywords: ["interview prep", "AI interview", "career coaching", "mock interview", "technical interview"],
  openGraph: {
    title: "InterviewPro",
    description: "AI-powered interview preparation platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(222 47% 8%)",
                color: "hsl(210 40% 94%)",
                border: "1px solid rgba(255,255,255,0.08)",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#0a1628" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#0a1628" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
