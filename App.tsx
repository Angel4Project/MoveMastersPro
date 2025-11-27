import React, { useState, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Truck, Mail, MapPin, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANY_INFO } from './types';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Contact = React.lazy(() => import('./pages/Contact'));
const About = React.lazy(() => import('./pages/About'));
const Store = React.lazy(() => import('./pages/Store'));
const Blog = React.lazy(() => import('./pages/Blog'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

import ChatBot from './components/ChatBot';
import Accessibility from './components/Accessibility';
import CookiesBanner from './components/CookiesBanner';
import WelcomeModal from './components/WelcomeModal';
import { AuthProvider, useAuth } from './context/AuthContext';

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

const AdminBar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-between px-4 text-xs font-bold text-white border-b border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]" />
        <span className="tracking-wider">מצב מנהל מערכת פעיל</span>
      </div>
      <div className="flex gap-4">
        <button onClick={() => navigate('/admin')} className="hover:text-red-300 transition">פאנל ניהול</button>
        <button onClick={() => logout()} className="hover:text-red-300 transition">התנתק</button>
      </div>
    </div>
  );
};

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const links = [
    { path: '/', label: 'בית' },
    { path: '/quote', label: 'הצעת מחיר' },
    { path: '/store', label: 'חנות אריזה' },
    { path: '/about', label: 'עלינו' },
    { path: '/blog', label: 'בלוג' },
  ];

  return (
    <nav className={`fixed left-0 right-0 z-40 transition-all duration-300 ${isAuthenticated ? 'top-10' : 'top-0'}`}>
      {/* Glassmorphism Background Layer */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition duration-300 shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/20">
             <Truck className="text-white drop-shadow-md" size={24} />
          </div>
          <div className="text-2xl font-black tracking-tighter text-white drop-shadow-sm">
            ה<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">מקצוען</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-2 items-center">
          {links.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`text-sm font-bold tracking-wide transition-all relative py-2 px-4 rounded-full group overflow-hidden ${location.pathname === link.path ? 'text-white' : 'text-slate-300 hover:text-white'}`}
            >
              <span className={`absolute inset-0 bg-blue-500/10 rounded-full transform transition-transform duration-300 ease-out ${location.pathname === link.path ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}></span>
              <span className="relative z-10">{link.label}</span>
              {location.pathname === link.path && (
                 <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_5px_#60A5FA]"></span>
              )}
            </Link>
          ))}
          <Link to="/quote" className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all duration-300 text-sm flex items-center gap-2 border border-blue-400/30 group">
             <Truck size={16} className="group-hover:translate-x-1 transition-transform" /> הזמן הובלה
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-20 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden md:hidden shadow-2xl z-50"
            >
              <div className="flex flex-col p-4 gap-2">
                {links.map(link => (
                    <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-bold p-3 rounded-xl transition ${location.pathname === link.path ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                    {link.label}
                    </Link>
                ))}
                <Link to="/admin" onClick={() => setIsOpen(false)} className="text-slate-500 text-sm p-3 mt-4 border-t border-white/5 flex items-center gap-2">
                    <Shield size={14} /> כניסת מנהל
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const Footer = () => {
    return (
        <footer className="relative bg-slate-950 pt-16 pb-8 text-slate-400 overflow-hidden border-t border-white/5">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-1 bg-blue-500/50 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-1 bg-amber-500/30 blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                            <Truck className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">המקצוען</span>
                        </div>
                        <p className="mb-6 leading-relaxed text-sm text-slate-400/80">
                            חברת ההובלות המובילה בישראל. בבעלות דדי. שירותי אריזה, הובלה ואחסנה בסטנדרטים בינלאומיים.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition cursor-default">
                             <MapPin size={14} className="text-blue-500" /> אחוזה 131, רעננה
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg relative inline-block">
                            ניווט מהיר
                            <span className="absolute -bottom-2 right-0 w-8 h-1 bg-blue-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="hover:text-blue-400 transition hover:translate-x-[-4px] inline-block">אודות</Link></li>
                            <li><Link to="/store" className="hover:text-blue-400 transition hover:translate-x-[-4px] inline-block">חנות</Link></li>
                            <li><Link to="/quote" className="hover:text-blue-400 transition hover:translate-x-[-4px] inline-block">מחשבון</Link></li>
                            <li><Link to="/admin" className="hover:text-blue-400 transition hover:translate-x-[-4px] inline-block">כניסת מנהלים</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg relative inline-block">
                            שירותים
                            <span className="absolute -bottom-2 right-0 w-8 h-1 bg-amber-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="hover:text-white transition cursor-default">הובלת דירות</li>
                            <li className="hover:text-white transition cursor-default">הובלת משרדים</li>
                            <li className="hover:text-white transition cursor-default">אריזה ופריקה</li>
                            <li className="hover:text-white transition cursor-default">מנוף</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg relative inline-block">
                            צור קשר
                            <span className="absolute -bottom-2 right-0 w-8 h-1 bg-green-500 rounded-full"></span>
                        </h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-900 rounded-lg border border-white/5 group-hover:border-blue-500/50 transition">
                                    <Phone size={16} className="text-blue-500" /> 
                                </div>
                                <a href={`tel:${COMPANY_INFO.phone}`} className="font-mono text-white hover:text-blue-400 transition">{COMPANY_INFO.phone}</a>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="p-2 bg-slate-900 rounded-lg border border-white/5 group-hover:border-blue-500/50 transition">
                                    <Mail size={16} className="text-blue-500" /> 
                                </div>
                                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-blue-400 transition">{COMPANY_INFO.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <div>© 2024 הובלות המקצוען - דדי. כל הזכויות שמורות.</div>
                    <div className="flex items-center gap-2">
                        <span>Site by</span>
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Angel4Project</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const App: React.FC = () => {
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  return (
    <AuthProvider>
      <div dir="rtl" className={`min-h-screen bg-slate-900 ${isLargeFont ? 'text-xl' : 'text-base'} ${isHighContrast ? 'contrast-125 brightness-110' : ''} selection:bg-blue-500 selection:text-white font-sans`}>
        <Router>
          <AdminBar />
          <NavBar />
          <WelcomeModal />
          
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/quote" element={<Contact />} />
                <Route path="/store" element={<Store />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Suspense>

          <Footer />
          <ChatBot />
          <Accessibility 
            isHighContrast={isHighContrast} 
            isLargeFont={isLargeFont}
            onToggleContrast={() => setIsHighContrast(!isHighContrast)}
            onToggleFontSize={() => setIsLargeFont(!isLargeFont)}
          />
          <CookiesBanner />
        </Router>
      </div>
    </AuthProvider>
  );
};

export default App;