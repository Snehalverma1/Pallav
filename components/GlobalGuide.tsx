import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/Store';
import { sendGlobalAgentMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Bot, Mic, X, Send, Volume2, Sparkles, User, ChevronUp } from 'lucide-react';

export const GlobalGuide: React.FC = () => {
  const { view, properties, getProperty } = useStore();
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Determine Context
  const currentProperty = view.name === 'USER_PROPERTY' && 'propertyId' in view && view.propertyId 
    ? getProperty(view.propertyId) 
    : undefined;

  // Initialize Voices (Chrome loads them asynchronously)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 1. Greet user on View Change
  useEffect(() => {
    // Only greet if the widget is open to avoid annoyance, or if it's the very first interaction
    if (!isOpen) return;

    let greeting = "";
    if (view.name === 'USER_GALLERY') {
      greeting = "I can see the full gallery. Tell me your budget, and I'll find the perfect match.";
    } else if (view.name === 'USER_PROPERTY' && currentProperty) {
      greeting = `We are now at ${currentProperty.title}. This is a great property. Ask me anything about it!`;
    }

    if (greeting) {
      // Small debounce to prevent rapid-fire greetings if navigating quickly
      const timer = setTimeout(() => {
         // Check if the last message was the same greeting to avoid duplicates
         const lastMsg = messages[messages.length - 1];
         if (!lastMsg || lastMsg.text !== greeting) {
            handleAiResponse(greeting, false); 
         }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [view.name, currentProperty?.id, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);


  // --- HANDLERS ---

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
    
    // Cancel current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Robust voice selection
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                           voices.find(v => v.name.includes('English') && v.name.includes('Female')) ||
                           voices[0];
                           
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isThinking) return;

    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Call API
    try {
       const responseText = await sendGlobalAgentMessage(
         view.name,
         currentProperty,
         properties,
         messages, // Pass full history
         textToSend
       );
       handleAiResponse(responseText);
    } catch (e) {
       console.error(e);
       handleAiResponse("My connection is a bit staticy. Could you repeat that?");
    } finally {
       setIsThinking(false);
    }
  };

  // --- SPEECH RECOGNITION (Browser Native) ---
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSend(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      // Handle "no-speech" gracefully without logging an error
      if (event.error === 'no-speech') {
        setIsListening(false);
        return; 
      }
      
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        alert("Microphone access denied. Please check your browser settings.");
      }
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setIsListening(false);
    }
  };

  // --- RENDER ---

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-blue-600 transition-all duration-300 group flex items-center gap-2"
      >
        <div className="relative">
          <Bot size={28} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium pr-2">
           Ask Eve
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed z-50 transition-all duration-300 bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col
      ${isMinimized 
        ? 'bottom-6 right-6 w-72 h-16 rounded-2xl' 
        : 'bottom-6 right-6 w-[90vw] md:w-96 h-[500px] rounded-2xl'
      }
    `}>
      
      {/* Header */}
      <div 
        className="bg-slate-900 text-white p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-teal-400 ${isSpeaking ? 'animate-pulse' : ''}`}>
             <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Eve</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Virtual Agent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {isMinimized ? <ChevronUp size={18} /> : (
             <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:text-red-400">
               <X size={18} />
             </button>
           )}
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.length === 0 && (
                <div className="text-center mt-10 text-slate-400 text-sm">
                    <Sparkles className="mx-auto mb-2 opacity-50" />
                    <p>Hi! I'm Eve.</p>
                    <p>I can help you browse properties or answer questions about specific listings.</p>
                </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
                  }
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                 <div className="bg-white rounded-2xl px-3 py-2 border border-slate-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
             <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {isListening ? <Volume2 size={20} /> : <Mic size={20} />}
                </button>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Type or speak..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
             </form>
          </div>
        </>
      )}
    </div>
  );
};