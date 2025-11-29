import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { z } from 'zod';
import { validationService } from '../services/validationService';
import { rateLimitService } from '../services/rateLimitService';
// import { configService } from '../services/configService'; // Not used in this component

// Firebase config validation
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID,
};

// Validate Firebase config
const requiredFirebaseVars = ['apiKey', 'authDomain', 'projectId'];
const missingVars = requiredFirebaseVars.filter(varName => !firebaseConfig[varName as keyof typeof firebaseConfig]);
if (missingVars.length > 0) {
  console.warn('Missing required Firebase environment variables:', missingVars);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Type definitions
interface Lead {
  id?: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  classification: string;
  sentiment: string;
  urgency: number;
  status: string;
  userAgent?: string;
  source?: string;
  requestId?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  website?: string; // Honeypot field
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    leadId: string;
    ai: {
      classification: string;
      sentiment: string;
      urgency: number;
    };
    timestamp: string;
    processingTime: string;
    services: {
      total: number;
      successful: number;
    };
  };
  requestId?: string;
}

// Zod validation schema for client-side validation
const formSchema = z.object({
  name: z.string()
    .min(2, 'שם חייב להיות לפחות 2 תווים')
    .max(100, 'שם לא יכול להיות יותר מ-100 תווים')
    .regex(/^[a-zA-Z\u0590-\u05FF\s]+$/, 'שם יכול להכיל רק אותיות ורווחים'),
  email: z.string()
    .email('כתובת אימייל לא תקינה')
    .max(254, 'כתובת אימייל ארוכה מדי')
    .toLowerCase()
    .trim(),
  phone: z.string()
    .min(9, 'מספר טלפון לא תקין')
    .max(20, 'מספר טלפון ארוך מדי')
    .regex(/^[+\d\s\-()]+$/, 'מספר טלפון יכול להכיל רק מספרים, רווחים, מקפים וסוגריים'),
  message: z.string()
    .min(10, 'הודעה חייבת להיות לפחות 10 תווים')
    .max(2000, 'הודעה לא יכולה להיות יותר מ-2000 תווים')
    .trim(),
  website: z.string().optional()
});

// Error Boundary Component
const ErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}> = ({ children, fallback: Fallback }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setError(new Error(error.message));
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason));
      setHasError(true);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  if (hasError && error) {
    const FallbackComponent = Fallback || DefaultErrorFallback;
    return <FallbackComponent error={error} />;
  }

  return children;
};

// Default Error Fallback Component
const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4" dir="rtl">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-red-600 text-xl mb-4">⚠️ שגיאה באפליקציה</div>
      <p className="text-gray-700 mb-4">אירעה שגיאה בלתי צפויה. אנא רענן את העמוד.</p>
      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer mb-2">פרטי השגיאה</summary>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {error.message}
        </pre>
      </details>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
      >
        רענן עמוד
      </button>
    </div>
  </div>
);

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ 
  size = 'md', 
  text = 'טוען...' 
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }[size];

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClass}`}></div>
      {text && <span className="mr-2 text-gray-600">{text}</span>}
    </div>
  );
};

// Success/Error Toast Component
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 ${typeStyles[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};

// Form Component with validation
const LeadForm: React.FC<{
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
}> = React.memo(({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '' // Honeypot field (hidden from users)
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  // Real-time validation
  const validateField = useCallback((name: keyof FormData, value: string) => {
    try {
      const testData = { ...formData, [name]: value };
      formSchema.partial().parse(testData);
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (error: any) {
      if (error?.issues) {
        const fieldError = error.issues.find((err: any) => err.path.includes(name));
        if (fieldError) {
          setErrors(prev => ({ ...prev, [name]: fieldError.message }));
        }
      }
    }
  }, [formData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof typeof touched]) {
      validateField(name as keyof FormData, value);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof FormData, value);
  }, [validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof FormData] = true;
      return acc;
    }, {} as Partial<Record<keyof FormData, boolean>>);
    setTouched(allTouched);

    // Validate entire form
    try {
      const validatedData = formSchema.parse(formData);
      await onSubmit(validatedData);
    } catch (error: any) {
      if (error?.issues) {
        const fieldErrors: Partial<Record<keyof FormData, string>> = {};
        error.issues.forEach((err: any) => {
          const fieldName = err.path[0] as keyof FormData;
          fieldErrors[fieldName] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  }, [formData, onSubmit]);

  const isFormValid = useMemo(() => {
    try {
      formSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  }, [formData]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          שם מלא *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full p-3 border rounded-lg transition-colors ${
            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
          placeholder="הכנס את שמך המלא"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          required
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          כתובת אימייל *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full p-3 border rounded-lg transition-colors ${
            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
          placeholder="your.email@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          מספר טלפון *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full p-3 border rounded-lg transition-colors ${
            errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
          placeholder="050-1234567"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          required
        />
        {errors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          הודעה *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={5}
          className={`w-full p-3 border rounded-lg transition-colors resize-vertical ${
            errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          }`}
          placeholder="תאר את הבקשה שלך..."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          required
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.message}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.message.length}/2000 תווים
        </p>
      </div>

      {/* Honeypot field - hidden from users but visible to bots */}
      <div className="hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          value={formData.website}
          onChange={handleChange}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !isFormValid}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          loading || !isFormValid
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner size="sm" text="שולח..." />
          </span>
        ) : (
          'שלח ליד'
        )}
      </button>
    </form>
  );
});

// Admin Panel Component
const AdminPanel: React.FC<{
  leads: Lead[];
  onMarkHandled: (leadId: string) => Promise<void>;
  onSignOut: () => void;
}> = React.memo(({ leads, onMarkHandled, onSignOut }) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'handled'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'urgency' | 'name'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads;
    
    // Filter by status
    if (filter !== 'all') {
      filtered = leads.filter(lead => lead.status.toLowerCase() === filter);
    }

    // Sort leads
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'urgency':
          comparison = a.urgency - b.urgency;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name, 'he');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [leads, filter, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'New').length;
    const handledLeads = leads.filter(l => l.status === 'Handled').length;
    const avgUrgency = total > 0 ? (leads.reduce((sum, l) => sum + l.urgency, 0) / total).toFixed(1) : '0';
    
    return { total, newLeads, handledLeads, avgUrgency };
  }, [leads]);

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-600 bg-red-100';
    if (urgency >= 6) return 'text-orange-600 bg-orange-100';
    if (urgency >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">פאנל ניהול לידים</h2>
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            התנתק
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800">סה״כ לידים</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.newLeads}</div>
            <div className="text-sm text-orange-800">לידים חדשים</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.handledLeads}</div>
            <div className="text-sm text-green-800">טופלו</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.avgUrgency}</div>
            <div className="text-sm text-purple-800">דחיפות ממוצעת</div>
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סינון:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="all">הכל</option>
              <option value="new">חדשים</option>
              <option value="handled">טופלו</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מיון לפי:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="timestamp">תאריך</option>
              <option value="urgency">דחיפות</option>
              <option value="name">שם</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סדר:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="desc">יורד</option>
              <option value="asc">עולה</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads list */}
      <div className="space-y-4">
        {filteredAndSortedLeads.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            {leads.length === 0 ? 'אין לידים עדיין' : 'לא נמצאו לידים התואמים לסינון'}
          </div>
        ) : (
          filteredAndSortedLeads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onMarkHandled={onMarkHandled}
              getUrgencyColor={getUrgencyColor}
              getSentimentColor={getSentimentColor}
            />
          ))
        )}
      </div>
    </div>
  );
});

// Individual Lead Card Component
const LeadCard: React.FC<{
  lead: Lead;
  onMarkHandled: (leadId: string) => Promise<void>;
  getUrgencyColor: (urgency: number) => string;
  getSentimentColor: (sentiment: string) => string;
}> = React.memo(({ lead, onMarkHandled, getUrgencyColor, getSentimentColor }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleMarkHandled = async () => {
    if (!lead.id) return;
    
    setIsUpdating(true);
    try {
      await onMarkHandled(lead.id);
    } catch (error) {
      console.error('Failed to mark as handled:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{lead.name}</h3>
          <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(lead.timestamp)}</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(lead.urgency)}`}>
            דחיפות: {lead.urgency}/10
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(lead.sentiment)}`}>
            {lead.sentiment}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {lead.classification}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700">
          {expanded ? lead.message : `${lead.message.substring(0, 100)}${lead.message.length > 100 ? '...' : ''}`}
        </p>
        {lead.message.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
          >
            {expanded ? 'הצג פחות' : 'הצג עוד'}
          </button>
        )}
      </div>

      {lead.requestId && (
        <div className="text-xs text-gray-500 mb-3">
          מזהה בקשה: {lead.requestId}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          lead.status === 'New' 
            ? 'bg-orange-100 text-orange-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {lead.status === 'New' ? 'חדש' : 'טופל'}
        </span>

        {lead.status === 'New' && (
          <button
            onClick={handleMarkHandled}
            disabled={isUpdating}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'מעדכן...' : 'סמן כטופל'}
          </button>
        )}
      </div>
    </div>
  );
});

// Main LeadSystem Component
const LeadSystem: React.FC = () => {
  const [view, setView] = useState<'form' | 'admin'>('form');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ classification: string; sentiment: string; urgency: number } | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);

  // Show toast helper
  const showToast = useCallback((message: string, type: ToastProps['type']) => {
    setToast({ message, type, onClose: () => setToast(null) });
  }, []);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        showToast('התחברת בהצלחה', 'success');
      }
    });
    return unsubscribe;
  }, [showToast]);

  // Fetch leads for admin
  useEffect(() => {
    if (view === 'admin' && isAuthenticated) {
      // Create a query to get leads ordered by timestamp
      const leadsQuery = query(
        collection(db, 'leads'),
        orderBy('timestamp', 'desc'),
        limit(100) // Limit to last 100 leads for performance
      );

      const unsubscribe = onSnapshot(leadsQuery, 
        (snapshot) => {
          const leadsData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as Lead));
          setLeads(leadsData);
        },
        (error) => {
          console.error('Error fetching leads:', error);
          showToast('שגיאה בטעינת הלידים', 'error');
        }
      );
      return unsubscribe;
    }
  }, [view, isAuthenticated, showToast]);

  const handleFormSubmit = useCallback(async (formData: FormData) => {
    setLoading(true);
    setAiResult(null);

    try {
      // 1. Check rate limiting
      const rateLimitCheck = rateLimitService.checkLeadSubmission();
      if (!rateLimitCheck.allowed) {
        showToast(`יותר מדי בקשות. אנא המתן ${rateLimitCheck.resetIn} שניות.`, 'error');
        return;
      }

      // 2. Enhanced validation with our service
      const validation = validationService.validateLeadForm(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0]?.[0] || 'נתונים לא תקינים';
        showToast(firstError, 'error');
        return;
      }

      // 3. Bot detection
      if (validationService.detectBotBehavior(formData)) {
        showToast('זוהתה פעילות חשודה. אנא נסה שוב מאוחר יותר.', 'error');
        return;
      }

      // 4. Check submission frequency
      const lastSubmission = localStorage.getItem('lastLeadSubmission');
      if (lastSubmission && !validationService.checkSubmissionFrequency(parseInt(lastSubmission))) {
        showToast('אנא המתן לפני שליחת ליד נוסף.', 'error');
        return;
      }

      // 5. Store submission timestamp
      localStorage.setItem('lastLeadSubmission', Date.now().toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/handle-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection
        },
        body: JSON.stringify(validation.sanitizedData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiResponse = await response.json();
        throw new Error(errorData.error || 'שגיאה בשליחת הליד');
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setAiResult(result.data.ai);
        showToast(result.message || 'הליד נשלח בהצלחה!', 'success');

        // Reset form by triggering a page reload or state reset in parent
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'שגיאה לא צפויה');
      }
    } catch (error) {
      console.error('Form submission error:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          showToast('הבקשה נכשלה עקב זמן קצוב. אנא נסה שוב.', 'error');
        } else {
          showToast(error.message, 'error');
        }
      } else {
        showToast('שגיאה בשליחת הליד. אנא נסה שוב.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleAdminLogin = useCallback(async () => {
    try {
      await signInAnonymously(auth);
      setView('admin');
    } catch (error) {
      console.error('Admin login error:', error);
      showToast('שגיאה בהתחברות לפאנל הניהול', 'error');
    }
  }, [showToast]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      setView('form');
      showToast('התנתקת בהצלחה', 'success');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('שגיאה בהתנתקות', 'error');
    }
  }, [showToast]);

  const markAsHandled = useCallback(async (leadId: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), { 
        status: 'Handled',
        handledAt: new Date().toISOString()
      });
      showToast('הליד סומן כטופל', 'success');
    } catch (error) {
      console.error('Error marking lead as handled:', error);
      showToast('שגיאה בעדכון הליד', 'error');
      throw error; // Re-throw to let the component handle the error state
    }
  }, [showToast]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">מערכת ניהול לידים</h1>
                <div className="flex space-x-2 space-x-reverse">
                  {view === 'form' ? (
                    <button
                      onClick={handleAdminLogin}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      לפאנל ניהול
                    </button>
                  ) : (
                    <button
                      onClick={() => setView('form')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      לטופס לידים
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <Suspense fallback={<LoadingSpinner size="lg" text="טוען..." />}>
            {view === 'form' ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">טופס לידים</h2>
                  <p className="text-gray-600">צור קשר איתנו ונחזור אליך בהקדם</p>
                </div>

                <LeadForm onSubmit={handleFormSubmit} loading={loading} />

                {/* AI Result Display */}
                {aiResult && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      🤖 תוצאת ניתוח AI
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">סיווג</div>
                        <div className="text-lg font-medium text-gray-800">{aiResult.classification}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">סנטימנט</div>
                        <div className="text-lg font-medium text-gray-800">{aiResult.sentiment}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600">דחיפות</div>
                        <div className="text-lg font-medium text-gray-800">{aiResult.urgency}/10</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <AdminPanel
                leads={leads}
                onMarkHandled={markAsHandled}
                onSignOut={handleSignOut}
              />
            )}
          </Suspense>
        </div>

        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={toast.onClose}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default LeadSystem;