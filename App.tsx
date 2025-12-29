import React from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { PropertyEditor } from './pages/PropertyEditor';
import { UserGallery } from './pages/UserGallery';
import { PropertyDetail } from './pages/PropertyDetail';
import { AdminAuth } from './pages/AdminAuth';
import { GlobalGuide } from './components/GlobalGuide';

const AppContent: React.FC = () => {
  const { view, isAuthenticated } = useStore();

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
