import React from 'react';

interface ScoreCardProps {
  score: number;
  recommendation: string;
  summary: string;
}

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

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, recommendation, summary }) => {
  return (
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
              className={score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}
              strokeDasharray={`${score}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="block text-xs text-slate-400">/ 100</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h3 className="text-2xl font-bold text-slate-800">Tổng quan</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRecommendationBadge(recommendation)}`}>
              {recommendation.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
};
