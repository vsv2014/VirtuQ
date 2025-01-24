import { useState, useCallback, useRef } from 'react';

interface VoiceSearchResult {
  isListening: boolean;
  text: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoiceSearch(): VoiceSearchResult {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to maintain the same instance across renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize recognition only once
  if (!recognitionRef.current) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
    }
  }

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    setText('');
    setError(null);
    setIsListening(true);

    try {
      // Set up event handlers before starting
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    text,
    startListening,
    stopListening,
    error
  };
}
