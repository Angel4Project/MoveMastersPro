import { GoogleGenerativeAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { google } from 'googleapis';
import { z } from 'zod';
import winston from 'winston';
import { performance } from 'perf_hooks';

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lead-handler-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Custom error classes
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

class ExternalServiceError extends Error {
  constructor(message, service, originalError) {
    super(message);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.originalError = originalError;
    this.statusCode = 502;
  }
}

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

// Firebase config validation
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Validate Firebase config
const requiredEnvVars = ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID'];
const missingVars = requiredEnvVars.filter(varName => !firebaseConfig[varName]);
if (missingVars.length > 0) {
  logger.error('Missing required Firebase environment variables', { missingVars });
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Google Sheets setup
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Enhanced Zod schema with comprehensive validation
const leadSchema = z.object({
  name: z.string()
    .min(2, 'שם חייב להיות לפחות 2 תווים')
    .max(100, 'שם לא יכול להיות יותר מ-100 תווים')
    .regex(/^[a-zA-Z\u0590-\u05FF\s]+$/, 'שם יכול להכיל רק אותיות ורווחים'),
  email: z.string()
    .email('כתובת אימייל לא תקינה')
    .max(254, 'כתובת אימייל ארוכה מדי')
    .toLowerCase()
    .transform(email => email.trim()),
  phone: z.string()
    .min(9, 'מספר טלפון לא תקין')
    .max(20, 'מספר טלפון ארוך מדי')
    .regex(/^[+\d\s\-()]+$/, 'מספר טלפון יכול להכיל רק מספרים, רווחים, מקפים וסוגריים')
    .transform(phone => phone.replace(/\s+/g, ' ').trim()),
  message: z.string()
    .min(10, 'הודעה חייבת להיות לפחות 10 תווים')
    .max(2000, 'הודעה לא יכולה להיות יותר מ-2000 תווים')
    .transform(message => message.trim())
    .refine(message => !/[<>'"&]/.test(message), 'הודעה מכילה תווים לא מותרים'),
  // Honeypot field for bot protection
  website: z.string().optional().refine(val => !val || val === '', 'Bot submission detected')
});

// Sanitization utilities
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Retry mechanism with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { 
        error: error.message, 
        attempt, 
        maxRetries 
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Circuit breaker for external services
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Initialize circuit breakers for external services
const telegramCircuitBreaker = new CircuitBreaker(3, 30000);
const emailCircuitBreaker = new CircuitBreaker(3, 30000);
const sheetsCircuitBreaker = new CircuitBreaker(3, 30000);

// AI processing with fallback
const processWithAI = async (message) => {
  const fallbackResult = {
    classification: 'General Inquiry',
    sentiment: 'Neutral',
    urgency: 5
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
Analyze this lead message and respond with ONLY valid JSON:
"${message}"

Classify into one of: Price Inquiry, Support Question, Complaint, General Inquiry, Technical Issue
Sentiment: Positive, Neutral, Negative
Urgency: 1-10 (10 being most urgent)

Respond in this exact format:
{"classification": "...", "sentiment": "...", "urgency": number}
`;

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      const responseText = response.response.text().trim();
      
      // Clean response to ensure it's valid JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }
      
      return JSON.parse(jsonMatch[0]);
    });

    // Validate AI response
    const validClassifications = ['Price Inquiry', 'Support Question', 'Complaint', 'General Inquiry', 'Technical Issue'];
    const validSentiments = ['Positive', 'Neutral', 'Negative'];
    
    if (!validClassifications.includes(result.classification) || 
        !validSentiments.includes(result.sentiment) || 
        typeof result.urgency !== 'number' || 
        result.urgency < 1 || 
        result.urgency > 10) {
      logger.warn('AI response validation failed, using fallback', { result });
      return fallbackResult;
    }

    return result;
  } catch (error) {
    logger.error('AI processing failed, using fallback', { error: error.message, message: message.substring(0, 100) });
    return fallbackResult;
  }
};

// External service functions
const sendToTelegram = async (leadData, leadId) => {
  return telegramCircuitBreaker.execute(async () => {
    const text = `<b>🔔 ליד חדש!</b>\nשם: ${leadData.name}\nאימייל: ${leadData.email}\nטלפון: ${leadData.phone}\nהודעה: ${leadData.message}\nסיווג AI: ${leadData.classification}\nדחיפות: ${leadData.urgency}`;
    const keyboard = {
      inline_keyboard: [
        [{ text: '📞 התקשר', url: `tel:${leadData.phone}` }],
        [{ text: '📧 שלח מייל', url: `mailto:${leadData.email}` }],
        [{ text: '💬 WhatsApp', url: `https://wa.me/${process.env.BUSINESS_WA_PHONE_NUMBER}?text=ליד מ-${encodeURIComponent(leadData.name)}` }],
        [{ text: '✅ סמן כטופל', callback_data: `mark_handled_${leadId}` }],
      ],
    };

    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        reply_markup: keyboard,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  });
};

const sendEmailConfirmation = async (leadData) => {
  return emailCircuitBreaker.execute(async () => {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID_CLIENT,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          user_name: leadData.name,
          user_email: leadData.email,
          message_content: leadData.message,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  });
};

const saveToGoogleSheets = async (leadData) => {
  return sheetsCircuitBreaker.execute(async () => {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          leadData.timestamp,
          leadData.name,
          leadData.email,
          leadData.phone,
          leadData.message,
          leadData.classification,
          leadData.sentiment,
          leadData.urgency,
          'New',
          leadData.userAgent || ''
        ]],
      },
      auth,
    });
  });
};

export default async function handler(req, res) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = performance.now();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Log incoming request
  logger.info('Lead submission request received', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new ValidationError('Method not allowed', {
        allowedMethods: ['POST'],
        receivedMethod: req.method
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body', {
        parseError: error.message
      });
    }

    // Validate and sanitize input
    const validatedData = leadSchema.parse(body);
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: sanitizeInput(validatedData.email),
      phone: sanitizeInput(validatedData.phone),
      message: sanitizeInput(validatedData.message),
    };

    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent');

    logger.info('Input validation successful', {
      requestId,
      email: sanitizedData.email,
      hasMessage: !!sanitizedData.message
    });

    // Process with AI
    const aiResult = await processWithAI(sanitizedData.message);
    const { classification, sentiment, urgency } = aiResult;

    // Prepare lead data
    const leadData = {
      timestamp,
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      message: sanitizedData.message,
      classification,
      sentiment,
      urgency,
      status: 'New',
      userAgent,
      source: 'website',
      requestId
    };

    // Save to Firestore with retry mechanism
    const docRef = await retryWithBackoff(async () => {
      return await addDoc(collection(db, 'leads'), leadData);
    });
    const leadId = docRef.id;

    logger.info('Lead saved to Firestore', {
      requestId,
      leadId,
      email: sanitizedData.email
    });

    // Execute external services concurrently with error handling
    const externalServices = [];

    // Telegram notification
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      externalServices.push(
        sendToTelegram(leadData, leadId).catch(error => {
          logger.error('Telegram notification failed', { requestId, leadId, error: error.message });
          return { success: false, service: 'telegram', error: error.message };
        })
      );
    }

    // Email confirmation
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID_CLIENT) {
      externalServices.push(
        sendEmailConfirmation(leadData).catch(error => {
          logger.error('Email confirmation failed', { requestId, leadId, error: error.message });
          return { success: false, service: 'email', error: error.message };
        })
      );
    }

    // Google Sheets
    if (process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      externalServices.push(
        saveToGoogleSheets(leadData).catch(error => {
          logger.error('Google Sheets save failed', { requestId, leadId, error: error.message });
          return { success: false, service: 'sheets', error: error.message };
        })
      );
    }

    // Wait for all external services with timeout
    const serviceResults = await Promise.allSettled(externalServices);
    const successfulServices = serviceResults.filter(result => 
      result.status === 'fulfilled' && result.value?.success !== false
    ).length;

    logger.info('External services completed', {
      requestId,
      leadId,
      totalServices: externalServices.length,
      successfulServices
    });

    const totalTime = performance.now() - startTime;

    // Success response
    res.status(200).json({
      success: true,
      message: 'הליד נשלח בהצלחה',
      data: {
        leadId,
        ai: { classification, sentiment, urgency },
        timestamp,
        processingTime: `${totalTime.toFixed(2)}ms`,
        services: {
          total: externalServices.length,
          successful: successfulServices
        }
      }
    });

    logger.info('Lead processing completed successfully', {
      requestId,
      leadId,
      email: sanitizedData.email,
      totalTime: `${totalTime.toFixed(2)}ms`
    });

  } catch (error) {
    const totalTime = performance.now() - startTime;
    
    // Log error with context
    logger.error('Lead processing failed', {
      requestId,
      error: error.message,
      stack: error.stack,
      totalTime: `${totalTime.toFixed(2)}ms`,
      url: req.url,
      method: req.method,
      ip: req.ip
    });

    // Determine appropriate error response
    let statusCode = 500;
    let errorMessage = 'שגיאה פנימית בשרת';

    if (error instanceof ValidationError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
    } else if (error instanceof RateLimitError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
    } else if (error instanceof ExternalServiceError) {
      statusCode = error.statusCode;
      errorMessage = `שגיאה בשירות חיצוני: ${error.service}`;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.details || error.message,
        stack: error.stack 
      })
    });
  }
}