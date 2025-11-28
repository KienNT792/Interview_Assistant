import React, { useState } from 'react';
import { InterviewData } from '../../types';
import { Button } from '../common/Button';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_CANDIDATE_CV, DEFAULT_COMPANY_CULTURE } from '../../constants/sampleData';

interface SetupPhaseProps {
  onStart: (data: InterviewData) => void;
  isLoading: boolean;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onStart, isLoading }) => {
  const [jd, setJd] = useState('');
  const [cv, setCv] = useState('');
  const [culture, setCulture] = useState(DEFAULT_COMPANY_CULTURE);

  const handleStart = () => {
    if (!jd.trim() || !cv.trim()) {
      alert("Vui lòng nhập cả JD và CV.");
      return;
    }
    onStart({ jobDescription: jd, candidateCV: cv, companyCulture: culture });
  };

  const fillSample = () => {
    setJd(SAMPLE_JOB_DESCRIPTION);
    setCv(SAMPLE_CANDIDATE_CV);
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
        <Button
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onClick={handleStart}
        >
          Bắt đầu Phỏng vấn
        </Button>
      </div>
    </div>
  );
};
