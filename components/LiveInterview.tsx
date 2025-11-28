import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AnalysisResult, TranscriptItem } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio-utils';

interface LiveInterviewProps {
  analysis: AnalysisResult;
  onFinish: (transcript: TranscriptItem[]) => void;
}

const API_KEY = process.env.API_KEY || '';

export const LiveInterview: React.FC<LiveInterviewProps> = ({ analysis, onFinish }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Refs for audio handling to avoid re-renders closing streams
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Audio playback queue
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Session tracking
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  // Gemini Client
  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    const initSession = async () => {
      if (clientRef.current) return;
      
      clientRef.current = new GoogleGenAI({ apiKey: API_KEY });
      
      // Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Get Microphone
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        connectToGemini();
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Cần quyền truy cập microphone để phỏng vấn.");
      }
    };

    initSession();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectToGemini = async () => {
    if (!clientRef.current || !streamRef.current || !inputContextRef.current) return;

    const config = {
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        // Wrap systemInstruction in Content object to avoid Invalid Argument error
        systemInstruction: { parts: [{ text: analysis.systemInstruction }] },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    };

    const sessionPromise = clientRef.current.live.connect({
      ...config,
      callbacks: {
        onopen: () => {
          setIsConnected(true);
          setupAudioInput(sessionPromise);
        },
        onmessage: (message: LiveServerMessage) => {
          handleServerMessage(message);
        },
        onclose: () => {
          setIsConnected(false);
          console.log("Connection closed");
        },
        onerror: (err) => {
          console.error("Gemini Live Error:", err);
        }
      }
    });
    
    // Store session for cleanup.
    sessionPromise.then(session => {
        sessionRef.current = session;
    });
  };

  const setupAudioInput = (sessionPromise: Promise<any>) => {
    if (!inputContextRef.current || !streamRef.current) return;

    const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!isMicOn) return; // Mute logic
      
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      setVolume(Math.sqrt(sum / inputData.length));

      const pcmBlob = createPcmBlob(inputData);
      sessionPromise.then((session) => {
        try {
            session.sendRealtimeInput({ media: pcmBlob });
        } catch (e) {
            console.error("Error sending audio input:", e);
        }
      });
    };

    source.connect(processor);
    processor.connect(inputContextRef.current.destination);
    
    sourceRef.current = source;
    processorRef.current = processor;
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    // 1. Handle Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const buffer = await decodeAudioData(base64ToUint8Array(audioData), ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      const currentTime = ctx.currentTime;
      const startTime = Math.max(nextStartTimeRef.current, currentTime);
      
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      
      audioQueueRef.current.push(source);
      source.onended = () => {
         const index = audioQueueRef.current.indexOf(source);
         if (index > -1) audioQueueRef.current.splice(index, 1);
      };
    }

    // 2. Handle Interruption
    if (message.serverContent?.interrupted) {
      audioQueueRef.current.forEach(src => src.stop());
      audioQueueRef.current = [];
      nextStartTimeRef.current = 0;
      currentOutputTranscription.current = ''; // Clear stale transcription
    }

    // 3. Handle Transcription
    // Input (User)
    if (message.serverContent?.inputTranscription) {
        currentInputTranscription.current += message.serverContent.inputTranscription.text;
    }
    // Output (Model)
    if (message.serverContent?.outputTranscription) {
        currentOutputTranscription.current += message.serverContent.outputTranscription.text;
    }

    // Turn Complete - save to history
    if (message.serverContent?.turnComplete) {
        const newItems: TranscriptItem[] = [];
        
        if (currentInputTranscription.current.trim()) {
            newItems.push({
                role: 'user',
                text: currentInputTranscription.current.trim(),
                timestamp: Date.now()
            });
            currentInputTranscription.current = '';
        }
        
        if (currentOutputTranscription.current.trim()) {
            newItems.push({
                role: 'model',
                text: currentOutputTranscription.current.trim(),
                timestamp: Date.now()
            });
            currentOutputTranscription.current = '';
        }

        if (newItems.length > 0) {
            setTranscript(prev => [...prev, ...newItems]);
        }
    }
  };

  const cleanup = () => {
    if (sessionRef.current) {
        // Stop logic if needed
    }
    
    if (processorRef.current && sourceRef.current) {
      try {
        sourceRef.current.disconnect();
        processorRef.current.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    const closeContext = async (ctx: AudioContext | null) => {
      if (ctx && ctx.state !== 'closed') {
        try {
          await ctx.close();
        } catch (e) {
          // Ignore error if context is already closed or closing
          console.warn("AudioContext already closed or closing");
        }
      }
    };

    closeContext(inputContextRef.current);
    closeContext(audioContextRef.current);
  };

  const handleEndInterview = () => {
    setIsSessionActive(false);
    cleanup();
    onFinish(transcript);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto p-4">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Phỏng vấn trực tiếp</h2>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isConnected ? 'Đã kết nối ●' : 'Đang kết nối...'}
          </span>
        </div>
        <button 
          onClick={handleEndInterview}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-md"
        >
          Kết thúc Phỏng vấn
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Visualizer / Avatar Area */}
        <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* AI Avatar Representation */}
          <div className="relative z-10">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${isConnected ? 'bg-blue-600/20' : 'bg-slate-700/50'}`}>
               <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg flex items-center justify-center animate-pulse`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
               </div>
            </div>
            {/* Ripples when speaking (simulated by connectivity for now, could link to audio queue) */}
            {isConnected && (
                <>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border border-blue-400/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute top-4 left-4 w-32 h-32 rounded-full border border-cyan-400/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
                </>
            )}
          </div>

          <div className="mt-12 text-center z-10">
             <p className="text-slate-300 text-lg font-light tracking-wide">
               {isConnected ? "AI đang lắng nghe... (Hãy nói 'Xin chào' để bắt đầu)" : "Đang thiết lập kết nối..."}
             </p>
          </div>

          {/* User Audio Visualizer (Simple Volume Bar) */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 h-12 items-end px-20">
             {Array.from({ length: 20 }).map((_, i) => (
               <div 
                 key={i}
                 className="w-2 bg-emerald-400 rounded-t-sm opacity-80 transition-all duration-75"
                 style={{ 
                   height: `${Math.max(4, volume * 300 * (Math.random() * 0.5 + 0.5))}px`,
                   opacity: isMicOn ? 1 : 0.2
                 }}
               />
             ))}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 right-6 z-20">
             <button 
               onClick={toggleMic}
               className={`p-4 rounded-full shadow-lg transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white'}`}
             >
                {isMicOn ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                )}
             </button>
          </div>
        </div>

        {/* Live Transcript / Notes Panel */}
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
                {analysis.interviewFocus.map((focus, i) => (
                    <li key={i}>{focus}</li>
                ))}
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
};