
import { Lead, Product, BlogPost, AppSettings, Testimonial, Campaign } from '../types';

const KEYS = {
  LEADS: 'hamiktzoan_leads',
  PRODUCTS: 'hamiktzoan_products',
  BLOG: 'hamiktzoan_blog',
  SETTINGS: 'hamiktzoan_settings',
  REVIEWS: 'hamiktzoan_reviews',
  AUTH: 'hamiktzoan_auth',
  CAMPAIGNS: 'hamiktzoan_campaigns'
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
        title: 'Building Digital Empires',
        content: 'בעולם החדש, העסק שלך חייב נוכחות דיגיטלית עוצמתית. Angel4Project בונים מפלצות דיגיטליות שמשנות את חוקי המשחק.\n\nצור קשר: Angel4Project@gmail.com',
        author: 'Angel4Project',
        date: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        pinned: true,
        tags: ['טכנולוגיה', 'עסקים']
      },
      {
        id: '2',
        title: 'איך אורזים מטבח?',
        content: 'המטבח הוא החדר המורכב ביותר. השתמשו בקרטונים דו-גליים, עטפו כל כוס בנפרד, ומלאו חללים במגבות.',
        author: 'דדי',
        date: new Date(Date.now() - 86400000).toISOString(),
        image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
        tags: ['טיפים']
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
  saveLead: (lead: Lead) => {
    const leads = StorageService.getLeads();
    localStorage.setItem(KEYS.LEADS, JSON.stringify([lead, ...leads]));
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

  getVisits: () => Array.from({ length: 7 }, (_, i) => ({ day: `יום ${i + 1}`, visits: Math.floor(Math.random() * 100) + 20 }))
};
