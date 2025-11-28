export enum AppStage {
  SETUP = 'SETUP',
  ANALYZING = 'ANALYZING',
  INTERVIEW = 'INTERVIEW',
  REPORT_LOADING = 'REPORT_LOADING',
  REPORT = 'REPORT',
}

export interface InterviewData {
  jobDescription: string;
  candidateCV: string;
  companyCulture: string;
}

export interface AnalysisResult {
  systemInstruction: string;
  interviewFocus: string[];
  candidateStrengths: string[];
  initialGreeting: string;
}

export interface ReportData {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: "STRONG_HIRE" | "HIRE" | "MAYBE" | "NO_HIRE";
  details: string;
}

export interface TranscriptItem {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
