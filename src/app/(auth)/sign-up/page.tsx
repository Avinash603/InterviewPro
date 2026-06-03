"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Github, Sparkles, Chrome, CheckCircle2 } from "lucide-react";

const PERKS = [
  "5 free mock interviews per month",
  "200+ quiz questions across all topics",
  "AI career chat & coaching",
  "Resume analysis & optimization",
];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      toast.success("Account created! Let's get you set up.");
      router.push("/onboarding");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left — value prop */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold text-xl text-white">InterviewPro</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Start your journey to <span className="shimmer-text">your dream role</span>
          </h2>
          <p className="text-white/40 mb-8">
            Join 50,000+ professionals who've used InterviewPro to ace interviews at top companies.
          </p>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-white/70">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div>
          <div className="text-center mb-6 md:hidden">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <span className="font-display font-bold text-xl text-white">InterviewPro</span>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-8 border border-white/10">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-white/40 text-sm mb-6">Free forever, no credit card required</p>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                className="btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <Chrome className="w-4 h-4" /> Google
              </button>
              <button
                onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
                className="btn-secondary flex items-center justify-center gap-2 text-sm"
              >
                <Github className="w-4 h-4" /> GitHub
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-xs">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Avi Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    required
                    className="input-field pr-11"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? "Creating account…" : "Create Free Account"}
              </button>
            </form>

            <p className="text-center text-white/40 text-xs mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="text-center text-white/40 text-sm mt-3">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
