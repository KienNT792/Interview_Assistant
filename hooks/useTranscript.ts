import { useRef, useState, useCallback } from 'react';
import { TranscriptItem } from '../types';

export const useTranscript = () => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const addInputText = useCallback((text: string) => {
    currentInputTranscription.current += text;
  }, []);

  const addOutputText = useCallback((text: string) => {
    currentOutputTranscription.current += text;
  }, []);

  const clearCurrentTranscriptions = useCallback(() => {
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';
  }, []);

  const commitTranscriptions = useCallback(() => {
    const newItems: TranscriptItem[] = [];
    
    if (currentInputTranscription.current.trim()) {
      newItems.push({
        role: 'user',
        text: currentInputTranscription.current.trim(),
        timestamp: Date.now()
      });
    }
    
    if (currentOutputTranscription.current.trim()) {
      newItems.push({
        role: 'model',
        text: currentOutputTranscription.current.trim(),
        timestamp: Date.now()
      });
    }

    if (newItems.length > 0) {
      setTranscript(prev => [...prev, ...newItems]);
    }

    clearCurrentTranscriptions();
  }, [clearCurrentTranscriptions]);

  return {
    transcript,
    addInputText,
    addOutputText,
    commitTranscriptions,
    clearCurrentTranscriptions
  };
};
