
import React from 'react';
import { useStore } from '../context/Store';
import { Building2, Settings, Home, LogOut, Menu, X, ShieldAlert, Lock, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { navigate, view, isAuthenticated, logout } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdmin = view.name.startsWith('ADMIN');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl flex items-center gap-2">
          <Building2 className="text-blue-400" /> EstateAI
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="text-blue-500" /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              EstateAI
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Property Management</p>
        </div>

        <nav className="mt-8 px-4 space-y-2 flex-1">
          <button
            onClick={() => {
              navigate({ name: 'USER_GALLERY' });
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              !isAdmin 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home size={20} />
            <span className="font-bold">Property Gallery</span>
          </button>

          <button
            onClick={() => {
              navigate({ name: 'ADMIN_DASHBOARD' });
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isAdmin 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck size={20} />
            <span className="font-bold">Admin Panel</span>
          </button>
        </nav>

        {/* Auth Section */}
        <div className="p-4 bg-slate-950/50 m-4 rounded-2xl border border-slate-800">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400 text-xs font-bold px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Logged in as Admin
              </div>
              <button 
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-sm font-bold"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center">
               <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-widest">Property Manager</p>
               <button 
                 onClick={() => navigate({ name: 'ADMIN_DASHBOARD' })}
                 className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 py-2 rounded-xl text-xs font-black transition-all border border-slate-700"
               >
                 SECURE LOGIN
               </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-gray-50">
        {children}
      </main>
      
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};
