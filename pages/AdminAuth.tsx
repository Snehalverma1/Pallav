import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { ShieldCheck, Lock, Mail, ArrowRight, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminAuth: React.FC = () => {
  const { login, register, authError, isAuthenticating } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password });
      }
    } catch (err) {
      // Error is handled in the store
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        
        {/* Header */}
        <div className="bg-slate-900 p-10 text-center text-white relative overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600 opacity-20 rounded-full blur-3xl"
          />
          <ShieldCheck className="mx-auto mb-4 text-blue-400" size={56} />
          <h2 className="text-3xl font-black relative z-10 tracking-tight">
            {mode === 'login' ? 'Agent Terminal' : 'New Agent Badge'}
          </h2>
          <p className="text-slate-400 text-sm mt-2 relative z-10 font-medium">
            {mode === 'login' ? 'Authorized Personnel Only' : 'Register your secure credentials'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-2 bg-slate-50 mx-8 mt-8 rounded-xl border border-slate-100">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Protocol</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium"
                  placeholder="agent@estate.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Passphrase</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isAuthenticating}
            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isAuthenticating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {mode === 'login' ? 'Authenticate' : 'Initialize Profile'}
                {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
              </>
            )}
          </button>
        </form>
        
        {/* Footer Note */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
             This session is recorded and secured by neural link encryption.<br/>
             Unauthorized access will be logged.
           </p>
        </div>
      </motion.div>
    </div>
  );
};