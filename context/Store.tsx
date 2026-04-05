
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, ViewState, User, Inquiry } from '../types';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, writeBatch, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

interface Filters {
    searchTerm: string;
    maxPrice: number | null;
    listingType: 'all' | 'sale' | 'rent';
}

interface StoreContextType {
  view: ViewState;
  navigate: (view: ViewState) => void;
  properties: Property[];
  filteredProperties: Property[];
  addProperty: (p: Omit<Property, 'id' | 'userId'>) => void;
  updateProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;
  getProperty: (id: string) => Property | undefined;
  isOnline: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: User | null;
  login: (email: string, pass: string) => Promise<any | string>;
  signUp: (email: string, pass: string, phone: string) => Promise<any | string>;
  logout: () => void;
  syncLocalToCloud: () => Promise<void>;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  addInquiry: (inquiry: Inquiry) => Promise<boolean | string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const MOCK_PROPERTIES: Property[] = [
    {
      id: '1',
      userId: 'admin_user',
      title: 'Modern Sunset Villa',
      price: 1250000,
      address: '123 Ocean Dr, Malibu, CA',
      description: 'A stunning modern villa with panoramic ocean views, infinity pool, and smart home integration.',
      bedrooms: 4,
      bathrooms: 3.5,
      sqft: 3200,
      imageUrl: 'https://picsum.photos/id/122/800/600',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      aiSystemInstruction: 'You are an enthusiastic luxury agent. Focus on the sunset views and the high-tech smart features. Use emojis and sophisticated language.',
      aiTemperature: 0.8,
      listingType: 'sale'
    },
    {
      id: '2',
      userId: 'admin_user',
      title: 'Cozy Downtown Loft',
      price: 450000,
      address: '45 Main St, Seattle, WA',
      description: 'Industrial chic loft in the heart of the city. Exposed brick, high ceilings, and walking distance to best coffee shops.',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 850,
      imageUrl: 'https://picsum.photos/id/195/800/600',
      aiSystemInstruction: 'You are a sophisticated and eloquent real estate concierge. Your focus is on the luxurious features, breathtaking views, and architectural marvels of the property. Use vivid and evocative language to paint a picture of opulence and exclusivity.',
      aiTemperature: 0.4,
      listingType: 'rent'
    }
  ];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [view, setView] = useState<ViewState>({ name: 'USER_GALLERY' });
  const [properties, setProperties] = useState<Property[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [filters, setFilters] = useState<Filters>({ searchTerm: '', maxPrice: null, listingType: 'all' });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && db) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        
        setIsAdmin(adminDoc.exists());
        setCurrentUser({ 
            email: user.email || '', 
            uid: user.uid, 
            phone: userDoc.exists() ? userDoc.data().phone : '' 
        });

      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setIsOnline(!!user && !isDemoMode);
    });
    return () => unsubscribe();
  }, [isDemoMode]);


  const login = async (email: string, password: string): Promise<any | string> => {
    if (isDemoMode) {
        alert("Login is disabled in Demo Mode.");
        return "Login disabled.";
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
        return error.message;
    }
  };

  const signUp = async (email: string, password: string, phone: string): Promise<any | string> => {
    if (isDemoMode) {
        alert("Sign up is disabled in Demo Mode.");
        return "Sign up disabled.";
    }
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (db) {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                phone: phone
            });
        }
        return userCredential;
    } catch (error: any) {
        return error.message;
    }
  };

  const logout = () => {
    if (!isDemoMode) {
      signOut(auth);
    }
  }

  useEffect(() => {
    if (!isDemoMode && currentUser && db) {
      const q = query(collection(db, 'properties'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cloudProps = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Property[];
        setProperties(cloudProps);
        setDataLoaded(true);
        setIsOnline(true);
      }, (error) => {
        console.warn("Firestore access error. Using local fallback.", error);
        loadLocalData();
        setIsOnline(false);
      });
      return () => unsubscribe();
    } else {
      loadLocalData();
    }
  }, [isDemoMode, currentUser]);

  const loadLocalData = () => {
    const saved = localStorage.getItem('estate_properties');
    setProperties(saved ? JSON.parse(saved) : MOCK_PROPERTIES);
    setDataLoaded(true);
  };

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('estate_properties', JSON.stringify(properties));
    }
  }, [properties, dataLoaded]);


  const syncLocalToCloud = async () => {
    if(isDemoMode || !isOnline || !db || !currentUser) {
        alert("Not connected or logged in. Cannot sync.");
        return;
    }

    const localProps = JSON.parse(localStorage.getItem('estate_properties') || '[]') as Property[];
    const cloudPropsIds = new Set(properties.map(p => p.id));

    const toAdd = localProps.filter(p => p.id.startsWith('local-'));
    const toUpdate = localProps.filter(p => !p.id.startsWith('local-') && !cloudPropsIds.has(p.id));

    if (toAdd.length === 0 && toUpdate.length === 0) {
        alert("Already up-to-date!");
        return;
    }

    const batch = writeBatch(db);

    toAdd.forEach(prop => {
        const { id, ...data } = prop;
        const newDocRef = doc(collection(db, "properties"));
        batch.set(newDocRef, {...data, userId: currentUser.email});
    });

    toUpdate.forEach(prop => {
        const docRef = doc(db, "properties", prop.id);
        batch.update(docRef, {...prop, userId: currentUser.email});
    });

    try {
        await batch.commit();
        alert(`Sync successful! Added ${toAdd.length} and updated ${toUpdate.length} properties.`);
        const nonLocalProps = localProps.filter(p => !p.id.startsWith('local-'));
        localStorage.setItem('estate_properties', JSON.stringify(nonLocalProps));

    } catch (e) {
        console.error("Sync Error:", e);
        alert("Sync failed. Check console and Firestore rules.");
    }
};

  const addProperty = async (p: Omit<Property, 'id' | 'userId'>) => {
    if (isDemoMode) {
        const localProperty: Property = { ...p, id: `local-${Date.now()}`, userId: 'demo_user' };
        setProperties(prev => [...prev, localProperty]);
        return;
    }
    if (!currentUser) {
        alert("You must be logged in to add a property.");
        return;
    }
    const newProperty: Omit<Property, 'id'> = { ...p, userId: currentUser.email };
    if (isOnline && db) {
      try {
        await addDoc(collection(db, 'properties'), newProperty);
      } catch (e) {
        console.error("Cloud Error:", e);
        alert("Permission Denied: Ensure your Firestore Rules allow write access.");
      }
    } else {
      const localProperty: Property = { ...newProperty, id: `local-${Date.now()}` };
      setProperties(prev => [...prev, localProperty]);
    }
  };

  const addInquiry = async (inquiry: Inquiry): Promise<boolean | string> => {
    if (!isOnline || !db) {
      alert('Cannot submit inquiry while offline.');
      return 'Cannot submit inquiry while offline.';
    }
    try {
      await addDoc(collection(db, 'inquiries'), inquiry);
      return true;
    } catch (e: any) {
      console.error('Inquiry Error:', e);
      return e.message as string;
    }
  };

  const updateProperty = async (p: Property) => {
    if (isDemoMode) {
        setProperties(prev => prev.map(item => item.id === p.id ? p : item));
        return;
    }
    if (isOnline && db) {
      const { id, ...data } = p;
      await updateDoc(doc(db, 'properties', id), data);
    } else {
      setProperties(prev => prev.map(item => item.id === p.id ? p : item));
    }
  };

  const deleteProperty = async (id: string) => {
    if (isDemoMode) {
        setProperties(prev => prev.filter(p => p.id !== id));
        return;
    }
    if (isOnline && db) {
      await deleteDoc(doc(db, 'properties', id));
    } else {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const navigate = (newView: ViewState) => {
    setView(newView);
  };

  const getProperty = (id: string) => properties.find(p => p.id === id);

  const filteredProperties = properties.filter(p => {
    const searchTermMatch = 
      filters.searchTerm === '' ||
      p.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const priceMatch = filters.maxPrice === null || p.price <= filters.maxPrice;

    const listingTypeMatch = filters.listingType === 'all' || p.listingType === filters.listingType;

    return searchTermMatch && priceMatch && listingTypeMatch;
  })


  return (
    <StoreContext.Provider value={{
      view, navigate, properties, addProperty, updateProperty, deleteProperty, getProperty,
      isOnline,
      filters,
      setFilters,
      filteredProperties,
      isAuthenticated,
      isAdmin,
      currentUser,
      login,
      signUp,
      logout,
      syncLocalToCloud,
      isDemoMode,
      setIsDemoMode,
      addInquiry
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
