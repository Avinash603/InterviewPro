export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  subscription: "FREE" | "PRO" | "ENTERPRISE";
  onboardingDone: boolean;
  targetRole?: string | null;
  experienceLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "system_design" | "coding";
  followUp?: string;
  hints?: string[];
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: "MCQ" | "CODING" | "SHORT_ANSWER" | "TRUE_FALSE";
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  codeSnippet?: string;
  language?: string;
  points: number;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications?: CertificationItem[];
  publications?: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  bullets: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  achievements?: string[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  highlights: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface DashboardStats {
  totalInterviews: number;
  avgScore: number;
  quizzesTaken: number;
  studyStreak: number;
  weeklyProgress: number[];
  skillScores: { skill: string; score: number }[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: "interview" | "quiz" | "chat" | "resume";
  title: string;
  score?: number;
  createdAt: Date;
}
