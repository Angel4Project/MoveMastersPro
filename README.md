<div align="center">
<img width="1200" height="475" alt="המקצוען - מערכת לידים מתקדמת" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# המקצוען - מערכת CRM לידים מתקדמת 🚛

[![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](https://move-master-pro.vercel.app)
[![Security](https://img.shields.io/badge/Security-Enterprise-blue.svg)](SECURITY.md)
[![Performance](https://img.shields.io/badge/Performance-Optimized-orange.svg)](PERFORMANCE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6+-646cff.svg)](https://vitejs.dev/)

מערכת CRM מתקדמת לניהול לידים עם AI, אבטחה ברמה ארגונית, וביצועים מותאמים לייצור. כוללת ממשק ניהול מתקדם, ניתוח AI אוטומטי, והתראות בזמן אמת.

## ✨ תכונות עיקריות

### 🤖 AI & אנליטיקה
- **ניתוח AI אוטומטי** - סיווג לידים לפי דחיפות וסנטימנט באמצעות Gemini AI
- **למידת מכונה** - שיפור אוטומטי של סיווג הלידים עם הזמן
- **תובנות מתקדמות** - דוחות וסטטיסטיקות בזמן אמת

### 🔒 אבטחה ארגונית
- **הצפנת נתונים** - הצפנה מקצה לקצה לכל הנתונים
- **אימות משתמשים** - Firebase Auth עם MFA
- **הגנה מפני התקפות** - CSRF, XSS, SQL injection protection
- **ניהול הרשאות** - Role-based access control

### ⚡ ביצועים מותאמים
- **טעינה מיידית** - Code splitting ו-lazy loading
- **שמירה במטמון** - Service Worker עם אסטרטגיות caching מתקדמות
- **PWA** - Progressive Web App עם תמיכה offline
- **CDN** - אופטימיזציה למשלוח תכנים מהיר

### 📊 ניהול לידים
- **ממשק ניהול מתקדם** - דאשבורד עם סטטיסטיקות בזמן אמת
- **מיון וסינון** - אפשרויות סינון מתקדמות
- **מעקב סטטוס** - ניהול מחזור חיי הליד מהתחלה עד סגירה
- **ייצוא נתונים** - אפשרות ייצוא ל-Excel ו-PDF

### 📱 תקשורת רב ערוצית
- **Telegram Bot** - התראות מיידיות עם כפתורי פעולה
- **WhatsApp Business** - שילוב עם WhatsApp Business API
- **EmailJS** - תבניות אימייל מותאמות אישית
- **Google Sheets** - גיבוי אוטומטי ל-Google Sheets

## 🚀 התחלה מהירה

### דרישות מקדימות

- **Node.js** 18+ ([הורד כאן](https://nodejs.org/))
- **npm** או **yarn**
- חשבון **Firebase** ([יצירת פרויקט](https://console.firebase.google.com/))
- מפתח **Gemini AI** ([Google AI Studio](https://aistudio.google.com/))
- חשבון **Vercel** (לפריסה)

### התקנה

1. **שכפל את הפרויקט**
   ```bash
   git clone https://github.com/your-username/move-masters-pro.git
   cd move-masters-pro
   ```

2. **התקן תלויות**
   ```bash
   npm install
   ```

3. **הגדר משתני סביבה**
   ```bash
   cp .env.example .env.local
   ```

   ערוך את `.env.local` והכנס את המפתחות שלך:
   ```env
   # AI Services
   GEMINI_API_KEY=your_gemini_api_key_here

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id

   # וכן הלאה...
   ```

4. **הפעל את השרת המקומי**
   ```bash
   npm run dev
   ```

5. **פתח את הדפדפן**
   ```
   http://localhost:3000
   ```

## 📋 הגדרת שירותים חיצוניים

### Firebase Setup
1. צור פרויקט חדש ב-[Firebase Console](https://console.firebase.google.com/)
2. הפעל Authentication ו-Firestore
3. צור Web App והעתק את התצורה

### Gemini AI Setup
1. עבור ל-[Google AI Studio](https://aistudio.google.com/)
2. צור API Key חדש
3. הוסף ל-`.env.local`

### Telegram Bot Setup
1. פנה ל-[@BotFather](https://t.me/botfather) בטלגרם
2. צור בוט חדש וקבל טוקן
3. הוסף ל-`.env.local`

### Google Sheets Integration
1. צור Service Account ב-Google Cloud Console
2. הפעל Google Sheets API
3. הורד את ה-JSON key והמר ל-env variables

## 🏗️ ארכיטקטורה

```
├── 📁 components/          # רכיבי React
│   ├── ErrorBoundary.tsx   # טיפול בשגיאות
│   ├── LeadSystem.tsx      # מערכת הלידים הראשית
│   └── ...
├── 📁 services/            # שירותים ושכבות עסקיות
│   ├── configService.ts    # ניהול תצורה מאובטח
│   ├── validationService.ts # אימות וסינון קלט
│   ├── rateLimitService.ts # הגבלת קצב בקשות
│   └── cacheService.ts     # שמירה במטמון
├── 📁 pages/               # דפי האפליקציה
├── 📁 context/             # React Context providers
├── 📁 public/              # קבצים סטטיים
│   ├── sw.js              # Service Worker
│   └── manifest.json      # PWA manifest
└── 📁 app/api/            # API routes (Vercel)
```

## 🔧 פקודות npm

```bash
# פיתוח
npm run dev              # הפעלת שרת פיתוח
npm run build           # בנייה לייצור
npm run preview         # תצוגה מקדימה של הבנייה

# איכות קוד
npm run lint            # בדיקת קוד
npm run lint:fix        # תיקון אוטומטי של שגיאות
npm run type-check      # בדיקת TypeScript

# בדיקות
npm run test            # הרצת בדיקות
npm run test:ui         # ממשק בדיקות ויזואלי
npm run test:run        # הרצת בדיקות חד פעמית

# CI/CD
npm run ci              # בדיקות CI מלאות
```

## 🚀 פריסה

### Vercel (מומלץ)

1. **חבר ל-GitHub**
   ```bash
   # Vercel CLI
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **הגדר משתני סביבה** ב-Vercel Dashboard

3. **פריסה אוטומטית** - כל push ל-main מפריס אוטומטית

### אפשרויות פריסה נוספות

- **Netlify**: `npm run build && netlify deploy --prod --dir=dist`
- **Railway**: חיבור ישיר ל-GitHub
- **Docker**: `docker build -t move-masters . && docker run -p 3000:3000 move-masters`

## 🔒 אבטחה

### אמצעי אבטחה מיושמים

- ✅ **הצפנת נתונים** - TLS 1.3, הצפנה ב-transit וב-rest
- ✅ **אימות משתמשים** - Firebase Auth עם תמיכה ב-MFA
- ✅ **הגנה מפני התקפות** - Helmet.js, CORS, Rate limiting
- ✅ **סינון קלט** - Sanitization של כל קלט מהמשתמש
- ✅ **ניהול סודות** - משתני סביבה מוצפנים
- ✅ **ביקורת** - לוגים מפורטים לכל פעולה

### הגדרות אבטחה

ראה [SECURITY.md](SECURITY.md) לתיעוד אבטחה מלא.

## 📈 ביצועים

### מדדי ביצועים

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 200KB (gzip)

### אופטימיזציות

- ⚡ **Code Splitting** - lazy loading של רכיבים
- 📦 **Tree Shaking** - הסרת קוד לא בשימוש
- 🗜️ **Compression** - Gzip/Brotli
- 🚀 **Caching** - Service Worker + HTTP caching
- 📱 **PWA** - תמיכה offline

ראה [PERFORMANCE.md](PERFORMANCE.md) לפרטים נוספים.

## 🧪 בדיקות

```bash
# הרצת כל הבדיקות
npm run ci

# בדיקות יחידה
npm run test:unit

# בדיקות אינטגרציה
npm run test:integration

# בדיקות E2E
npm run test:e2e

# בדיקות עומס
npm run test:load
```

## 📚 תיעוד

- [🚀 מדריך פריסה](DEPLOYMENT_GUIDE.md)
- [🔒 מדריך אבטחה](SECURITY.md)
- [📈 מדריך ביצועים](PERFORMANCE.md)
- [🧪 מדריך בדיקות](TESTING.md)
- [📖 API Documentation](API.md)

## 🤝 תרומה

אנו מקבלים בברכה תרומות! ראה [CONTRIBUTING.md](CONTRIBUTING.md) להנחיות.

### תהליך תרומה

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit שינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## 📄 רישיון

פרויקט זה מוגן ברישיון MIT. ראה [LICENSE](LICENSE) לפרטים.

## 📞 תמיכה

- 📧 **אימייל**: support@hamiktzoan.com
- 💬 **טלגרם**: [@hamiktzoan_support](https://t.me/hamiktzoan_support)
- 📱 **וואטסאפ**: [+972-50-535-0148](https://wa.me/972505350148)

## 🙏 תודות

- **Google** - עבור Gemini AI
- **Firebase** - עבור Backend as a Service
- **Vercel** - עבור פלטפורמת הפריסה
- **React** - עבור ספריית ה-UI
- **Vite** - עבור כלי הבנייה המהיר

---

<div align="center">
  <p>בנוי עם ❤️ בישראל</p>
  <p>
    <a href="https://move-master-pro.vercel.app">🌐 אתר חי</a> •
    <a href="https://github.com/your-username/move-masters-pro">📦 GitHub</a> •
    <a href="https://vercel.com/your-username/move-masters-pro">🚀 Vercel</a>
  </p>
</div>
