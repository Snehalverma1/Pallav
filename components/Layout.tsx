import React, { useState, useEffect } from 'react';
import { useStore } from '../context/Store';
import { Building2, Home, Search, LayoutGrid, Settings, User, LogOut, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { navigate, view, isAuthenticated, currentUser, logout } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Secret admin handshake logic
  useEffect(() => {
    if (adminClickCount === 0) return;
    const timer = setTimeout(() => setAdminClickCount(0), 2000); // Reset after 2s
    return () => clearTimeout(timer);
  }, [adminClickCount]);

  const handleLogoClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    if (newCount >= 5) {
      navigate({ name: 'ADMIN_AUTH' });
      setAdminClickCount(0);
    }
  };


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { name: 'Home', icon: Home, view: 'USER_GALLERY', id: 'home' },
    { name: 'Vault', icon: Search, view: 'USER_GALLERY', id: 'properties' },
    { name: 'Assistant', icon: Bot, view: 'USER_GALLERY', id: 'assistant' },
    { name: 'Terminal', icon: Settings, view: 'ADMIN_DASHBOARD', id: 'admin' },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.id === 'assistant') {
      // Logic for assistant handled by GlobalGuide
      const event = new CustomEvent('open-assistant');
      window.dispatchEvent(event);
      return;
    }
    
    if (tab.view === 'ADMIN_DASHBOARD') {
      navigate({ name: 'ADMIN_DASHBOARD' });
    } else {
      if (view.name !== 'USER_GALLERY') {
        navigate({ name: 'USER_GALLERY' });
      }
      setTimeout(() => {
        document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const isActive = (tabId: string) => {
    if (tabId === 'home' && view.name === 'USER_GALLERY') return true;
    if (tabId === 'admin' && view.name.startsWith('ADMIN')) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative pb-24">
      
      {/* Top App Bar */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Building2 size={18} className="text-slate-950" />
            </div>
            <span className="text-white font-black tracking-tighter text-lg">EstateAI</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button 
                onClick={() => navigate({ name: 'ADMIN_DASHBOARD' })}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400"
              >
                <User size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto px-0 md:px-4 mt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.name + (view.name === 'USER_PROPERTY' ? view.propertyId : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Android-Style Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/90 backdrop-blur-2xl border-t border-white/5 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          {tabs.map((tab) => {
            const active = isActive(tab.id);
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center gap-1 min-w-[64px] transition-all relative ${active ? 'text-blue-400' : 'text-slate-500'}`}
              >
                <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-blue-500/10' : ''}`}>
                  <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-60'}`}>
                  {tab.name}
                </span>
                {active && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -top-3 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};