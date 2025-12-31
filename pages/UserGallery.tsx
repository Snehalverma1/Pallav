
import React, { useEffect, useRef } from 'react';
import { useStore } from '../context/Store';
import { Property } from '../types';
import { 
  MapPin, 
  Bed, 
  Bath, 
  MoveRight, 
  Globe, 
  Shield, 
  Star, 
  Sparkles, 
  ChevronDown, 
  Building2 
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const chars = containerRef.current.querySelectorAll('.char');
    if (chars.length > 0) {
      gsap.from(chars, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
        },
        y: 80,
        opacity: 0,
        rotateX: -90,
        stagger: 0.03,
        duration: 1,
        ease: "power4.out"
      });
    }
  }, [text]);

  return (
    <div ref={containerRef} className={`${className} perspective-1000`}>
      {text.split('').map((char, i) => (
        <span key={i} className="char inline-block whitespace-pre">
          {char}
        </span>
      ))}
    </div>
  );
};

const TiltCard: React.FC<{ property: Property; onClick: () => void }> = ({ property, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative group cursor-pointer w-full reveal-card"
    >
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-blue-500/10"
      >
        <div className="relative h-96 overflow-hidden">
          <img 
            src={property.imageUrl} 
            alt={property.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/20 text-white font-black tracking-widest text-sm shadow-2xl">
            ${(property.price / 1000).toLocaleString()}K
          </div>
          <div className="absolute bottom-8 left-8 right-8">
             <div className="flex items-center gap-2 mb-2">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.3em]">Verified Luxury</span>
             </div>
             <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{property.title}</h3>
          </div>
        </div>
        <div className="p-8">
          <p className="text-slate-500 text-sm flex items-center gap-2 mb-8"><MapPin size={16} className="text-blue-500"/> {property.address}</p>
          <div className="flex justify-between items-center pt-8 border-t border-white/5">
             <div className="flex gap-6">
                <div className="flex flex-col">
                   <span className="text-white font-black text-xl flex items-center gap-2"><Bed size={20} className="text-blue-500"/> {property.bedrooms}</span>
                   <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Bedrooms</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-white font-black text-xl flex items-center gap-2"><Bath size={20} className="text-blue-500"/> {property.bathrooms}</span>
                   <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Bathrooms</span>
                </div>
             </div>
             <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all shadow-xl">
                <MoveRight className="text-white" size={24} />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const UserGallery: React.FC = () => {
  const { properties, navigate } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background parallax effect
      gsap.to(".parallax-bg", {
        scrollTrigger: {
          trigger: ".parallax-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        },
        yPercent: 30,
        ease: "none"
      });

      // Staggered reveal for cards
      gsap.from(".reveal-card", {
        scrollTrigger: {
          trigger: "#properties",
          start: "top 80%"
        },
        y: 120,
        opacity: 0,
        stagger: 0.1,
        duration: 1.5,
        ease: "power4.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, [properties]);

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div ref={containerRef} className="relative z-10 selection:bg-blue-500 selection:text-white">
      
      {/* 1. CINEMATIC HERO */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="text-center px-6 z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center gap-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-3 rounded-full text-white/50 text-xs font-black uppercase tracking-[0.4em]"
          >
            <Globe size={18} className="animate-spin-slow text-blue-400" /> A New Era of Real Estate
          </motion.div>
          
          <AnimatedText 
            text="THE" 
            className="text-7xl md:text-[10rem] font-black text-white leading-none tracking-tighter" 
          />
          <AnimatedText 
            text="FUTURE" 
            className="text-8xl md:text-[14rem] font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-indigo-500 italic leading-none tracking-tighter" 
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto font-light mt-12 mb-16 leading-relaxed"
          >
            Experience architectural perfection curated by neural networks.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center"
          >
            <button 
              onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-12 py-6 bg-white text-slate-950 font-black rounded-full overflow-hidden hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 flex items-center gap-3 text-xl">View Collection <ChevronDown size={24}/></span>
            </button>
          </motion.div>
        </motion.div>
        
        {/* Floating 3D Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <motion.div animate={{ y: [0, -100, 0], rotate: [0, 180, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-20 left-[10%] w-96 h-96 border-2 border-white/20 rounded-[5rem]" />
           <motion.div animate={{ y: [0, 100, 0], rotate: [0, -180, 0], scale: [1, 0.8, 1] }} transition={{ duration: 25, repeat: Infinity }} className="absolute bottom-20 right-[10%] w-[500px] h-[500px] border border-blue-500/20 rounded-full" />
        </div>
      </section>

      {/* 2. THE MANIFESTO (PARALLAX) */}
      <section id="about" className="parallax-section relative py-60 px-6 bg-slate-950/40 backdrop-blur-xl overflow-hidden">
        <div className="parallax-bg absolute inset-0 opacity-20 scale-125">
           <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80" 
            alt="Parallax"
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
           <div className="reveal-up">
              <h2 className="text-blue-400 font-black text-sm uppercase tracking-[0.6em] mb-8">The Manifesto</h2>
              <AnimatedText 
                text="WE REDEFINE LUXURY" 
                className="text-6xl md:text-8xl font-black text-white mb-12 leading-tight" 
              />
              <p className="text-slate-400 text-xl md:text-2xl leading-relaxed mb-16 font-extralight italic">
                Our algorithm processes 1.2 million architectural variables to find the exact resonance between owner and estate.
              </p>
              <div className="grid grid-cols-2 gap-12">
                 <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl group hover:border-blue-500/50 transition-colors">
                    <div className="text-5xl font-black text-white mb-4">$8.4B</div>
                    <div className="text-slate-500 text-xs font-black uppercase tracking-widest">Global Portfolio</div>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl group hover:border-blue-500/50 transition-colors">
                    <div className="text-5xl font-black text-white mb-4">99%</div>
                    <div className="text-slate-500 text-xs font-black uppercase tracking-widest">Matching Accuracy</div>
                 </div>
              </div>
           </div>
           
           <div className="relative group">
              <motion.div 
                whileHover={{ scale: 0.98, rotate: -2 }}
                className="rounded-[5rem] overflow-hidden shadow-2xl border border-white/20"
              >
                 <img src="https://images.unsplash.com/photo-1600607687940-4e524cb35797?auto=format&fit=crop&w=1200&q=80" className="w-full h-[700px] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
              </motion.div>
              <div className="absolute -bottom-16 -left-16 bg-blue-600 p-16 rounded-[4rem] text-white shadow-3xl hidden xl:block">
                 <Shield size={48} className="mb-6" />
                 <div className="font-black text-3xl mb-2">Immutable Trust</div>
                 <div className="text-blue-100 text-sm font-bold uppercase tracking-widest">Secured by Neural Link</div>
              </div>
           </div>
        </div>
      </section>

      {/* 3. PROPERTY SHOWCASE */}
      <section id="properties" className="py-60 px-6 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
            <div className="reveal-up">
              <h2 className="text-white text-6xl md:text-[8rem] font-black tracking-tighter leading-none mb-8">THE VAULT</h2>
              <p className="text-slate-500 text-xl max-w-xl font-light leading-relaxed">A strictly curated index of properties that exist beyond conventional standards.</p>
            </div>
            <div className="flex gap-4 reveal-up">
               <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2rem] flex items-center gap-4 group hover:bg-white/10 transition-all">
                  <Sparkles className="text-blue-400" size={24} />
                  <div>
                    <div className="text-white font-black text-sm uppercase tracking-widest">AI Concierge</div>
                    <div className="text-slate-500 text-[10px] font-bold">Always Active</div>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {properties.map((p) => (
              <TiltCard key={p.id} property={p} onClick={() => navigate({ name: 'USER_PROPERTY', propertyId: p.id })} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section id="contact" className="py-60 px-6 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <div className="relative bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-[100px] border border-white/10 rounded-[6rem] p-16 md:p-32 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                 <h2 className="text-6xl md:text-[10rem] font-black text-white mb-12 tracking-tighter leading-none">
                    ACQUIRE YOUR <br/>
                    <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-400 to-indigo-500">LEGACY</span>
                 </h2>
                 <p className="text-slate-400 text-xl md:text-3xl max-w-3xl mx-auto mb-20 font-extralight leading-relaxed">Enter the circle of elite architectural preservation.</p>
                 <button className="group relative inline-flex items-center gap-6 bg-white text-slate-950 px-16 py-8 rounded-full font-black text-2xl hover:scale-110 transition-all duration-700 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
                    Initiate Connection
                    <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                       <MoveRight className="text-white" size={28} />
                    </div>
                 </button>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/20 blur-[200px] -z-10 animate-pulse" />
           </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 px-6 border-t border-white/5 bg-slate-950/20">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 items-center text-center md:text-left">
            <div className="text-4xl font-black text-white flex items-center justify-center md:justify-start gap-4">
               <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
                  <Building2 className="text-slate-950" size={32} />
               </div>
               EstateAI
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 text-slate-500 font-black text-xs uppercase tracking-[0.4em]">
               <button onClick={() => window.scrollTo(0,0)} className="hover:text-blue-400">Surface</button>
               <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-400">Manifesto</button>
               <button onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-400">Vault</button>
               <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-blue-400">Initiate</button>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
               <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4">© 2025 NEURAL ESTATE TECH LTD</div>
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Globe size={14} className="text-white"/></div>
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"><Shield size={14} className="text-white"/></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};
