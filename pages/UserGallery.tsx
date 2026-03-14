import React from 'react';
import { useStore } from '../context/Store';
import { Property } from '../types';
import { 
  MapPin, 
  Bed, 
  Bath, 
  MoveRight, 
  Globe, 
  Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FilterBar } from '../components/FilterBar';

const formatPrice = (price: number) => {
  if (price >= 10000000) { // Crores
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) { // Lakhs
    return `₹${(price / 100000).toFixed(1)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`; // For smaller amounts
};


const PropertyCard: React.FC<{ property: Property; onClick: () => void }> = ({ property, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="relative mb-6 mx-4 overflow-hidden rounded-[2.5rem] bg-slate-900/50 border border-white/5 active:scale-98 transition-transform"
    >
      <div className="relative h-72">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-white/10 text-white font-bold text-xs">
          {formatPrice(property.price)}
        </div>
        <div className="absolute bottom-6 left-6 right-6">
           <h3 className="text-xl font-black text-white mb-1">{property.title}</h3>
           <p className="text-slate-400 text-xs flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> {property.address.split(',')[0]}</p>
        </div>
      </div>
      <div className="p-6 flex justify-between items-center bg-white/5">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <Bed size={14} className="text-blue-500"/>
            <span className="text-xs font-bold text-white">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={14} className="text-blue-500"/>
            <span className="text-xs font-bold text-white">{property.bathrooms}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
          <MoveRight className="text-white" size={18} />
        </div>
      </div>
    </motion.div>
  );
};

export const UserGallery: React.FC = () => {
  const { filteredProperties, navigate } = useStore();

  return (
    <div className="pb-12">
      
      {/* 1. COMPACT MOBILE HERO */}
      <section id="home" className="pt-8 pb-12 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest"
        >
          <Sparkles size={12} /> A new era of luxury living
        </motion.div>
        
        <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Rudraatara</span>
        </h1>
        
        <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium mb-8">
          Discover a new era of luxury living, where every detail is crafted to perfection.
        </p>

        <div className="flex justify-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="text-white text-[10px] font-black uppercase tracking-widest">Global Elite</div>
            <div className="text-slate-500 text-[8px] font-bold">1.2k Active Buyers</div>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-16">
        <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
          <div className="text-2xl font-black text-white">₹70k Cr</div>
          <div className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Portfolio</div>
        </div>
        <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
          <div className="text-2xl font-black text-white">99%</div>
          <div className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Accuracy</div>
        </div>
      </div>

      {/* 3. PROPERTY SHOWCASE */}
      <section id="properties" className="relative">
        <div className="px-6 mb-6 flex justify-between items-end">
            <h2 className="text-2xl font-black text-white">Our Collection</h2>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{filteredProperties.length} Results</span>
        </div>
        <div className="px-4">
         <FilterBar />
        </div>
        <div className="flex flex-col mt-8">
          {filteredProperties.map((p) => (
            <PropertyCard 
              key={p.id} 
              property={p} 
              onClick={() => navigate({ name: 'USER_PROPERTY', propertyId: p.id })} 
            />
          ))}
        </div>
      </section>

      {/* 4. MANIFESTO SNIPPET */}
      <section id="about" className="mt-20 px-6 py-12 bg-white/5 rounded-[3rem] mx-4 border border-white/5 text-center">
        <Globe size={32} className="mx-auto text-blue-400 mb-4 opacity-50" />
        <h3 className="text-white font-black text-lg mb-4">Rudraatara</h3>
        <p className="text-slate-400 text-xs leading-relaxed font-medium italic">
          "Welcome to Rudraatara, where luxury meets innovation. Our cutting-edge AI curates the most exquisite properties, tailored to your unique lifestyle and preferences."
        </p>
      </section>

      <div id="contact" className="py-20 px-6 text-center">
        <button onClick={() => navigate({ name: 'INQUIRY_FORM' })} className="bg-white text-slate-950 w-full py-5 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all">
          Initiate Connection
        </button>
      </div>
    </div>
  );
};