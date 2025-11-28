import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, InterviewData, ReportData, TranscriptItem } from "../types";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Analyze JD and CV to prepare the Interviewer System Instruction
export const analyzeProfile = async (data: InterviewData): Promise<AnalysisResult> => {
  const prompt = `
    Bạn là một chuyên gia tuyển dụng và quản lý nhân sự cấp cao. Nhiệm vụ của bạn là phân tích Mô tả công việc (JD) và Hồ sơ ứng viên (CV) sau đây để chuẩn bị cho một buổi phỏng vấn.

    Văn hoá công ty: ${data.companyCulture}

    ---
    JOB DESCRIPTION (JD):
    ${data.jobDescription}
    ---
    CANDIDATE CV:
    ${data.candidateCV}
    ---

    Hãy phân tích và trả về kết quả dưới dạng JSON (không có markdown code block) với cấu trúc sau:
    1. systemInstruction: Một chỉ dẫn chi tiết dành cho AI (là bạn) đóng vai người phỏng vấn. Chỉ dẫn này cần bao gồm:
       - Persona: Phong cách (nghiêm túc, thân thiện, chuyên nghiệp...) dựa trên văn hoá công ty.
       - Context: Bạn đang phỏng vấn ứng viên này cho vị trí trong JD.
       - Instruction: Đặt câu hỏi ngắn gọn, từng câu một. Lắng nghe câu trả lời rồi mới hỏi tiếp. Đào sâu vào kinh nghiệm nếu cần.
       - Language: Phải nói Tiếng Việt.
    2. interviewFocus: Danh sách 3-5 chủ đề chính cần tập trung phỏng vấn (dựa trên điểm yếu hoặc yêu cầu quan trọng của JD).
    3. candidateStrengths: 3 điểm mạnh chính tìm thấy trong CV khớp với JD.
    4. initialGreeting: Một câu chào mở đầu buổi phỏng vấn, giới thiệu bản thân AI và mời ứng viên bắt đầu.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          systemInstruction: { type: Type.STRING },
          interviewFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
          candidateStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          initialGreeting: { type: Type.STRING },
        },
        required: ['systemInstruction', 'interviewFocus', 'candidateStrengths', 'initialGreeting']
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as AnalysisResult;
};

// Generate final report based on transcript
export const generateReport = async (transcript: TranscriptItem[], data: InterviewData): Promise<ReportData> => {
  const conversationText = transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join('\n');

  const prompt = `
    Dựa trên nội dung cuộc phỏng vấn dưới đây, hãy đánh giá ứng viên cho vị trí được mô tả trong JD.

    JOB DESCRIPTION:
    ${data.jobDescription}

    TRANSCRIPT:
    ${conversationText}

    Hãy đánh giá khắt khe và công bằng. Trả về JSON:
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Score out of 100" },
          summary: { type: Type.STRING, description: "Executive summary of the interview performance" },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING, enum: ["STRONG_HIRE", "HIRE", "MAYBE", "NO_HIRE"] },
          details: { type: Type.STRING, description: "Detailed analysis of technical and soft skills" }
        },
        required: ["score", "summary", "strengths", "weaknesses", "recommendation", "details"]
      }
    }
  });

  if (!response.text) throw new Error("No report generated");
  return JSON.parse(response.text) as ReportData;
};
