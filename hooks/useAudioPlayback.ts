import { useRef, useCallback } from 'react';
import { base64ToUint8Array, decodeAudioData } from '../utils/audio-utils';

export const useAudioPlayback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  const initializeContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 24000 
      });
    }
    return audioContextRef.current;
  }, []);

  const playAudio = useCallback(async (base64Data: string) => {
    const ctx = initializeContext();
    if (!ctx) return;

    const buffer = await decodeAudioData(base64ToUint8Array(base64Data), ctx);
    
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
  }, [initializeContext]);

  const clearQueue = useCallback(() => {
    audioQueueRef.current.forEach(src => src.stop());
    audioQueueRef.current = [];
    nextStartTimeRef.current = 0;
  }, []);

  const cleanup = useCallback(async () => {
    clearQueue();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close();
      } catch (e) {
        console.warn("AudioContext already closed");
      }
    }
  }, [clearQueue]);

  return {
    playAudio,
    clearQueue,
    cleanup
  };
};
