import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { ArrowLeft, Share2, Heart, Bed, Bath, Square, MapPin, ChevronRight, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  propertyId: string;
}

export const PropertyDetail: React.FC<Props> = ({ propertyId }) => {
  const { getProperty, navigate } = useStore();
  const property = getProperty(propertyId);
  const [showVideo, setShowVideo] = useState(false);

  if (!property) return <div className="p-20 text-center text-white">Property not found</div>;

  const hasVideo = property.videoUrl && property.videoUrl.trim() !== '';
  
  let videoEmbedUrl = '';
  let videoType: 'youtube' | 'vimeo' | 'direct' | 'none' = 'none';

  if (hasVideo) {
    if (property.videoUrl.includes('youtube.com/watch') || property.videoUrl.includes('youtu.be')) {
      videoType = 'youtube';
      const videoId = property.videoUrl.includes('youtu.be')
        ? property.videoUrl.split('/').pop()?.split('?')[0]
        : new URL(property.videoUrl).searchParams.get('v');
      videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (property.videoUrl.includes('vimeo.com')) {
      videoType = 'vimeo';
      const videoId = property.videoUrl.split('/').pop()?.split('?')[0];
      videoEmbedUrl = `https://player.vimeo.com/video/${videoId}`;
    } else {
      videoType = 'direct';
      videoEmbedUrl = property.videoUrl;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AnimatePresence>
        {showVideo && hasVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setShowVideo(false)}
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="w-full max-w-4xl p-4 aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {videoType === 'youtube' || videoType === 'vimeo' ? (
                <iframe 
                  src={videoEmbedUrl}
                  title="Video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full rounded-lg shadow-2xl"
                ></iframe>
              ) : (
                <video src={videoEmbedUrl} controls autoPlay className="w-full h-full rounded-lg shadow-2xl" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Section */}
      <div className="relative h-[60vh] w-full">
        <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        {hasVideo && (
            <div className='absolute inset-0 flex items-center justify-center'>
                <button 
                    onClick={() => setShowVideo(true)}
                    className='w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white border-2 border-white/50 hover:bg-white/30 transition-all scale-100 active:scale-90 shadow-2xl'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>
                </button>
            </div>
        )}

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