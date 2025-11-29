import React, { useState, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Truck, MessageCircle, MapPin, Clock, Phone, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { COMPANY_INFO } from './types';



// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Contact = React.lazy(() => import('./pages/Contact'));
const About = React.lazy(() => import('./pages/About'));
const Store = React.lazy(() => import('./pages/Store'));
const Blog = React.lazy(() => import('./pages/Blog'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

import ChatBot from './components/ChatBot';
import Header from './components/Header';
import AdminStatusBanner from './components/AdminStatusBanner';
import Accessibility from './components/Accessibility';
import CookiesBanner from './components/CookiesBanner';
import WelcomeModal from './components/WelcomeModal';
import SEOHead from './components/SEOHead';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatBotProvider, useChatBot } from './context/ChatBotContext';
import { googleSheetsService } from './services/googleSheetsService';
import { emailService } from './services/emailService';
import { whatsappService } from './services/whatsappService';
import { configService } from './services/configService';

const LoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white z-50">
    <div className="relative mb-4">
        <div className="w-20 h-20 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <Truck size={24} className="text-blue-400/50" />
        </div>
    </div>
    <div className="text-blue-400 font-bold animate-pulse tracking-widest text-sm uppercase">טוען נתונים...</div>
  </div>
);



const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      name: 'Facebook',
      icon: ExternalLink,
      url: 'https://facebook.com/hamiktzoan',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: ExternalLink,
      url: 'https://instagram.com/hamiktzoan',
      color: 'hover:text-pink-400'
    },
    {
      name: 'Twitter',
      icon: ExternalLink,
      url: 'https://twitter.com/hamiktzoan',
      color: 'hover:text-sky-400'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/972${COMPANY_INFO.phone.replace(/-/g, '').substring(1)}`,
      color: 'hover:text-green-400'
    }
  ];

  const quickLinks = [
    { path: '/about', label: 'אודות' },
    { path: '/store', label: 'חנות אריזה' },
    { path: '/quote', label: 'מחשבון מחירים' },
    { path: '/blog', label: 'בלוג' },
    { path: '/admin', label: 'כניסת מנהלים' }
  ];

  const services = [
    'הובלת דירות',
    'הובלת משרדים',
    'אריזה ופריקה',
    'שירותי מנוף',
    'אחסון זמני',
    'הובלה בין-לאומית'
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-8 text-slate-300 overflow-hidden border-t border-white/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Gradient Lines */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="text-white" size={24} />
                </div>
                <h3 className="text-3xl font-black">
                  <span className="text-white">ה</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">מקצוען</span>
                </h3>
              </div>
              
              <p className="mb-6 leading-relaxed text-slate-400/90 text-sm">
                חברת ההובלות המובילה בישראל. בבעלות דדי. 
                שירותי אריזה, הובלה ואחסנה בסטנדרטים בינלאומיים עם טכנולוגיה מתקדמת.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="p-2 bg-slate-800/50 rounded-lg border border-white/5">
                    <MapPin size={16} className="text-blue-400" /> 
                  </div>
                  <span>{COMPANY_INFO.address}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="p-2 bg-slate-800/50 rounded-lg border border-white/5">
                    <Clock size={16} className="text-blue-400" /> 
                  </div>
                  <span>זמין 24/7 לשירותכם</span>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3 bg-slate-800/50 rounded-xl border border-white/5 transition-all duration-300 ${social.color} hover:border-white/10 hover:bg-slate-700/50`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-white font-bold mb-6 text-xl relative inline-block">
                ניווט מהיר
                <div className="absolute -bottom-2 right-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li 
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link 
                      to={link.path} 
                      className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all duration-300 hover:translate-x-2 group"
                    >
                      <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Services */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-white font-bold mb-6 text-xl relative inline-block">
                השירותים שלנו
                <div className="absolute -bottom-2 right-0 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <motion.li 
                    key={service}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 hover:translate-x-2 group cursor-default">
                      <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="text-sm">{service}</span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-white font-bold mb-6 text-xl relative inline-block">
                צור קשר
                <div className="absolute -bottom-2 right-0 w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"></div>
              </h4>
              
              <div className="space-y-4">
                <motion.div 
                  className="group"
                  whileHover={{ scale: 1.02 }}
                >
                  <a 
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5 group-hover:border-green-500/30 transition-all duration-300 hover:bg-slate-700/30"
                  >
                    <div className="p-2 bg-slate-700/50 rounded-lg border border-white/5 group-hover:border-green-500/50 transition">
                      <Phone size={18} className="text-green-400" /> 
                    </div>
                    <div>
                      <div className="text-white font-semibold">{COMPANY_INFO.phone}</div>
                      <div className="text-xs text-slate-400">זמין 24/7</div>
                    </div>
                  </a>
                </motion.div>

                <motion.div 
                  className="group"
                  whileHover={{ scale: 1.02 }}
                >
                  <a 
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl border border-white/5 group-hover:border-blue-500/30 transition-all duration-300 hover:bg-slate-700/30"
                  >
                    <div className="p-2 bg-slate-700/50 rounded-lg border border-white/5 group-hover:border-blue-500/50 transition">
                      <Mail size={18} className="text-blue-400" /> 
                    </div>
                    <div>
                      <div className="text-white font-semibold">{COMPANY_INFO.email}</div>
                      <div className="text-xs text-slate-400">שלח הודעה</div>
                    </div>
                  </a>
                </motion.div>

                {/* WhatsApp Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <a 
                    href={`https://wa.me/972${COMPANY_INFO.phone.replace(/-/g, '').substring(1)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full p-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300"
                  >
                    <MessageCircle size={18} />
                    <span>צ'אט בוואטסאפ</span>
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          className="max-w-4xl mx-auto px-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
            <h3 className="text-2xl font-bold mb-4">הישאר מעודכן</h3>
            <p className="text-slate-400 mb-6">קבל טיפים, מבצעים והודעות על שירותי ההובלות שלנו</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="הכנס את כתובת האימייל שלך"
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
              >
                הרשם
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">אנו מכבדים את הפרטיות שלך ולא נשתף את המידע עם צדדים שלישיים.</p>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          className="border-t border-white/5 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-500">
                © {currentYear} הובלות המקצוען - דדי. כל הזכויות שמורות.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                בנוי עם ❤️ בישראל
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">פותח על ידי</span>
              <motion.a 
                href="https://Angel0S-WEB.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-white/5 hover:border-blue-500/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-blue-300 group-hover:to-cyan-300 transition-all duration-300">
                  Angel0S-WEB
                </span>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

const AppContent: React.FC = () => {
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isOpen: isChatbotOpen, toggleChatBot } = useChatBot();

  // Initialize external services
  React.useEffect(() => {
    try {
      // Validate configuration before initializing services
      if (!configService.isValid()) {
        console.error('Configuration validation failed:', configService.getValidationErrors());
        return;
      }

      // Initialize services with centralized config
      googleSheetsService.initialize();
      emailService.initialize();
      whatsappService.initialize();

      console.log('All services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }

    // Analytics service is auto-initialized
  }, []);

  return (
    <div dir="rtl" className={`min-h-screen bg-slate-900 ${isLargeFont ? 'text-xl' : 'text-base'} ${isHighContrast ? 'contrast-125 brightness-110' : ''} ${isAuthenticated ? 'admin-authenticated' : ''} selection:bg-blue-500 selection:text-white font-sans`}>
      <Router>
        <AdminStatusBanner />
        <Header isAuthenticated={isAuthenticated} />
        <WelcomeModal />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
              <Route path="/" element={
                <div className="admin-content-padding">
                  <SEOHead
                    title="הובלות המקצוען - שירותי הובלה מקצועיים"
                    description="חברת הובלות המקצוען - שירותי אריזה, הובלה ואחסנה בסטנדרטים בינלאומיים. צי מתקדם, צוות מקצועי וטכנולוגיה חכמה להובלות בטוחות ומהירות."
                    keywords={['הובלות', 'אריזה', 'העברות', 'משרדים', 'דירות', 'מקצועי', 'ישראל', 'דדי']}
                  />
                  <Home />
                </div>
              } />
              <Route path="/quote" element={
                <div className="admin-content-padding">
                  <SEOHead
                    title="הזמנת הצעת מחיר - הובלות המקצוען"
                    description="קבל הצעת מחיר מיידית להובלת דירה או משרד. חישוב מדויק לפי מיקום, גודל ודרישות מיוחדות."
                    keywords={['הצעת מחיר', 'הובלות', 'מחירון', 'חישוב', 'דדי']}
                  />
                  <Contact />
                </div>
              } />
              <Route path="/store" element={
                <div className="admin-content-padding">
                  <SEOHead
                    title="חנות הציוד - הובלות המקצוען"
                    description="חנות מקוונת לציוד אריזה והובלה. קרטונים, סרטי דבק, פצפץ וכל הציוד המקצועי להובלה בטוחה."
                    keywords={['חנות', 'ציוד', 'אריזה', 'קרטונים', 'פצפץ', 'סרט דבק']}
                  />
                  <Store />
                </div>
              } />
              <Route path="/about" element={
                <div className="admin-content-padding">
                  <SEOHead
                    title="אודותינו - הובלות המקצוען"
                    description="הכר את צוות הובלות המקצוען. למעלה מ-15 שנות ניסיון, צי מתקדם וטכנולוגיה חכמה להובלות ברמה הגבוהה ביותר."
                    keywords={['אודות', 'צוות', 'דדי', 'ניסיון', 'מקצועי', 'הובלות']}
                  />
                  <About />
                </div>
              } />
              <Route path="/blog" element={
                <div className="admin-content-padding">
                  <SEOHead
                    title="בלוג הובלות - טיפים ומדריכים מקצועיים"
                    description="בלוג הובלות המקצוען - מדריכים, טיפים ועצות להובלה מוצלחת. כל מה שצריך לדעת לפני, במהלך ואחרי המעבר."
                    keywords={['בלוג', 'טיפים', 'מדריכים', 'הובלות', 'אריזה', 'מעבר']}
                  />
                  <Blog />
                </div>
              } />
              <Route path="/admin" element={
                <div className="admin-content-padding">
                  <SEOHead
                    title="פאנל ניהול - הובלות המקצוען"
                    description="פאנל ניהול מתקדם לניהול לידים, שיחות צ'אט, מלאי וסטטיסטיקות."
                    keywords={['ניהול', 'פאנל', 'לידים', 'CRM', 'סטטיסטיקות']}
                  />
                  <AdminPanel />
                </div>
              } />
          </Routes>
        </Suspense>

        <Footer />
        <ChatBot
          isOpen={isChatbotOpen}
          onToggle={toggleChatBot}
        />
        <Accessibility
          isHighContrast={isHighContrast}
          isLargeFont={isLargeFont}
          onToggleContrast={() => setIsHighContrast(!isHighContrast)}
          onToggleFontSize={() => setIsLargeFont(!isLargeFont)}
        />
        <CookiesBanner />
      </Router>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatBotProvider>
          <AppContent />
        </ChatBotProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;