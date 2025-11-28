import { useRef, useState, useCallback } from 'react';
import { createPcmBlob } from '../utils/audio-utils';

export const useAudioRecording = () => {
  const [volume, setVolume] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const initializeMicrophone = useCallback(async () => {
    try {
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 16000 
      });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      return { success: true, stream: streamRef.current, context: inputContextRef.current };
    } catch (err) {
      console.error("Microphone access denied:", err);
      return { success: false, error: err };
    }
  }, []);

  const setupAudioProcessing = useCallback((
    onAudioData: (blob: ReturnType<typeof createPcmBlob>) => void
  ) => {
    if (!inputContextRef.current || !streamRef.current) return;

    const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
    const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!isMicOn) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      setVolume(Math.sqrt(sum / inputData.length));

      const pcmBlob = createPcmBlob(inputData);
      onAudioData(pcmBlob);
    };

    source.connect(processor);
    processor.connect(inputContextRef.current.destination);
    
    sourceRef.current = source;
    processorRef.current = processor;
  }, [isMicOn]);

  const toggleMic = useCallback(() => {
    setIsMicOn(prev => !prev);
  }, []);

  const cleanup = useCallback(async () => {
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

    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      try {
        await inputContextRef.current.close();
      } catch (e) {
        console.warn("AudioContext already closed");
      }
    }
  }, []);

  return {
    volume,
    isMicOn,
    initializeMicrophone,
    setupAudioProcessing,
    toggleMic,
    cleanup
  };
};
