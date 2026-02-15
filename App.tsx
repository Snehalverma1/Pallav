import React from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { PropertyEditor } from './pages/PropertyEditor';
import { UserGallery } from './pages/UserGallery';
import { PropertyDetail } from './pages/PropertyDetail';
import { AdminAuth } from './pages/AdminAuth';
import { GlobalGuide } from './components/GlobalGuide';
import { Loader2, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { view, isAuthenticated, isAuthenticating } = useStore();

  if (isAuthenticating) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-500" size={48} />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={20} />
        </div>
        <span className="text-white font-black text-[10px] uppercase tracking-[0.5em] opacity-50">Synchronizing Session</span>
      </div>
    );
  }

  const renderView = () => {
    // Auth Guard: If trying to access any ADMIN page and not logged in, show Auth
    if (view.name.startsWith('ADMIN') && !isAuthenticated) {
      return <AdminAuth />;
    }

    switch (view.name) {
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard />;
      case 'ADMIN_EDIT':
        return <PropertyEditor propertyId={view.propertyId} />;
      case 'USER_GALLERY':
        return <UserGallery />;
      case 'USER_PROPERTY':
        return <PropertyDetail propertyId={view.propertyId} />;
      default:
        return <UserGallery />;
    }
  };

  // Fullscreen view for property details (without sidebar)
  if (view.name === 'USER_PROPERTY') {
    return <PropertyDetail propertyId={view.propertyId} />;
  }

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
      {/* Mounted here to ensure it persists across Layout transitions */}
      <GlobalGuide />
    </StoreProvider>
  );
}