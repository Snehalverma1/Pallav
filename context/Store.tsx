import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, ViewState, User as UserCreds } from '../types';
import { db, auth, connectionStatus } from '../services/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';

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
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (u: UserCreds) => Promise<void>;
  register: (u: UserCreds) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  isAuthenticating: boolean;
  
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

const getFriendlyErrorMessage = (error: any) => {
  const code = error.code || '';
  const message = error.message || '';
  
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Invalid email or password. If you are new, please switch to Register.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please sign in instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network error. Please check your internet connection.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Email/Password sign-in is not enabled in the Firebase Console.';
  }
  if (message.includes('API key')) {
    return 'Configuration Error: Invalid Firebase API Key.';
  }
  return message;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>({ name: 'USER_GALLERY' });
  const [properties, setProperties] = useState<Property[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  // Auth State Listener
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsAuthenticated(!!user);
        setIsAuthenticating(false);
      });
      return () => unsubscribe();
    } else {
      setIsAuthenticating(false);
    }
  }, []);

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

  const syncLocalToCloud = async () => {
    if (connectionStatus !== 'connected' || !db) return;
    
    const localSaved = localStorage.getItem('estate_properties');
    if (!localSaved) return;
    
    const localProps: Property[] = JSON.parse(localSaved);
    const querySnapshot = await getDocs(collection(db, 'properties'));
    const existingTitles = querySnapshot.docs.map(d => d.data().title);

    for (const p of localProps) {
      if (!existingTitles.includes(p.title)) {
        const { id, ...data } = p;
        await addDoc(collection(db, 'properties'), data);
      }
    }
    
    localStorage.removeItem('estate_properties');
  };

  const addProperty = async (p: Property) => {
    if (connectionStatus === 'connected' && db) {
      try {
        const { id, ...data } = p; 
        await addDoc(collection(db, 'properties'), data);
      } catch (e) {
        console.error("Cloud Error:", e);
        alert("Permission Denied: Ensure you are logged in or set Firestore Rules to allow access.");
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

  const login = async (credentials: UserCreds) => {
    setAuthError(null);
    if (!auth) {
      setAuthError("Auth service is not initialized. Check firebase.ts.");
      return;
    }
    
    setIsAuthenticating(true);
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (e: any) {
      console.error("Login Error:", e);
      setAuthError(getFriendlyErrorMessage(e));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const register = async (credentials: UserCreds) => {
    setAuthError(null);
    if (!auth) {
      setAuthError("Auth service is not initialized. Check firebase.ts.");
      return;
    }
    
    setIsAuthenticating(true);
    try {
      await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (e: any) {
      console.error("Register Error:", e);
      setAuthError(getFriendlyErrorMessage(e));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      navigate({ name: 'USER_GALLERY' });
    } catch (e) {
      console.error("Logout Error:", e);
    }
  };

  return (
    <StoreContext.Provider value={{ 
      view, navigate, properties, addProperty, updateProperty, deleteProperty, getProperty, syncLocalToCloud,
      currentUser, isAuthenticated, login, register, logout, authError, isAuthenticating,
      isOnline: connectionStatus === 'connected'
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