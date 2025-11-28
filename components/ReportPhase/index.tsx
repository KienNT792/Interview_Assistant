import React, { useEffect, useState } from 'react';
import { generateReport } from '../../services/gemini-service';
import { InterviewData, ReportData, TranscriptItem } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { ScoreCard } from './ScoreCard';
import { StrengthsWeaknesses } from './StrengthsWeaknesses';
import { DetailedAnalysis } from './DetailedAnalysis';

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
  }, [transcript, data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <LoadingSpinner 
          size="lg"
          message="Đang chấm điểm phỏng vấn..."
          submessage="AI đang phân tích câu trả lời và hành vi của ứng viên."
        />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900">Kết quả Phỏng vấn</h2>
        <p className="text-slate-500">Báo cáo đánh giá năng lực chi tiết từ AI</p>
      </div>

      <ScoreCard 
        score={report.score}
        recommendation={report.recommendation}
        summary={report.summary}
      />

      <StrengthsWeaknesses 
        strengths={report.strengths}
        weaknesses={report.weaknesses}
      />

      <DetailedAnalysis details={report.details} />

      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={onRestart}
        >
          Bắt đầu phiên mới
        </Button>
      </div>
    </div>
  );
};
