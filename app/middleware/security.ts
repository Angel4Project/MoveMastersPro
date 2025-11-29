import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Initialize logger for middleware
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-middleware' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'logs/security.log' })
  ]
});

// Rate limiting configurations
const createRateLimiter = (config: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response, next: NextFunction) => void;
}) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      error: config.message,
      retryAfter: Math.ceil(config.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skipFailedRequests: config.skipFailedRequests || false,
    keyGenerator: config.keyGenerator || ((req: Request) => req.ip || req.connection.remoteAddress || 'unknown'),
    handler: config.handler || ((req: Request, res: Response) => {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      const url = req.originalUrl || req.url;
      
      logger.warn('Rate limit exceeded', {
        ip: clientIP,
        userAgent,
        url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      res.status(429).json({
        success: false,
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    })
  });
};

// Different rate limiting strategies
export const rateLimiters = {
  // Global rate limiter - protects against general abuse
  global: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests: true
  }),

  // Strict rate limiter for lead submissions
  leadSubmission: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 lead submissions per minute
    message: 'Too many lead submissions, please wait before submitting another.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }),

  // API endpoints rate limiter
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 API requests per windowMs
    message: 'Too many API requests, please try again later.',
    skipSuccessfulRequests: false
  }),

  // Authentication rate limiter
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth attempts per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful auth attempts
    skipFailedRequests: false
  })
};

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.telegram.org", "https://api.emailjs.com", "https://firestore.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  permittedCrossDomainPolicies: false
});

// CORS configuration
export const corsOptions = {
  origin: function (origin: any, callback: Function) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com'
    ];
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      );
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  const sanitizeString = (str: any): any => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/[<>\"'&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000);
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  res.setHeader('X-Request-ID', requestId);
  (req as any).requestStartTime = startTime;

  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return originalSend.call(this, data);
  };

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.setHeader('X-Processing-Time', '0ms');
  
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000;
    
    res.setHeader('X-Processing-Time', `${duration.toFixed(2)}ms`);
    
    if (duration > 5000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip
      });
    }
    
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.get('X-Request-ID') || 'unknown';
  
  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    requestId,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
};

// Combined security middleware factory
export const createSecurityMiddleware = () => {
  return [
    requestLogger,
    securityHeaders,
    cors(corsOptions),
    rateLimiters.global,
    sanitizeInput,
    performanceMonitor,
    errorHandler
  ];
};

// Export all middleware components
export default {
  rateLimiters,
  securityHeaders,
  corsOptions,
  sanitizeInput,
  requestLogger,
  performanceMonitor,
  errorHandler,
  createSecurityMiddleware
};