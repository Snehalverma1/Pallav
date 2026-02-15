import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Property, ChatMessage } from '../types';
import { sendPropertyChatMessage } from '../services/geminiService';
import { ArrowLeft, Send, Sparkles, Bed, Bath, Square, Play, Bot, MapPin, ChevronRight, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  propertyId: string;
}

export const PropertyDetail: React.FC<Props> = ({ propertyId }) => {
  const { getProperty, navigate } = useStore();
  const property = getProperty(propertyId);
  const [activeTab, setActiveTab] = useState<'details' | 'ai'>('details');

  if (!property) return <div className="p-20 text-center text-white">Property not found</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Media Section */}
      <div className="relative h-[60vh] w-full">
        <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button onClick={() => navigate({ name: 'USER_GALLERY' })} className="w-10 h-10 bg-slate-950/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-slate-950/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 bg-slate-950/40 backdrop-blur-xl rounded-full flex items-center justify-center text-rose-500 border border-white/10">
              <Heart size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Floating AI Prompt */}
        <button 
          onClick={() => {
            const event = new CustomEvent('open-assistant');
            window.dispatchEvent(event);
          }}
          className="absolute bottom-12 left-6 right-6 bg-blue-600 p-5 rounded-3xl flex items-center justify-between shadow-2xl active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3 text-white">
            <Sparkles size={24} />
            <div>
              <div className="font-black text-sm">TALK TO THIS HOUSE</div>
              <div className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Powered by Gemini AI</div>
            </div>
          </div>
          <ChevronRight className="text-white" />
        </button>
      </div>

      {/* Content Section */}
      <div className="px-6 pb-20 -mt-6 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">{property.title}</h1>
            <p className="text-slate-500 text-sm flex items-center gap-1 font-medium">
              <MapPin size={16} className="text-blue-500" /> {property.address}
            </p>
          </div>
          <div className="text-2xl font-black text-blue-400">
            ${property.price.toLocaleString()}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
            <Bed size={20} className="mx-auto text-blue-500 mb-2" />
            <div className="text-white font-black">{property.bedrooms}</div>
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Beds</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
            <Bath size={20} className="mx-auto text-blue-500 mb-2" />
            <div className="text-white font-black">{property.bathrooms}</div>
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Baths</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
            <Square size={20} className="mx-auto text-blue-500 mb-2" />
            <div className="text-white font-black">{property.sqft}</div>
            <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Sqft</div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <h3 className="text-white font-black text-sm uppercase tracking-[0.3em] mb-4">The Narrative</h3>
          <p className="text-slate-400 leading-relaxed text-sm font-medium whitespace-pre-line bg-white/5 p-6 rounded-[2rem] border border-white/5">
            {property.description}
          </p>
        </div>

        {/* AI Control Center Badge */}
        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 p-6 rounded-[2rem] mb-12">
           <div className="flex items-center gap-3 mb-3">
              <Bot size={20} className="text-blue-400" />
              <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest">Agent Logic</h4>
           </div>
           <p className="text-slate-300 text-xs italic leading-relaxed">
             "{property.aiSystemInstruction}"
           </p>
        </div>
      </div>
    </div>
  );
};