import React from 'react';

interface InterviewHeaderProps {
  isConnected: boolean;
  onEndInterview: () => void;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({ isConnected, onEndInterview }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Phỏng vấn trực tiếp</h2>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {isConnected ? 'Đã kết nối ●' : 'Đang kết nối...'}
        </span>
      </div>
      <button 
        onClick={onEndInterview}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-md"
      >
        Kết thúc Phỏng vấn
      </button>
    </div>
  );
};
