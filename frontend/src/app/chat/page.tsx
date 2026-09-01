'use client';

import { Suspense } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldAlert, 
  Info, 
  Globe, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw 
} from 'lucide-react';
import VoiceButton from '@/components/VoiceButton';
import EvidenceBadge from '@/components/EvidenceBadge';
import { chatApi } from '@/lib/api';
import { ChatResponse, ChatSource } from '@/types';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseObj?: ChatResponse;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
];

function ChatPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSources, setActiveSources] = useState<{ msgId: string; sources: ChatSource[]; explanation: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate session ID if not set
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);

    // Initial greeting
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Namaste! 🌿 I am **NaniBot**. How can I help you today?`,
      },
    ]);

    // Handle query from URL if passed from landing page
    if (initialQuery) {
      handleSendQuery(initialQuery, newSessionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendQuery = async (queryText: string, currentSessionId?: string) => {
    if (!queryText.trim() || loading) return;

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      role: 'user',
      content: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response: ChatResponse = await chatApi.sendMessage(
        queryText,
        currentSessionId || sessionId,
        selectedLang
      );

      const assistantMsg: MessageItem = {
        id: `ast_${response.message_id}`,
        role: 'assistant',
        content: response.response_text,
        responseObj: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: MessageItem = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: '⚠️ I had trouble accessing the wisdom archive. Please make sure the backend is running and try again!',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechOutput = (text: string) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown formatting for spoken text
    const cleanText = text.replace(/[\#\*\_\`]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utterance);
  };

  const handleResetChat = () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Namaste! 🌿 I am **NaniBot**. How can I help you today?`,
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-parchment-100 border border-parchment-200/80 rounded-2xl px-5 py-3 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-turmeric-400 to-terracotta-500 flex items-center justify-center text-white text-lg">
            🌿
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
              Ask NaniBot
              <span className="text-[10px] bg-terracotta-50 text-terracotta-700 font-sans font-semibold px-2 py-0.5 rounded-full border border-terracotta-200">
                AI Knowledge Assistant
              </span>
            </h1>
            <p className="text-[11px] text-charcoal/60">
              Intergenerational traditional knowledge + evidence-aware AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 bg-parchment-50 border border-parchment-300 rounded-lg px-2.5 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-terracotta-600" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-transparent font-medium text-charcoal focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-charcoal/60 hover:text-terracotta-600 hover:bg-parchment-200 transition-colors"
            title="Start new conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const resp = msg.responseObj;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-turmeric-400 to-terracotta-500 text-white flex items-center justify-center text-sm shrink-0 shadow-sm mt-1">
                  👵🏼
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-5 shadow-sm space-y-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-terracotta-600 to-terracotta-700 text-white rounded-tr-none'
                    : 'bg-parchment-50 border border-parchment-200 text-charcoal rounded-tl-none'
                }`}
              >
                {/* Emergency banner if critical */}
                {resp?.risk_level === 'CRITICAL' && (
                  <div className="bg-rose-100 border border-rose-300 text-rose-900 rounded-xl p-3 text-xs flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>EMERGENCY MEDICAL WARNING:</strong> Symptoms described require immediate medical care.
                    </div>
                  </div>
                )}

                {/* Evidence badge header if health query */}
                {resp?.is_health_related && resp?.structured?.evidence_label && (
                  <div className="flex items-center justify-between gap-2 border-b border-parchment-200 pb-2">
                    <EvidenceBadge label={resp.structured.evidence_label} size="md" />
                    <span className="text-[10px] text-charcoal/50 uppercase font-semibold">
                      Risk: {resp.risk_level}
                    </span>
                  </div>
                )}

                {/* Message body (rendered markdown text) */}
                <div className="prose prose-sm text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Structured response details if available */}
                {resp?.structured && (
                  <div className="mt-3 pt-3 border-t border-parchment-200/80 space-y-2 text-xs">
                    {resp.structured.when_to_see_doctor && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2.5 font-medium flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">When to See a Doctor:</span>{' '}
                          {resp.structured.when_to_see_doctor}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assistant Footer Actions: Sources & Text-to-Speech */}
                {!isUser && resp && (
                  <div className="pt-2 border-t border-parchment-200/60 flex items-center justify-between text-xs text-charcoal/60">
                    <div className="flex items-center gap-3">
                      {resp.sources.length > 0 && (
                        <button
                          onClick={() =>
                            setActiveSources({
                              msgId: msg.id,
                              sources: resp.sources,
                              explanation: resp.source_explanation,
                            })
                          }
                          className="flex items-center gap-1 text-[11px] font-semibold text-terracotta-600 hover:underline"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Sources ({resp.sources.length})</span>
                        </button>
                      )}
                      <span className="text-[10px] text-charcoal/40">
                        &quot;Why am I seeing this?&quot;
                      </span>
                    </div>

                    <button
                      onClick={() => handleSpeechOutput(msg.content)}
                      className="p-1 rounded hover:bg-parchment-200 text-charcoal/60 hover:text-terracotta-600 transition-colors"
                      title={isSpeaking ? 'Stop speaking' : 'Listen to response'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-9 h-9 rounded-full bg-parchment-200 text-charcoal flex items-center justify-center text-sm shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-turmeric-400 to-terracotta-500 text-white flex items-center justify-center text-sm shadow-sm">
              👵🏼
            </div>
            <div className="bg-parchment-100 border border-parchment-200 rounded-2xl px-4 py-3 text-xs text-charcoal/70 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-terracotta-500 animate-spin" />
              <span>Nani is thinking and searching the traditional wisdom archive...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sources modal drawer */}
      {activeSources && (
        <div className="bg-parchment-100 border border-parchment-300 rounded-xl p-4 mb-3 text-xs text-charcoal shadow-md relative">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-serif font-bold text-sm text-terracotta-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Source Attribution &amp; Evidence Transparency
            </h4>
            <button
              onClick={() => setActiveSources(null)}
              className="text-charcoal/50 hover:text-charcoal font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-charcoal/70 mb-3 italic">
            {activeSources.explanation}
          </p>

          <div className="space-y-2">
            {activeSources.sources.map((src) => (
              <div key={src.id} className="bg-white p-2.5 rounded-lg border border-parchment-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-charcoal">{src.title}</span>
                  <span className="text-[10px] text-charcoal/60 ml-2">({src.category} • {src.region || 'India'})</span>
                </div>
                <EvidenceBadge label={src.evidence_label} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery(input);
        }}
        className="bg-white rounded-2xl p-2.5 border border-parchment-300 shadow-warm flex items-center gap-2"
      >
        <VoiceButton
          language={selectedLang}
          onSpeechResult={(spokenText) => {
            setInput(spokenText);
            handleSendQuery(spokenText);
          }}
        />

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Nani anything (e.g., How do I treat a cold? How do I remove grease stains?)..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-charcoal focus:outline-none placeholder:text-charcoal/40 font-sans"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-turmeric-500 to-terracotta-500 text-white font-medium text-sm p-3 rounded-xl hover:opacity-95 disabled:opacity-50 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse text-charcoal/50">Loading chat...</div>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}
