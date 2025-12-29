import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Property, ChatMessage } from '../types';
import { sendPropertyChatMessage } from '../services/geminiService';
import { ArrowLeft, Send, Sparkles, Bed, Bath, Square, Play, Pause, Bot, MapPin } from 'lucide-react';

interface Props {
  propertyId: string;
}

export const PropertyDetail: React.FC<Props> = ({ propertyId }) => {
  const { getProperty, navigate } = useStore();
  const property = getProperty(propertyId);
  const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initial greeting from AI
    if (property && messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'model',
        text: `Hello! I'm the AI assistant for ${property.title}. How can I help you explore this property today?`,
        timestamp: Date.now()
      }]);
    }
  }, [property]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  if (!property) return <div>Property not found</div>;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the *entire* conversation history context, ensuring the AI 
      // adheres to the admin's 'systemInstruction' found on the property object
      const responseText = await sendPropertyChatMessage(property, messages.concat(userMsg), input);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Left Panel: Media & Details */}
      <div className="flex-1 overflow-y-auto relative bg-slate-50">
        <button 
          onClick={() => navigate({ name: 'USER_GALLERY' })}
          className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur p-2 rounded-full text-slate-800 hover:bg-white shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Media Container */}
        <div className="relative h-[50vh] bg-black">
          {property.videoUrl ? (
            <>
              <video 
                ref={videoRef}
                src={property.videoUrl}
                className="w-full h-full object-cover"
                poster={property.imageUrl}
                loop
                playsInline
                onClick={toggleVideo}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlaying && (
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                    <Play className="text-white fill-current" size={32} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Property Info */}
        <div className="p-8 max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.title}</h1>
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin size={18} /> {property.address}
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${property.price.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-8 border-y border-slate-200 py-6 mb-8">
            <div className="flex items-center gap-2">
              <Bed className="text-slate-400" />
              <span className="font-semibold text-slate-700">{property.bedrooms}</span> <span className="text-slate-500">Beds</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="text-slate-400" />
              <span className="font-semibold text-slate-700">{property.bathrooms}</span> <span className="text-slate-500">Baths</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="text-slate-400" />
              <span className="font-semibold text-slate-700">{property.sqft}</span> <span className="text-slate-500">Sqft</span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-bold text-slate-900 mb-3">About this home</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>
        </div>
      </div>

      {/* Right Panel: AI Chat */}
      <div className={`
        fixed inset-0 z-30 bg-white transform transition-transform duration-300 flex flex-col shadow-2xl
        md:relative md:translate-y-0 md:w-[400px] md:border-l md:border-slate-200
        ${activeTab === 'ai' ? 'translate-y-0' : 'translate-y-[calc(100%-80px)] md:translate-y-0'}
      `}>
        {/* Mobile Handle */}
        <div 
          className="md:hidden h-12 bg-white flex items-center justify-center border-t rounded-t-2xl cursor-pointer"
          onClick={() => setActiveTab(activeTab === 'ai' ? 'details' : 'ai')}
        >
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Sparkles className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Property AI Assistant</h3>
            <p className="text-xs text-slate-500">Commanded by Agent Instructions</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                }
              `}>
                {msg.role === 'model' && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">
                    <Bot size={10} /> Assistant
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this property..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Investment potential?', 'School district?', 'Any hidden issues?', 'Renovation ideas?'].map(q => (
              <button 
                key={q} 
                onClick={() => setInput(q)}
                className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};