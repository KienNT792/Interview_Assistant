import React, { useEffect, useState } from 'react';
import { generateReport } from '../services/gemini-service';
import { InterviewData, ReportData, TranscriptItem } from '../types';

interface ReportPhaseProps {
  transcript: TranscriptItem[];
  data: InterviewData;
  onRestart: () => void;
}

export const ReportPhase: React.FC<ReportPhaseProps> = ({ transcript, data, onRestart }) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await generateReport(transcript, data);
        setReport(result);
      } catch (e) {
        console.error(e);
        alert("Có lỗi khi tạo báo cáo. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-700">Đang chấm điểm phỏng vấn...</h2>
        <p className="text-slate-500 mt-2">AI đang phân tích câu trả lời và hành vi của ứng viên.</p>
      </div>
    );
  }

  if (!report) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (rec: string) => {
    const map: Record<string, string> = {
      STRONG_HIRE: "bg-green-100 text-green-800 border-green-200",
      HIRE: "bg-blue-100 text-blue-800 border-blue-200",
      MAYBE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      NO_HIRE: "bg-red-100 text-red-800 border-red-200",
    };
    return map[rec] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Kết quả Phỏng vấn</h2>
        <p className="text-slate-500">Báo cáo đánh giá năng lực chi tiết từ AI</p>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
               <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={report.score >= 80 ? 'text-green-500' : report.score >= 60 ? 'text-yellow-500' : 'text-red-500'}
                    strokeDasharray={`${report.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
               </svg>
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className={`text-4xl font-bold ${getScoreColor(report.score)}`}>{report.score}</span>
                  <span className="block text-xs text-slate-400">/ 100</span>
               </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                 <h3 className="text-2xl font-bold text-slate-800">Tổng quan</h3>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRecommendationBadge(report.recommendation)}`}>
                    {report.recommendation.replace('_', ' ')}
                 </span>
               </div>
               <p className="text-slate-600 leading-relaxed">{report.summary}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Strengths */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
           <h4 className="text-lg font-bold text-green-700 mb-4 flex items-center">
             <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             Điểm mạnh
           </h4>
           <ul className="space-y-2">
             {report.strengths.map((s, i) => (
               <li key={i} className="flex items-start text-slate-700 text-sm">
                 <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                 {s}
               </li>
             ))}
           </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
           <h4 className="text-lg font-bold text-red-700 mb-4 flex items-center">
             <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
             Điểm cần cải thiện
           </h4>
           <ul className="space-y-2">
             {report.weaknesses.map((w, i) => (
               <li key={i} className="flex items-start text-slate-700 text-sm">
                 <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                 {w}
               </li>
             ))}
           </ul>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 mb-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4">Phân tích chi tiết</h4>
        <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
          {report.details}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onRestart}
          className="bg-slate-800 text-white px-8 py-3 rounded-full hover:bg-slate-900 transition-colors shadow-lg font-medium"
        >
          Bắt đầu phiên mới
        </button>
      </div>
    </div>
  );
};
