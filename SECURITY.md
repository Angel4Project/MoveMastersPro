# 🔒 מדריך אבטחה - המקצוען

## סקירה כללית

מערכת המקצוען מיישמת אמצעי אבטחה ברמה ארגונית להגנה על נתונים, משתמשים, ותשתית. המדריך הזה מתאר את כל אמצעי האבטחה המיושמים ואת השיטות המומלצות.

## 🛡️ ארכיטקטורת אבטחה

### שכבות אבטחה

```
┌─────────────────┐
│   Client Side   │ ← Input validation, Rate limiting, XSS protection
├─────────────────┤
│ API Layer       │ ← Authentication, Authorization, CORS
├─────────────────┤
│   Services      │ ← Encryption, Token validation, Audit logging
├─────────────────┤
│   Database      │ ← Field-level encryption, Access controls
└─────────────────┘
```

## 🔐 אימות ואישור (Authentication & Authorization)

### Firebase Authentication
- **אימות אנונימי** לפאנל ניהול עם הגבלת IP
- **JWT tokens** עם חתימה דיגיטלית
- **Session management** עם auto-logout
- **Multi-factor authentication** תמיכה

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  VIEWER = 'viewer'
}
```

## 🛡️ הגנה מפני התקפות נפוצות

### Cross-Site Scripting (XSS)
- **Content Security Policy (CSP)** מחמירה
- **Input sanitization** בכל קלט מהמשתמש
- **DOMPurify** לניקוי HTML
- **Trusted Types** API

### Cross-Site Request Forgery (CSRF)
- **SameSite cookies** הגדרה
- **CSRF tokens** בכל בקשות POST
- **Origin validation** בכל בקשות
- **X-Requested-With** header validation

### SQL Injection & NoSQL Injection
- **Parameterized queries** בכל שאילתות
- **Input validation** עם Zod schemas
- **Field sanitization** לפני שמירה
- **Prepared statements** ב-Firestore

### Clickjacking
- **X-Frame-Options: DENY** בכל תגובות
- **Frame-ancestors** CSP directive
- **Window.opener** protection

## 🔒 הצפנת נתונים

### Encryption at Rest
- **Firestore field-level encryption** לנתונים רגישים
- **AES-256-GCM** הצפנה
- **Key rotation** אוטומטית כל 90 יום
- **HSM** תמיכה לעתיד

### Encryption in Transit
- **TLS 1.3** בכל תקשורת
- **Perfect Forward Secrecy**
- **Certificate pinning** באפליקציה
- **HSTS** עם preload

### API Key Management
- **Environment variables** בלבד
- **Runtime injection** של מפתחות
- **No hardcoded secrets**
- **Key rotation** policy

## 🚦 בקרת קצב (Rate Limiting)

### Client-Side Rate Limiting
```typescript
// Lead submissions - 3 per 5 minutes
const leadLimit = rateLimitService.checkLeadSubmission();

// Chat messages - 10 per minute
const chatLimit = rateLimitService.checkChatMessage();

// API requests - 50 per minute
const apiLimit = rateLimitService.checkApiRequest();
```

### Server-Side Rate Limiting
- **Global limit**: 1000 requests per 15 minutes per IP
- **Lead submissions**: 5 per minute per IP
- **API endpoints**: 100 per 15 minutes per IP
- **Authentication**: 10 attempts per 15 minutes per IP

## 📊 לוגים וביקורת (Audit Logging)

### Logging Levels
```typescript
enum LogLevel {
  ERROR = 'error',     // Security incidents
  WARN = 'warn',       // Suspicious activities
  INFO = 'info',       // Normal operations
  DEBUG = 'debug'      // Development only
}
```

### Audit Events
- **Authentication events** (login/logout/failures)
- **Data access** (read/write operations)
- **Configuration changes**
- **Security violations**
- **Rate limit hits**

### Log Storage
- **Cloud Logging** עם retention policy
- **Encrypted storage** של לוגים רגישים
- **Real-time monitoring** עם alerts
- **Compliance exports** לרגולציה

## 🔍 זיהוי חדירות (Intrusion Detection)

### Bot Detection
```typescript
// Honeypot fields
const isBot = validationService.detectBotBehavior(formData);

// Submission frequency analysis
const isSpam = !validationService.checkSubmissionFrequency(lastSubmission);

// Behavioral analysis
const suspiciousPatterns = analyzeUserBehavior();
```

### Anomaly Detection
- **Unusual request patterns**
- **Geographic anomalies**
- **Time-based anomalies**
- **Volume spikes**

## 🛠️ כלי אבטחה ואוטומציה

### Security Headers (Helmet.js)
```javascript
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.telegram.org"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
});
```

### CORS Configuration
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

## 📋 בדיקות אבטחה

### Automated Security Testing
```bash
# Dependency vulnerability scanning
npm audit
npm audit fix

# SAST (Static Application Security Testing)
npm run security:scan

# DAST (Dynamic Application Security Testing)
npm run security:test

# Container security scanning
docker scan move-masters
```

### Manual Security Testing
- **OWASP ZAP** scanning
- **Burp Suite** testing
- **Postman** API testing
- **Browser DevTools** security analysis

## 🚨 תגובה לתקריות (Incident Response)

### Incident Response Plan
1. **Detection** - Monitoring alerts
2. **Assessment** - Impact analysis
3. **Containment** - Isolate affected systems
4. **Recovery** - Restore from backups
5. **Lessons Learned** - Post-mortem analysis

### Emergency Contacts
- **Security Team**: security@hamiktzoan.com
- **DevOps**: devops@hamiktzoan.com
- **Legal**: legal@hamiktzoan.com

## 📈 מדדי אבטחה (Security Metrics)

### Key Performance Indicators
- **Mean Time to Detect (MTTD)**: < 5 minutes
- **Mean Time to Respond (MTTR)**: < 15 minutes
- **Security Incident Rate**: < 0.1 per month
- **False Positive Rate**: < 5%

### Compliance Metrics
- **GDPR Compliance**: 100%
- **ISO 27001**: In progress
- **SOC 2**: Planned for Q2 2024

## 🔧 הגדרות אבטחה מומלצות

### Production Environment
```env
# Security settings
NODE_ENV=production
FORCE_HTTPS=true
SECURE_COOKIES=true
HSTS_MAX_AGE=31536000

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Logging
LOG_LEVEL=warn
AUDIT_LOG_ENABLED=true
ERROR_REPORTING_ENABLED=true
```

### Development Environment
```env
# Relaxed settings for development
NODE_ENV=development
SECURE_COOKIES=false
RATE_LIMIT_ENABLED=false
LOG_LEVEL=debug
```

## 📚 מקורות נוספים

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Firebase Security Rules](https://firebase.google.com/docs/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 🚨 דיווח על פגיעויות

אם מצאת פגיעות אבטחה, אנא דווח באופן אחראי:

1. **אל תפרסם** את הפגיעות בפומבי
2. **שלח אימייל** ל-security@hamiktzoan.com
3. **כלול פרטים** על הפגיעות ודרך שחזורה
4. **קבל הכרה** על הדיווח האחראי

---

*מסמך זה מתעדכן באופן קבוע. גרסה אחרונה: נובמבר 2024*