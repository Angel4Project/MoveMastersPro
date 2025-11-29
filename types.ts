import { ReactNode } from 'react';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  distance: number;
  rooms: number;
  floor: number;
  elevator: boolean;
  crane: boolean;
  packing: boolean;
  volume: number; // Cubic meters
  items: InventoryItem[];
  quote: number;
  status: 'new' | 'in_progress' | 'closed' | 'archived';
  createdAt: number;
  notes?: string;
  nextFollowUp?: string;
  source?: string;
  score?: number;
  vehicleType?: 'van' | 'small_truck' | 'big_truck' | 'any';
  isFirstTimeCustomer?: boolean;
}

export type ProductCategory = 'boxes' | 'protection' | 'tools' | 'kits';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: ProductCategory;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  image: string;
  pinned?: boolean;
  tags?: string[];
  category?: string;
  link?: string;
  contactEmail?: string;
  readTime?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type AIProvider = 'google' | 'openai' | 'openrouter';

export interface AppSettings {
  basePrice: number;
  pricePerKm: number;
  pricePerRoom: number;
  pricePerFloor: number;
  pricePerCbm: number; // Volume pricing
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string; // e.g. 'gemini-2.5-flash' or 'gpt-4o'
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export enum ThemeMode {
  DEFAULT = 'default',
  HIGH_CONTRAST = 'high_contrast'
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (pass: string) => boolean;
  logout: () => void;
}

export interface InventoryItem {
  id: string;
  name: string;
  cbm: number; // Cubic meters per unit
  quantity: number;
  category: 'furniture' | 'appliances' | 'boxes' | 'tools';
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  clicks: number;
  leads: number;
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  actions?: MessageAction[];
}

export interface ChatConversation {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
  startedAt: number;
  lastActivity: number;
  userInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  leadCreated?: boolean;
  leadId?: string;
  status: 'active' | 'completed' | 'archived';
}

export interface MessageAction {
  label: string;
  type: 'phone' | 'whatsapp' | 'link';
  value: string;
  icon?: any;
}

export const COMPANY_INFO = {
    name: 'הובלות המקצוען',
    owner: 'דדי',
    email: 'hovalotdedi@gmail.com',
    phone: '050-5350148',
    address: 'אחוזה 131, רעננה'
};