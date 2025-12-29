
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, ViewState, User } from '../types';
// Fixed: Removed non-existent export 'isConfigured' from firebase service
import { db, connectionStatus } from '../services/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';

interface StoreContextType {
  view: ViewState;
  navigate: (view: ViewState) => void;
  properties: Property[];
  addProperty: (p: Property) => void;
  updateProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
  syncLocalToCloud: () => Promise<void>;
  
  // Auth
  isAuthenticated: boolean;
  login: (u: User) => boolean;
  logout: () => void;
  authError: string | null;
  
  // System Status
  isOnline: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern Sunset Villa',
    price: 1250000,
    address: '123 Ocean Dr, Malibu, CA',
    description: 'A stunning modern villa with panoramic ocean views, infinity pool, and smart home integration.',
    bedrooms: 4,
    bathrooms: 3.5,
    sqft: 3200,
    imageUrl: 'https://picsum.photos/id/122/800/600',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    aiSystemInstruction: 'You are an enthusiastic luxury agent. Focus on the sunset views and the high-tech smart features. Use emojis.',
    aiTemperature: 0.8
  },
  {
    id: '2',
    title: 'Cozy Downtown Loft',
    price: 450000,
    address: '45 Main St, Seattle, WA',
    description: 'Industrial chic loft in the heart of the city. Exposed brick, high ceilings, and walking distance to best coffee shops.',
    bedrooms: 1,
    bathrooms: 1,
    sqft: 850,
    imageUrl: 'https://picsum.photos/id/195/800/600',
    aiSystemInstruction: 'You are a practical, no-nonsense agent. Focus on the investment value, low HOA fees, and proximity to tech hubs.',
    aiTemperature: 0.4
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>({ name: 'USER_GALLERY' });
  const [properties, setProperties] = useState<Property[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('estate_is_authenticated') === 'true';
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (connectionStatus === 'connected' && db) {
      const unsubscribe = onSnapshot(collection(db, 'properties'), (snapshot) => {
        const cloudProps = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Property[];
        setProperties(cloudProps);
        setDataLoaded(true);
      }, (error) => {
        console.warn("Firestore access error. Using local fallback.", error);
        loadLocalData();
      });
      return () => unsubscribe();
    } else {
      loadLocalData();
    }
  }, []);

  const loadLocalData = () => {
    const saved = localStorage.getItem('estate_properties');
    setProperties(saved ? JSON.parse(saved) : MOCK_PROPERTIES);
    setDataLoaded(true);
  };

  useEffect(() => {
    if (connectionStatus !== 'connected' && dataLoaded) {
      localStorage.setItem('estate_properties', JSON.stringify(properties));
    }
  }, [properties, dataLoaded]);

  useEffect(() => {
    localStorage.setItem('estate_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const syncLocalToCloud = async () => {
    if (connectionStatus !== 'connected' || !db) return;
    
    // Get all local properties
    const localSaved = localStorage.getItem('estate_properties');
    if (!localSaved) return;
    
    const localProps: Property[] = JSON.parse(localSaved);
    
    // Check what's already in the cloud to avoid duplicates if possible
    const querySnapshot = await getDocs(collection(db, 'properties'));
    const existingTitles = querySnapshot.docs.map(d => d.data().title);

    for (const p of localProps) {
      if (!existingTitles.includes(p.title)) {
        const { id, ...data } = p;
        await addDoc(collection(db, 'properties'), data);
      }
    }
    
    // Clear local storage to avoid confusion
    localStorage.removeItem('estate_properties');
  };

  const addProperty = async (p: Property) => {
    if (connectionStatus === 'connected' && db) {
      try {
        const { id, ...data } = p; 
        await addDoc(collection(db, 'properties'), data);
      } catch (e) {
        console.error("Cloud Error:", e);
        alert("Permission Denied: Did you set your Firestore Rules to 'allow read, write: if true;'?");
      }
    } else {
      setProperties(prev => [...prev, p]);
    }
  };

  const updateProperty = async (p: Property) => {
    if (connectionStatus === 'connected' && db) {
      const { id, ...data } = p;
      await updateDoc(doc(db, 'properties', id), data);
    } else {
      setProperties(prev => prev.map(item => item.id === p.id ? p : item));
    }
  };

  const deleteProperty = async (id: string) => {
    if (connectionStatus === 'connected' && db) {
      await deleteDoc(doc(db, 'properties', id));
    } else {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const navigate = (newView: ViewState) => {
    setView(newView);
    setAuthError(null);
  };

  const getProperty = (id: string) => properties.find(p => p.id === id);

  const login = (credentials: User): boolean => {
    if (credentials.email === 'admin@estate.ai' && credentials.password === 'secure_admin_only') {
      setIsAuthenticated(true);
      return true;
    }
    setAuthError("Invalid credentials.");
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigate({ name: 'USER_GALLERY' });
  };

  return (
    <StoreContext.Provider value={{ 
      view, navigate, properties, addProperty, updateProperty, deleteProperty, getProperty, syncLocalToCloud,
      isAuthenticated, login, logout, authError, isOnline: connectionStatus === 'connected'
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
