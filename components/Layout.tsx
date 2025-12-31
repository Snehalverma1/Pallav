
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Building2, Home, LayoutGrid, Info, Mail, ShieldCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { navigate, view, isAuthenticated } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (view.name !== 'USER_GALLERY') {
      navigate({ name: 'USER_GALLERY' });
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const navItems = [
    { name: 'Surface', icon: Home, id: 'home' },
    { name: 'Manifesto', icon: Info, id: 'about' },
    { name: 'Vault', icon: LayoutGrid, id: 'properties' },
    { name: 'Initiate', icon: Mail, id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Floating Header Nav */}
      <nav className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl transition-all duration-500 ${scrolled ? 'top-4' : 'top-8'}`}>
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-full px-10 py-5 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5"
        >
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate({ name: 'USER_GALLERY' })}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000 shadow-2xl">
              <Building2 size={24} className="text-slate-950" />
            </div>
            <span className="text-white font-black tracking-tighter text-2xl group-hover:text-blue-400 transition-colors">EstateAI</span>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-slate-400 hover:text-white font-black text-xs uppercase tracking-[0.3em] transition-all relative group"
              >
                {item.name}
                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-500 group-hover:w-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
             <button 
               onClick={() => navigate({ name: 'ADMIN_DASHBOARD' })}
               className="group relative bg-white/5 hover:bg-blue-600 border border-white/10 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all overflow-hidden"
             >
               <span className="relative z-10">{isAuthenticated ? 'Terminal' : 'Auth'}</span>
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
             <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2 bg-white/5 rounded-xl">
                {isOpen ? <X /> : <Menu />}
             </button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Fullscreen Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
            className="fixed inset-0 z-[90] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-12"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white text-6xl md:text-8xl font-black tracking-tighter hover:text-blue-400 transition-all transform hover:scale-110"
              >
                {item.name}
              </button>
            ))}
            <button 
              onClick={() => { setIsOpen(false); navigate({ name: 'ADMIN_DASHBOARD' }); }}
              className="mt-8 text-blue-400 font-black text-xs uppercase tracking-[0.5em] border border-blue-400/20 px-8 py-4 rounded-full"
            >
              Control Center
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};
