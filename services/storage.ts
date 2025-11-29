
import { Lead, Product, BlogPost, AppSettings, Testimonial, Campaign, ChatConversation } from '../types';
import { googleSheetsService } from './googleSheetsService';
import { emailService } from './emailService';
import { whatsappService } from './whatsappService';

const KEYS = {
  LEADS: 'hamiktzoan_leads',
  PRODUCTS: 'hamiktzoan_products',
  BLOG: 'hamiktzoan_blog',
  SETTINGS: 'hamiktzoan_settings',
  REVIEWS: 'hamiktzoan_reviews',
  AUTH: 'hamiktzoan_auth',
  CAMPAIGNS: 'hamiktzoan_campaigns',
  CHAT_CONVERSATIONS: 'hamiktzoan_chat_conversations'
};

const seedData = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    const initialProducts: Product[] = [
      { id: '1', name: 'סט מעבר דירה 2-3 חדרים', price: 299, image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=500', description: '30 קרטונים, 2 סרטי דבק, 1 פצפץ ענק', category: 'kits' },
      { id: '2', name: 'סט מעבר דירה 4-5 חדרים', price: 499, image: 'https://images.unsplash.com/photo-1606674718501-c81729052b6d?w=500', description: '60 קרטונים, 4 סרטי דבק, 2 פצפץ ענק, טוש סימון', category: 'kits' },
      { id: '3', name: 'גליל פצפץ דו-שכבתי', price: 45, image: 'https://images.unsplash.com/photo-1595856976664-42994025a17e?w=500', description: '50 מטר אורך, רוחב 50 ס"מ', category: 'protection' },
      { id: '4', name: 'סרט דבק אקרילי', price: 12, image: 'https://images.unsplash.com/photo-1616401776146-2796dc638686?w=500', description: 'הדבקה חזקה ושקטה', category: 'tools' },
      { id: '5', name: 'קרטון חד-גלי', price: 6, image: 'https://images.unsplash.com/photo-1589366479708-4d56d5668d27?w=500', description: '40x40x60 לבגדים', category: 'boxes' },
    ];
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }

  if (!localStorage.getItem(KEYS.BLOG)) {
    const initialBlog: BlogPost[] = [
      {
        id: '1',
        title: 'איך להתכונן למעבר דירה בצורה מקצועית',
        content: `המדריך המלא למעבר דירה מוצלח - מה חשוב לדעת ואיך להתכונן?

🎯 **תכנון מוקדם - המפתח להצלחה**
• התחל לתכנן לפחות 4 שבועות מראש
• צור רשימה של כל הפריטים שצריך להעביר
• תאם תיאום עם בעלי הדירות הישנה והחדשה

📦 **אריזה חכמה ויעילה**
• השתמש בקרטונים איכותיים ובגודל הנכון
• סמן כל קרטון בצבע שונה לפי החדר
• ארוז חפצים שברירים בנייר עיתון וקצף

⏰ **היום הגדול**
• התחל מוקדם בבוקר (7:00-8:00)
• שמור על רשימת בדיקה לפני עזיבת הדירה
• וודא שיש מספיק עזרה בפריקה

**💡 טיפ מקצועי מדדי:** "הכנה טובה חוסכת זמן, כסף ועצבים!"`,
        author: 'דדי',
        date: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800',
        pinned: true,
        tags: ['מדריך', 'הכנה', 'תכנון'],
        readTime: '5 דקות'
      },
      {
        id: '2',
        title: 'הטיפים הטובים ביותר לאריזת חפצים שברירים',
        content: `איך מונעים נזקים לחפצים יקרים ועדינים?

🛡️ **חפצי זכוכית וקרמיקה**
• עטוף כל פריט בנייר עיתון או נייר צלולן
• השתמש בקופסאות מיוחדות עם חלוקים
• סמן בבירור "שברירי" ו"למעלה"

📱 **אלקטרוניקה וטכנולוגיה**
• צלם את חיבורי הכבלים לפני פירוק
• ארוז בקופסאות מקור עם חומר דחוס
• הסר סוללות וכרטיסי זיכרון

🖼️ **תמונות ומסגרות**
• השתמש בקרטון מיוחד למסגרות
• הוסף "למעלה" ו"שברירי" בכמה מקומות
• אל תמלא יותר מדי חפצים בקרטון אחד

**זכרו:** השקעה באריזה איכותית היא השקעה בשקט נפשי!`,
        author: 'דדי',
        date: new Date(Date.now() - 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        tags: ['אריזה', 'שברירים', 'אבטחה'],
        readTime: '4 דקות'
      },
      {
        id: '3',
        title: 'מתי כדאי להשתמש בשירותי מנוף?',
        content: `מנוף יכול להיות הפתרון המושלם במצבים מסוימים

🏗️ **מתי מנוף הוא הכרחי?**
• דירות בקומות גבוהות מאוד (מעל קומה 5)
• מדרגים צרים או גרמי מדרגים לא מתאימים
• פריטים גדולים מאוד (פסנתר, כספת)
• בניינים ללא מעלית

💰 **עלות מול תועלת**
• מנוף חוסך זמן ומפחית סיכון לנזקים
• העלות משתנה לפי גובה, משקל ומרחק
• לעיתים זה הפתרון הזול ביותר בטווח הארוך

⚡ **תהליך הזמנת מנוף**
1. הזמן מראש - לפחות 48 שעות
2. בדוק תנאי הכניסה למבנה
3. וודא היתרים מהעירייה (במידת הצורך)
4. תאם עם שכנים למניעת חסימות

**המלצת המומחה:** "אל תחסוך על בטיחות - מנוף מקצועי שווה כל שקל!"`,
        author: 'דדי',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        tags: ['מנוף', 'בטיחות', 'קומות גבוהות'],
        readTime: '6 דקות'
      },
      {
        id: '4',
        title: 'הובלת משרד - המדריך המלא',
        content: `איך מעבירים משרד בלי לפגוע בפעילות העסקית?

🕒 **תכנון לפי לוח זמנים**
• תכנן המעבר בסוף השבוע או בערב
• הכן רשימת עדיפויות של ציוד קריטי
• תאם עם ספקי האינטרנט והטלפוניה מראש

💻 **ציוד טכנולוגי**
• גבה את כל הנתונים לפני המעבר
• צלם את חיבורי הכבלים
• ארוז מחשבים ניידים בקפידה
• הכן תוכנית גיבוי חירום

📋 **צוות ותאום**
• מנה פגישת תכנון עם כל המחלקות
• הגדר אחריות לכל אחד מהצוות
• הכן רשימת בדיקה לכל תחנה
• תאם עם חברת ההובלות את סדר הפריקה

🏢 **הכנת המשרד החדש**
• נקה ווודא שכל המתקנים עובדים
• סמן מקומות לכל פריט
• הכן חשמל ואינטרנט לפני ההעברה

**סוד מקצועי:** הזמן הכי טוב למעבר משרד הוא יום חמישי בערב!`,
        author: 'דדי',
        date: new Date(Date.now() - 3 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        tags: ['משרד', 'עסקים', 'תכנון'],
        readTime: '7 דקות'
      },
      {
        id: '5',
        title: 'איך חוסכים בעלויות ההובלה?',
        content: `טיפים מוכחים לחיסכון בכסף בלי לפגוע באיכות

💡 **תכנון חכם**
• השווה מחירים מ-3 חברות שונות
• הזמן בימי חול ולא בסופ"ש
• קבץ כמה משפחות להובלה משותפת

📦 **הכנה עצמית**
• פרק רהיטים שניתנים לפירוק
• ארוז חפצים קטנים בעצמך
• נקה ומיין לפני ההובלה

🎯 **בחירת החברה הנכונה**
• בדוק המלצות וביקורות
• וודא שיש ביטוח לכל החפצים
• קרא את החוזה בקפידה
• הימנע מ"מחירים נמוכים מדי"

💰 **טריקים מקצועיים**
• הובל בסוף החודש (מחירים נמוכים יותר)
• הצע תשלום במזומן להנחה
• הזמן מראש וקבל הנחת "הזמנה מוקדמת"

**עצה זהב:** "הכי זול לא תמיד הכי טוב - איכות שווה יותר מכסף!"`,
        author: 'דדי',
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
        tags: ['חיסכון', 'עלויות', 'תכנון'],
        readTime: '5 דקות'
      },
      {
        id: '6',
        title: 'הביטוח שלכם - מה חשוב לדעת?',
        content: `כל מה שצריך לדעת על ביטוח הובלה מקצועי

🛡️ **סוגי הביטוח הקיימים**
• ביטוח בסיסי - כלול במחיר ההובלה
• ביטוח מורחב - עלות נוספת, כיסוי רחב יותר
• ביטוח יקר ערך - לפריטים מיוחדים

📋 **מה מכוסה ומה לא**
✓ נזקים מתאונות ונפילות
✓ שברים וקריעות
✓ אובדן חפצים
✗ נזקים קוסמטיים קלים
✗ פריטים שלא ארוזו כראוי
✗ פריטים יקרי ערך ללא הצהרה

💰 **איך מחשבים את הביטוח**
• לפי ערך הפריטים המועברים
• אחוז מהערך הכולל (בדרך כלל 1-3%)
• תמיד לשאול על מחיר מדויק

⚠️ **טעויות נפוצות**
• לא להצהיר על ערך אמיתי
• לא לתעד מצב חפצים לפני ההובלה
• לא לקרוא את התנאים

**זכרו:** ביטוח טוב הוא שקט נפשי - לא מקום לחסכון!`,
        author: 'דדי',
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        tags: ['ביטוח', 'הגנה', 'בטיחות'],
        readTime: '6 דקות'
      },
      {
        id: '7',
        title: 'הכנת המטבח למעבר - המדריך השלם',
        content: `המטבח הוא החדר הכי מורכב להעברה - הנה איך עושים את זה נכון

🍽️ **פריטים לא ארוזים (עד היום האחרון)**
• מזון מיובש וקפוא
• כלים שבשימוש יומיומי
• ספרי בישול וציוד חשוב

🔪 **אריזת כלים חדים ומסוכנים**
• עטוף להבים בנייר עבה
• ארוז בקופסאות נפרדות
• סמן "חד" ו"זהירות"
• העבר במכונית אישית אם אפשר

🍶 **כלי זכוכית וקרמיקה**
• ארוז כוסות אחת לכל תא
• קרקיש עם נייר או קצף
• אל תמלא קרטון יותר מדי
• סמן "שברירי" בכמה מקומות

⚡ **מכשירי חשמל**
• נתק מהחשמל 24 שעות מראש
• נקה וייבש היטב
• ארוז בקופסאות מקוריות
• צלם חיבורים לפני ניתוק

🏠 **הכנת המטבח החדש**
• נקה לפני כניסת הכלים
• בדוק תקינות החשמל והמים
• הכן תוכנית סידור לפני ההגעה

**סוד השף:** "מטבח מאורגן הוא מטבח מאושר!"`,
        author: 'דדי',
        date: new Date(Date.now() - 6 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        tags: ['מטבח', 'כלים', 'אריזה'],
        readTime: '8 דקות'
      },
      {
        id: '8',
        title: 'מה עושים עם חיות מחמד במהלך המעבר?',
        content: `הפתרונות הטובים ביותר לרגישות הרבה של בעלי החיים

🐕🐱 **הכנה מוקדמת**
• קבע מקום מסוים עבור החיית מחמד ביום המעבר
• הכן מזון, מים וציוד נדרש ל-24 שעות
• שמור על שגרת האכלה רגילה

🏥 **אפשרויות השמירה**
• חבר משפחה או חבר שיכול לשמור
• פנסיון מקצועי לבעלי חיים
• השארה בבית עם ביקור מידי כמה שעות

💊 **חרדה ולחץ**
• שקול להתייעץ עם וטרינר
• פרומונים מרגיעים (טיפות/מתקן)
• משחקים מעסיקים במיוחד
• שמירה על האוכל והמים הרגילים

🚗 **במהלך ההובלה**
• אל תשים בעלי חיים במשאית ההובלה
• נסיעה ארוכה? תכנן עצירות
• הכן מצלמה לצילום המשפחה במקום החדש

❤️ **הגעה למקום החדש**
• הכן אזור בטוח עבור החיית מחמד
• שמור על האוכל והמים הרגילים
• הראה לה את הבית בהדרגה

**זכרו:** חיות מחמד חשות במתח שלכם - הישארו רגועים!`,
        author: 'דדי',
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800',
        tags: ['חיות מחמד', 'רגש', 'טיפוח'],
        readTime: '5 דקות'
      },
      {
        id: '9',
        title: 'טיפים למעבר במהלך הקיץ',
        content: `איך להתמודד עם האתגרים המיוחדים של מעבר בעונה החמה

☀️ **התמודדות עם החום**
• התחל מוקדם מאוד בבוקר (6:00)
• הכן מים קרים ונוזלים מספיקים
• שקול לבקש הפסקות נוספות
• הגן על חפצים רגישים לחום

🌡️ **חפצים רגישים לטמפרטורה**
• מכשירי אלקטרוניקה - העבר במכונית ממוזגת
• תרופות וקוסמטיקה - העבר בתיק תרמי
• מזון - ארוז בתימרה או קרטון מיוחד
• צמחים - הגן מפני שמש ישירה

💧 **שמירה על לחות**
• תן עדיפות להובלת ציוד מיוחד
• אל תשאיר חפצים במשאית במשך שעות
• תכנן מסלול עם עצירות קצרות

👕 **בגדים וטקסטיל**
• ארוז בגדים במקומות קרירים
• העבר בגדי חורף בתיקים אטומים
• הכן בגדי קיץ נוחים ליום המעבר

🌟 **יתרונות הקיץ**
• ימים ארוכים יותר לעבודה
• פחות גשם ולחות
• זמינות גבוהה של חברות הובלה
• קל יותר למצוא עזרה

**עצה חמה:** "תכנון נכון הופך מעבר קיץ לחוויה נעימה!"`,
        author: 'דדי',
        date: new Date(Date.now() - 8 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        tags: ['קיץ', 'חום', 'תכנון'],
        readTime: '4 דקות'
      },
      {
        id: '10',
        title: 'בניית אימפריות דיגיטליות',
        content: `בעולם החדש, העסק שלך חייב נוכחות דיגיטלית עוצמתית.
Angel4Project בונים מפלצות דיגיטליות שמשנות את חוקי המשחק.

🚀 **מה זה אומר בשבילך?**
• אתר שעובד 24/7 ומייצר לידים
• מערכות CRM מתקדמות
• שילוב AI לשירות לקוחות
• חוויית משתמש שלא נשכחת

💡 **המהפכה הדיגיטלית כבר כאן**
הזמן של "פשוט להיות טוב" נגמר.
עכשיו צריך להיות גם מקצועי, גם טכנולוגי, גם זמין.

🎯 **המפתח להצלחה**
1. אתר מהיר ומותאם לנייד
2. מערכת ניהול לידים חכמה
3. צ'אטבוט שעובד גם בלילה
4. ניתוח נתונים לשיפור מתמיד

📞 **רוצה לבנות מפלצת דיגיטלית משלך?**
צור קשר עם Angel4Project:
📧 Angel4Project@gmail.com
🌐 Angel0S-WEB.vercel.app

"העתיד שייך למי שמבין טכנולוגיה - בואו נבנה אותו יחד!"`,
        author: 'Angel4Project',
        date: new Date(Date.now() - 9 * 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        pinned: true,
        tags: ['טכנולוגיה', 'עסקים', 'עתיד'],
        readTime: '3 דקות'
      }
    ];
    localStorage.setItem(KEYS.BLOG, JSON.stringify(initialBlog));
  }

  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const defaultSettings: AppSettings = {
      basePrice: 500,
      pricePerKm: 15,
      pricePerRoom: 200,
      pricePerFloor: 50,
      pricePerCbm: 100,
      aiProvider: 'google',
      aiApiKey: '',
      aiModel: 'gemini-2.5-flash'
    };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }

  if (!localStorage.getItem(KEYS.REVIEWS)) {
    const initialReviews: Testimonial[] = [
      { id: '1', name: 'רונית כהן', role: 'לקוחה פרטית', content: 'הצוות של דדי הגיע בדיוק בזמן, תקתקו את האריזה בצורה מקצועית ושמרו על הריהוט כאילו זה שלהם. ממליצה בחום!', rating: 5, image: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: '2', name: 'יוסי לוי', role: 'בעל משרד עו"ד', content: 'העברנו משרד שלם עם ארכיון רגיש. הכל עבר בצורה חלקה, דיסקרטית ומסודרת. שירות VIP אמיתי.', rating: 5, image: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: '3', name: 'משפחת אהרוני', role: 'מעבר לבית פרטי', content: 'המחיר היה הוגן, היחס היה אדיב, והכי חשוב - שום דבר לא נשבר. תודה רבה לכם!', rating: 5, image: 'https://randomuser.me/api/portraits/women/68.jpg' },
    ];
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(initialReviews));
  }

  if (!localStorage.getItem(KEYS.CAMPAIGNS)) {
    const initialCampaigns: Campaign[] = [
        { id: '1', name: 'גוגל חיפוש - הובלות', platform: 'Google', status: 'active', budget: 2000, spent: 1450, clicks: 120, leads: 15 },
        { id: '2', name: 'פייסבוק ריטרגטינג', platform: 'Facebook', status: 'active', budget: 1000, spent: 800, clicks: 350, leads: 8 },
        { id: '3', name: 'אינסטגרם סטורי', platform: 'Instagram', status: 'paused', budget: 500, spent: 120, clicks: 45, leads: 2 },
    ];
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(initialCampaigns));
  }
};

seedData();

export const StorageService = {
  // Leads
  getLeads: (): Lead[] => JSON.parse(localStorage.getItem(KEYS.LEADS) || '[]'),
  saveLead: async (lead: Lead) => {
    const leads = StorageService.getLeads();
    localStorage.setItem(KEYS.LEADS, JSON.stringify([lead, ...leads]));

    // Send notifications
    try {
      await Promise.all([
        emailService.sendLeadNotification(lead),
        whatsappService.sendLeadNotification(lead),
        googleSheetsService.appendLead(lead)
      ]);
    } catch (error) {
      console.error('Failed to send lead notifications:', error);
    }
  },
  updateLead: (id: string, updates: Partial<Lead>) => {
    const leads = StorageService.getLeads().map(l => l.id === id ? { ...l, ...updates } : l);
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },
  deleteLead: (id: string) => {
    const leads = StorageService.getLeads().filter(l => l.id !== id);
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  // Products
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProduct: (product: Product) => {
    const products = StorageService.getProducts();
    // Check if update or new
    const exists = products.find(p => p.id === product.id);
    if (exists) {
        const updated = products.map(p => p.id === product.id ? product : p);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated));
    } else {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify([...products, product]));
    }
  },
  deleteProduct: (id: string) => {
    const products = StorageService.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Blog
  getPosts: (): BlogPost[] => JSON.parse(localStorage.getItem(KEYS.BLOG) || '[]'),
  savePost: (post: BlogPost) => {
    const posts = StorageService.getPosts();
    const exists = posts.find(p => p.id === post.id);
    if (exists) {
        const updated = posts.map(p => p.id === post.id ? post : p);
        localStorage.setItem(KEYS.BLOG, JSON.stringify(updated));
    } else {
        localStorage.setItem(KEYS.BLOG, JSON.stringify([post, ...posts]));
    }
  },
  deletePost: (id: string) => {
    const posts = StorageService.getPosts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.BLOG, JSON.stringify(posts));
  },

  // Reviews
  getReviews: (): Testimonial[] => JSON.parse(localStorage.getItem(KEYS.REVIEWS) || '[]'),

  // Settings
  getSettings: (): AppSettings => JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}'),
  saveSettings: (settings: AppSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),

  // Auth
  getAuth: (): boolean => localStorage.getItem(KEYS.AUTH) === 'true',
  setAuth: (status: boolean) => localStorage.setItem(KEYS.AUTH, status ? 'true' : 'false'),

  // Campaigns
  getCampaigns: (): Campaign[] => JSON.parse(localStorage.getItem(KEYS.CAMPAIGNS) || '[]'),

  // Chat Conversations
  getChatConversations: (): ChatConversation[] => JSON.parse(localStorage.getItem(KEYS.CHAT_CONVERSATIONS) || '[]'),
  saveChatConversation: async (conversation: ChatConversation) => {
    const conversations = StorageService.getChatConversations();
    const exists = conversations.find(c => c.id === conversation.id);
    if (exists) {
      const updated = conversations.map(c => c.id === conversation.id ? conversation : c);
      localStorage.setItem(KEYS.CHAT_CONVERSATIONS, JSON.stringify(updated));
    } else {
      localStorage.setItem(KEYS.CHAT_CONVERSATIONS, JSON.stringify([conversation, ...conversations]));
    }

    // Send notifications for new conversations or when lead is created
    if (!exists || (conversation.leadCreated && !exists.leadCreated)) {
      try {
        await Promise.all([
          emailService.sendChatNotification(conversation),
          whatsappService.sendChatNotification(conversation),
          googleSheetsService.appendChatConversation(conversation)
        ]);
      } catch (error) {
        console.error('Failed to send chat notifications:', error);
      }
    }
  },
  updateChatConversation: (id: string, updates: Partial<ChatConversation>) => {
    const conversations = StorageService.getChatConversations().map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    localStorage.setItem(KEYS.CHAT_CONVERSATIONS, JSON.stringify(conversations));
  },
  deleteChatConversation: (id: string) => {
    const conversations = StorageService.getChatConversations().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CHAT_CONVERSATIONS, JSON.stringify(conversations));
  },

  // Contact Forms
  saveContactForm: async (name: string, phone: string, email: string, message: string) => {
    const contactForm = {
      id: Date.now().toString(),
      name,
      phone,
      email,
      message,
      timestamp: Date.now()
    };

    // Save to local storage (optional)
    const forms = JSON.parse(localStorage.getItem('hamiktzoan_contact_forms') || '[]');
    localStorage.setItem('hamiktzoan_contact_forms', JSON.stringify([contactForm, ...forms]));

    // Send notifications
    try {
      await Promise.all([
        emailService.sendContactFormNotification(name, phone, email, message),
        whatsappService.sendContactFormNotification(name, phone, email, message),
        googleSheetsService.appendContactForm(name, phone, email, message)
      ]);
    } catch (error) {
      console.error('Failed to send contact form notifications:', error);
    }
  },

  getVisits: () => Array.from({ length: 7 }, (_, i) => ({ day: `יום ${i + 1}`, visits: Math.floor(Math.random() * 100) + 20 }))
};
