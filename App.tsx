import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { PropertyEditor } from './pages/PropertyEditor';
import { UserGallery } from './pages/UserGallery';
import { PropertyDetail } from './pages/PropertyDetail';
import { AuthGate } from './pages/AuthGate';
import { GlobalGuide } from './components/GlobalGuide';
import { InquiryForm } from './pages/InquiryForm';
import AdminAuth from './src/components/AdminAuth';

const isDemoMode = !import.meta.env.VITE_API_KEY || !import.meta.env.VITE_FIREBASE_API_KEY;

const AppContent: React.FC = () => {
  const { view, isAuthenticated, isAdmin, navigate, setIsDemoMode } = useStore();

  useEffect(() => {
    if (isDemoMode) {
      setIsDemoMode(true);
      navigate({ name: 'ADMIN_DASHBOARD' });
    }
  }, []);

  if (view.name === 'ADMIN_AUTH') {
    return <AdminAuth />;
  }

  if (!isAuthenticated && !isDemoMode) {
    return <AuthGate />;
  }

  const renderView = () => {
    if (isDemoMode) {
        return <AdminDashboard />;
    }
    
    if (isAdmin) {
        switch (view.name) {
            case 'ADMIN_DASHBOARD':
                return <AdminDashboard />;
            case 'ADMIN_EDIT':
                return <PropertyEditor propertyId={view.propertyId} />;
            default:
                return <AdminDashboard />;
        }
    }

    switch (view.name) {
      case 'USER_GALLERY':
        return <UserGallery />;
      case 'USER_PROPERTY':
        return <PropertyDetail propertyId={view.propertyId} />;
      case 'INQUIRY_FORM':
        return <InquiryForm propertyId={view.propertyId} />;
      default:
        return <UserGallery />;
    }
  };

  const isFullscreen = view.name === 'USER_PROPERTY' || view.name === 'INQUIRY_FORM' || isDemoMode || !isAuthenticated;

  if (isFullscreen) {
    return renderView();
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
      <GlobalGuide />
    </StoreProvider>
  );
}
