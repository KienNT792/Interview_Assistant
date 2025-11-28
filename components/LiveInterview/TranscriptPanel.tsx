import React from 'react';
import { TranscriptItem } from '../../types';

interface TranscriptPanelProps {
  transcript: TranscriptItem[];
  interviewFocus: string[];
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, interviewFocus }) => {
  return (
    <div className="w-1/3 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-700">Trực tiếp hội thoại</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {transcript.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-10 italic">Hội thoại sẽ xuất hiện tại đây...</p>
        )}
        {transcript.map((item, idx) => (
          <div key={idx} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              item.role === 'user' 
              ? 'bg-blue-100 text-blue-900 rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
            }`}>
              <span className="text-xs font-bold block mb-1 opacity-70">
                {item.role === 'user' ? 'Bạn' : 'Interviewer AI'}
              </span>
              {item.text}
            </div>
          </div>
        ))}
      </div>
      
      {/* Context Hints */}
      <div className="p-4 bg-yellow-50 border-t border-yellow-100">
        <p className="text-xs text-yellow-800 font-medium mb-1">TRỌNG TÂM PHỎNG VẤN:</p>
        <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
          {interviewFocus.map((focus, i) => (
            <li key={i}>{focus}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
