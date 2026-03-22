import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/Store';
import { sendGlobalAgentMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Bot, Mic, X, Send, Volume2, Sparkles, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalGuide: React.FC = () => {
  const { view, properties, getProperty } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-assistant', handleOpen);
    return () => window.removeEventListener('open-assistant', handleOpen);
  }, []);

  const currentProperty = view.name === 'USER_PROPERTY' && 'propertyId' in view && view.propertyId 
    ? getProperty(view.propertyId) 
    : undefined;

  useEffect(() => {
    if (!isOpen) return;
    let greeting = "";
    if (view.name === 'USER_GALLERY') {
      greeting = "Welcome back. I'm Eve. Tell me your budget or dream location.";
    } else if (view.name === 'USER_PROPERTY' && currentProperty) {
      greeting = `You're looking at ${currentProperty.title}. It's a masterpiece. Want the specs?`;
    }
    if (greeting && messages.length === 0) {
      handleAiResponse(greeting, true); 
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleAiResponse = (text: string, saveToHistory = true) => {
    if (saveToHistory) {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: text,
            timestamp: Date.now()
        }]);
    }
    speak(text);
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);

    try {
       const history = newMessages.slice(0, -1); 
       const historyForApi = history.length > 0 && history[0].role === 'model'
        ? history.slice(1)
        : history;

       const responseText = await sendGlobalAgentMessage(view.name, currentProperty, properties, historyForApi, textToSend);
       handleAiResponse(responseText);
    } catch (e) {
       handleAiResponse("Connection is lost. Try again?");
    } finally {
       setIsThinking(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => handleSend(event.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[200] bg-slate-950 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-black">EVE ASSISTANT</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Neural Agent Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 rounded-full text-white">
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-3xl text-sm font-medium ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                 <div className="bg-white/5 rounded-2xl px-4 py-2 flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Controls */}
          <div className="p-6 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
             <div className="flex gap-3 items-center">
                <button 
                  onClick={toggleListening}
                  className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-slate-400'}`}
                >
                  <Mic size={24} />
                </button>
                <div className="flex-1 relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask EVE anything..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all"
                  />
                  <button 
                    onClick={() => handleSend()}
                    className="absolute right-3 top-2 bottom-2 px-3 text-blue-400 font-black uppercase text-[10px] tracking-widest"
                  >
                    Send
                  </button>
                </div>
             </div>
             <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                {['Price list?', 'Malibu homes?', 'AI context?'].map(q => (
                  <button 
                    key={q} 
                    onClick={() => handleSend(q)}
                    className="whitespace-nowrap bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-slate-500 text-[10px] font-bold"
                  >
                    {q}
                  </button>
                ))}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};