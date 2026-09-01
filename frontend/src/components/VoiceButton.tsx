'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceButtonProps {
  onSpeechResult: (text: string) => void;
  language?: string;
}

export default function VoiceButton({ onSpeechResult, language = 'en' }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSupported(true);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!supported) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
    };

    recognition.lang = langMap[language] || 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onSpeechResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-lg ring-4 ring-rose-200'
          : 'bg-parchment-200 text-charcoal/70 hover:bg-terracotta-500 hover:text-white'
      }`}
      title={isListening ? 'Listening... Speak now!' : '🎙️ Talk to NaniBot (Voice Input)'}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
