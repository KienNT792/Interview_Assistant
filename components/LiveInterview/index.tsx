import React, { useEffect } from 'react';
import { AnalysisResult, TranscriptItem } from '../../types';
import { useTranscript } from '../../hooks/useTranscript';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { useGeminiLive } from '../../hooks/useGeminiLive';
import { InterviewHeader } from './InterviewHeader';
import { AIAvatar } from './AIAvatar';
import { TranscriptPanel } from './TranscriptPanel';
import { InterviewControls } from './InterviewControls';

interface LiveInterviewProps {
  analysis: AnalysisResult;
  onFinish: (transcript: TranscriptItem[]) => void;
}

export const LiveInterview: React.FC<LiveInterviewProps> = ({ analysis, onFinish }) => {
  // Custom hooks
  const {
    transcript,
    addInputText,
    addOutputText,
    commitTranscriptions,
    clearCurrentTranscriptions
  } = useTranscript();

  const {
    volume,
    isMicOn,
    initializeMicrophone,
    setupAudioProcessing,
    toggleMic,
    cleanup: cleanupRecording
  } = useAudioRecording();

  const {
    playAudio,
    clearQueue,
    cleanup: cleanupPlayback
  } = useAudioPlayback();

  const {
    isConnected,
    connect,
    sendAudioData,
    disconnect
  } = useGeminiLive({
    analysis,
    onInputTranscription: addInputText,
    onOutputTranscription: addOutputText,
    onTurnComplete: commitTranscriptions,
    onInterruption: () => {
      clearQueue();
      clearCurrentTranscriptions();
    },
    onAudioData: playAudio
  });

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const micResult = await initializeMicrophone();
      if (!micResult.success) {
        alert("Cần quyền truy cập microphone để phỏng vấn.");
        return;
      }

      const session = await connect();
      
      setupAudioProcessing((blob) => {
        sendAudioData(blob);
      });
    };

    init();

    return () => {
      disconnect();
      cleanupRecording();
      cleanupPlayback();
    };
  }, []);

  const handleEndInterview = () => {
    disconnect();
    cleanupRecording();
    cleanupPlayback();
    onFinish(transcript);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4">
      <InterviewHeader 
        isConnected={isConnected}
        onEndInterview={handleEndInterview}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="relative flex-1">
          <AIAvatar 
            isConnected={isConnected}
            volume={volume}
            isMicOn={isMicOn}
          />
          <InterviewControls 
            isMicOn={isMicOn}
            onToggleMic={toggleMic}
          />
        </div>

        <TranscriptPanel 
          transcript={transcript}
          interviewFocus={analysis.interviewFocus}
        />
      </div>
    </div>
  );
};
