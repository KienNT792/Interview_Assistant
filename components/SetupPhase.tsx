import React, { useState } from 'react';
import { InterviewData } from '../types';

interface SetupPhaseProps {
  onStart: (data: InterviewData) => void;
  isLoading: boolean;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onStart, isLoading }) => {
  const [jd, setJd] = useState('');
  const [cv, setCv] = useState('');
  const [culture, setCulture] = useState('Chuyên nghiệp, sáng tạo, cởi mở.');

  const handleStart = () => {
    if (!jd.trim() || !cv.trim()) {
      alert("Vui lòng nhập cả JD và CV.");
      return;
    }
    onStart({ jobDescription: jd, candidateCV: cv, companyCulture: culture });
  };

  const fillSample = () => {
    setJd(`Vị trí: Senior React Engineer
Yêu cầu:
- 5+ năm kinh nghiệm với React, TypeScript.
- Hiểu sâu về Lifecycle, Hooks, Performance Optimization.
- Có kinh nghiệm với Tailwind CSS, State Management (Redux/Zustand).
- Khả năng làm việc độc lập, tiếng Anh tốt.
- Tư duy sản phẩm tốt.`);
    setCv(`Nguyễn Văn A
Kinh nghiệm:
- 6 năm làm Frontend Developer.
- Chuyên gia ReactJS, NextJS.
- Đã từng lead team 5 người.
- Tiếng Anh giao tiếp trôi chảy (IELTS 7.0).
Kỹ năng: React, Node.js, AWS.`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Thiết lập Phỏng vấn AI</h2>
        <p className="text-slate-500">Nhập thông tin công việc và hồ sơ ứng viên để AI chuẩn bị kịch bản.</p>
        <button onClick={fillSample} className="text-sm text-blue-600 hover:underline mt-2">
          Dùng dữ liệu mẫu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả công việc (JD)</label>
          <textarea
            className="w-full h-64 p-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 transition-all"
            placeholder="Dán nội dung JD vào đây..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Hồ sơ ứng viên (CV)</label>
          <textarea
            className="w-full h-64 p-4 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-slate-50 transition-all"
            placeholder="Dán nội dung CV vào đây..."
            value={cv}
            onChange={(e) => setCv(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">Văn hoá công ty / Phong cách phỏng vấn</label>
        <input
          type="text"
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
          value={culture}
          onChange={(e) => setCulture(e.target.value)}
          placeholder="Ví dụ: Nghiêm túc, thân thiện, startup, tập đoàn lớn..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={isLoading}
          className={`px-8 py-4 rounded-full font-bold text-white text-lg shadow-lg transition-all transform hover:scale-105 ${
            isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang phân tích dữ liệu...
            </span>
          ) : (
            'Bắt đầu Phỏng vấn'
          )}
        </button>
      </div>
    </div>
  );
};
