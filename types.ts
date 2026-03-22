export interface Property {
  id: string;
  userId?: string;
  title: string;
  price: number;
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  videoUrl?: string;
  aiSystemInstruction: string;
  aiTemperature: number;
}

export interface Inquiry {
  name: string;
  phone: string;
  address: string;
  inquiryType: 'buy' | 'sell';
  message: string;
  userId?: string;
  propertyId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  email: string;
  uid: string;
  phone?: string;
}

export type ViewState =
  | { name: 'USER_GALLERY' }
  | { name: 'USER_PROPERTY'; propertyId: string }
  | { name: 'ADMIN_LOGIN' }
  | { name: 'ADMIN_DASHBOARD' }
  | { name: 'ADMIN_EDIT'; propertyId: string | null }
  | { name: 'INQUIRY_FORM'; propertyId?: string };