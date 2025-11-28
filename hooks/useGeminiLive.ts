import { useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface UseGeminiLiveProps {
  analysis: AnalysisResult;
  onInputTranscription: (text: string) => void;
  onOutputTranscription: (text: string) => void;
  onTurnComplete: () => void;
  onInterruption: () => void;
  onAudioData: (base64Data: string) => void;
}

export const useGeminiLive = ({
  analysis,
  onInputTranscription,
  onOutputTranscription,
  onTurnComplete,
  onInterruption,
  onAudioData
}: UseGeminiLiveProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);

  const handleServerMessage = useCallback((message: LiveServerMessage) => {
    // 1. Handle Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      onAudioData(audioData);
    }

    // 2. Handle Interruption
    if (message.serverContent?.interrupted) {
      onInterruption();
    }

    // 3. Handle Transcription
    if (message.serverContent?.inputTranscription) {
      onInputTranscription(message.serverContent.inputTranscription.text);
    }
    if (message.serverContent?.outputTranscription) {
      onOutputTranscription(message.serverContent.outputTranscription.text);
    }

    // 4. Turn Complete
    if (message.serverContent?.turnComplete) {
      onTurnComplete();
    }
  }, [onAudioData, onInterruption, onInputTranscription, onOutputTranscription, onTurnComplete]);

  const connect = useCallback(async () => {
    if (!clientRef.current) {
      clientRef.current = new GoogleGenAI({ apiKey: API_KEY });
    }

    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: { parts: [{ text: analysis.systemInstruction }] },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    };

    const sessionPromise = clientRef.current.live.connect({
      ...config,
      callbacks: {
        onopen: () => setIsConnected(true),
        onmessage: handleServerMessage,
        onclose: () => setIsConnected(false),
        onerror: (err) => console.error("Gemini Live Error:", err)
      }
    });

    const session = await sessionPromise;
    sessionRef.current = session;
    return session;
  }, [analysis.systemInstruction, handleServerMessage]);

  const sendAudioData = useCallback((blob: any) => {
    if (sessionRef.current) {
      try {
        sessionRef.current.sendRealtimeInput({ media: blob });
      } catch (e) {
        console.error("Error sending audio input:", e);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    // Cleanup session if needed
    sessionRef.current = null;
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    connect,
    sendAudioData,
    disconnect
  };
};
