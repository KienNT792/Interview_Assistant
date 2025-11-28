import React, { useState } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { LiveInterview } from './components/LiveInterview';
import { ReportPhase } from './components/ReportPhase';
import { AppStage, InterviewData, AnalysisResult, TranscriptItem } from './types';
import { analyzeProfile } from './services/gemini-service';

function App() {
  const [stage, setStage] = useState<AppStage>(AppStage.SETUP);
  const [data, setData] = useState<InterviewData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  const handleStartAnalysis = async (inputData: InterviewData) => {
    setData(inputData);
    setStage(AppStage.ANALYZING);
    try {
      const result = await analyzeProfile(inputData);
      setAnalysis(result);
      setStage(AppStage.INTERVIEW);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Không thể phân tích hồ sơ. Vui lòng kiểm tra API Key hoặc thử lại.");
      setStage(AppStage.SETUP);
    }
  };

  const handleInterviewFinish = (finalTranscript: TranscriptItem[]) => {
    setTranscript(finalTranscript);
    setStage(AppStage.REPORT);
  };

  const restart = () => {
    setStage(AppStage.SETUP);
    setData(null);
    setAnalysis(null);
    setTranscript([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              Interviewer Pro
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <span className={stage === AppStage.SETUP ? "text-blue-600" : ""}>1. Thiết lập</span>
            <span className={stage === AppStage.INTERVIEW ? "text-blue-600" : ""}>2. Phỏng vấn</span>
            <span className={stage === AppStage.REPORT ? "text-blue-600" : ""}>3. Đánh giá</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stage === AppStage.SETUP && (
          <SetupPhase onStart={handleStartAnalysis} isLoading={false} />
        )}

        {stage === AppStage.ANALYZING && (
           <SetupPhase onStart={() => {}} isLoading={true} />
        )}

        {stage === AppStage.INTERVIEW && analysis && (
          <LiveInterview 
            analysis={analysis} 
            onFinish={handleInterviewFinish} 
          />
        )}

        {stage === AppStage.REPORT && data && (
          <ReportPhase 
            transcript={transcript} 
            data={data}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
