import React from 'react';

interface DetailedAnalysisProps {
  details: string;
}

export const DetailedAnalysis: React.FC<DetailedAnalysisProps> = ({ details }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 mb-8">
      <h4 className="text-lg font-bold text-slate-800 mb-4">Phân tích chi tiết</h4>
      <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
        {details}
      </div>
    </div>
  );
};
