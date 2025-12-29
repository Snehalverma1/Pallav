export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  videoUrl?: string; // Can be a blob URL or external link
  
  // AI Configuration managed by Admin
  aiSystemInstruction: string; // The "persona" or specific instructions for this property
  aiTemperature: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  email: string;
  password: string; // In a real app, this would be hashed!
}

export type ViewState = 
  | { name: 'USER_GALLERY' }
  | { name: 'USER_PROPERTY'; propertyId: string }
  | { name: 'ADMIN_DASHBOARD' }
  | { name: 'ADMIN_EDIT'; propertyId: string | null }; // null for new
