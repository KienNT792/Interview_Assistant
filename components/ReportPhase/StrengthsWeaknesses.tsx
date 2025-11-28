import React from 'react';

interface StrengthsWeaknessesProps {
  strengths: string[];
  weaknesses: string[];
}

export const StrengthsWeaknesses: React.FC<StrengthsWeaknessesProps> = ({ strengths, weaknesses }) => {
  return (
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
          {strengths.map((s, i) => (
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
          {weaknesses.map((w, i) => (
            <li key={i} className="flex items-start text-slate-700 text-sm">
              <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
              {w}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
