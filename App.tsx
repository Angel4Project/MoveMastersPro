import React, { useState, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Phone, Truck, Mail, MapPin, Shield,
  Facebook, Instagram, Twitter, MessageCircle,
  Clock, Star, Users, Zap, Eye, Palette, Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COMPANY_INFO } from './types';

// Import images using Vite's asset handling
const LogoImage = new URL('/images/לוגו.png', import.meta.url).href;

// Google Translate type declarations
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (config: any, elementId: string) => any;
      };
    };
  }
}

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
import SEOHead from './components/SEOHead';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatBotProvider, useChatBot } from './context/ChatBotContext';
import { googleSheetsService } from './services/googleSheetsService';
import { emailService } from './services/emailService';
import { whatsappService } from './services/whatsappService';
// import { analyticsService } from './services/analyticsService'; // Not used in this component
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // זיהוי scroll לשינוי העיצוב
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme initialization
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const links = [
    { path: '/', label: 'בית', icon: Truck },
    { path: '/quote', label: 'הצעת מחיר', icon: Star },
    { path: '/store', label: 'חנות אריזה', icon: Zap },
    { path: '/about', label: 'עלינו', icon: Users },
    { path: '/blog', label: 'בלוג', icon: Eye },
  ];

  return (
    <nav className={`fixed left-0 right-0 z-40 transition-all duration-500 ${isAuthenticated ? 'top-10' : 'top-0'}`}>
      {/* Background עם אפקט גלאס */}
      <div className={`absolute inset-0 backdrop-blur-2xl transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 shadow-2xl border-b border-white/10' 
          : 'bg-slate-900/60 shadow-lg border-b border-white/5'
      }`}>
        {/* Gradient lines אנימציות */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex justify-between items-center relative z-10">
        {/* לוגו משופר */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={LogoImage}
              alt="לוגו הובלות המקצוען"
              className="w-12 h-12 rounded-xl object-contain group-hover:brightness-110 transition-all duration-300 shadow-[0_8px_32px_rgba(59,130,246,0.4)] border border-blue-400/30 group-hover:border-blue-300/50"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiMxZTQwYWYiLz4KPHBhdGggZD0iTTMwIDI0SDE4TTI0IDE4djEyIiBzdHJva2U9IiM2MzY2ZjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
              }}
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.div>
          <div className="text-3xl font-black tracking-tighter">
            <span className="text-white drop-shadow-lg">ה</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-pulse">מקצוען</span>
          </div>
        </Link>

        {/* Desktop Menu משופר */}
        <div className="hidden md:flex gap-1 items-center">
          {links.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`group relative flex items-center gap-2 text-sm font-bold tracking-wide transition-all duration-300 px-4 py-3 rounded-xl overflow-hidden ${
                location.pathname === link.path 
                  ? 'text-white bg-gradient-to-r from-blue-600/30 to-indigo-600/30 shadow-lg border border-blue-400/30' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Background animation */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl transition-all duration-300 ${
                  location.pathname === link.path ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                }`}
                layoutId="navBackground"
              />
              
              {/* Icon */}
              <link.icon 
                size={18} 
                className={`relative z-10 transition-transform duration-300 ${
                  location.pathname === link.path ? 'text-blue-300' : 'group-hover:scale-110'
                }`} 
              />
              
              {/* Text */}
              <span className="relative z-10">{link.label}</span>
              
              {/* Active indicator */}
              {location.pathname === link.path && (
                <motion.div 
                  className="absolute -bottom-1 left-1/2 w-8 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                  layoutId="navIndicator"
                  initial={{ width: 0, x: '-50%' }}
                  animate={{ width: 32, x: '-50%' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
          
          {/* Theme & Translation Selectors */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => {
                const themes = ['default', 'dark', 'light', 'ocean'];
                const currentIndex = themes.indexOf(currentTheme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setCurrentTheme(nextTheme);
                document.documentElement.setAttribute('data-theme', nextTheme);
                localStorage.setItem('theme', nextTheme);
              }}
              className="p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
              title={`ערכת צבעים: ${currentTheme}`}
            >
              <Palette size={18} />
            </button>

            <button
              onClick={() => {
                // Load Google Translate widget
                if (!document.querySelector('#google-translate-script')) {
                  const script = document.createElement('script');
                  script.id = 'google-translate-script';
                  script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                  document.head.appendChild(script);

                  window.googleTranslateElementInit = () => {
                    new window.google.translate.TranslateElement({
                      pageLanguage: 'he',
                      includedLanguages: 'en,he,ar,ru,fr,de,es',
                      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                    }, 'google_translate_element');
                  };
                }

                // Toggle translate widget
                const translateElement = document.getElementById('google_translate_element');
                if (translateElement) {
                  translateElement.style.display = translateElement.style.display === 'none' ? 'block' : 'none';
                }
              }}
              className="p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
              title="תרגום אתר"
            >
              <Languages size={18} />
            </button>
          </div>

          {/* CTA Button משופר */}
          <Link
            to="/quote"
            className="group relative flex items-center gap-2 px-6 py-3 ml-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 transform hover:scale-105 border border-blue-400/30 hover:border-blue-300/50"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ x: ['0%', '100%'] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
            />
            <Truck size={18} className="group-hover:rotate-12 transition-transform duration-300" />
            <span>הזמן הובלה</span>
            <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* Mobile Toggle משופר */}
        <motion.button
          className="md:hidden relative p-3 text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </motion.button>

        {/* Google Translate Element */}
        <div id="google_translate_element" className="hidden md:block absolute top-full right-4 mt-2"></div>

        {/* Mobile Menu משופר */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-full left-4 right-4 md:hidden bg-slate-900/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999]"
            >
              <div className="flex flex-col p-4 gap-2">
                {links.map((link, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      key={link.path} 
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 text-lg font-bold p-4 rounded-xl transition-all duration-300 ${
                        location.pathname === link.path 
                          ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300 border border-blue-500/30 shadow-lg' 
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <link.icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 border-t border-white/10"
                >
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)} 
                    className="flex items-center gap-3 text-slate-500 hover:text-slate-300 text-sm p-4 hover:bg-white/5 rounded-xl transition-all duration-300"
                  >
                    <Shield size={16} />
                    <span>כניסת מנהל</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      url: 'https://facebook.com/hamiktzoan', 
      color: 'hover:text-blue-400' 
    },
    { 
      name: 'Instagram', 
      icon: Instagram, 
      url: 'https://instagram.com/hamiktzoan', 
      color: 'hover:text-pink-400' 
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
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
    <div dir="rtl" className={`min-h-screen bg-slate-900 ${isLargeFont ? 'text-xl' : 'text-base'} ${isHighContrast ? 'contrast-125 brightness-110' : ''} selection:bg-blue-500 selection:text-white font-sans`}>
      <Router>
        <AdminBar />
        <NavBar />
        <WelcomeModal />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
              <Route path="/" element={
                <>
                  <SEOHead
                    title="הובלות המקצוען - שירותי הובלה מקצועיים"
                    description="חברת הובלות המקצוען - שירותי אריזה, הובלה ואחסנה בסטנדרטים בינלאומיים. צי מתקדם, צוות מקצועי וטכנולוגיה חכמה להובלות בטוחות ומהירות."
                    keywords={['הובלות', 'אריזה', 'העברות', 'משרדים', 'דירות', 'מקצועי', 'ישראל', 'דדי']}
                  />
                  <Home />
                </>
              } />
              <Route path="/quote" element={
                <>
                  <SEOHead
                    title="הזמנת הצעת מחיר - הובלות המקצוען"
                    description="קבל הצעת מחיר מיידית להובלת דירה או משרד. חישוב מדויק לפי מיקום, גודל ודרישות מיוחדות."
                    keywords={['הצעת מחיר', 'הובלות', 'מחירון', 'חישוב', 'דדי']}
                  />
                  <Contact />
                </>
              } />
              <Route path="/store" element={
                <>
                  <SEOHead
                    title="חנות הציוד - הובלות המקצוען"
                    description="חנות מקוונת לציוד אריזה והובלה. קרטונים, סרטי דבק, פצפץ וכל הציוד המקצועי להובלה בטוחה."
                    keywords={['חנות', 'ציוד', 'אריזה', 'קרטונים', 'פצפץ', 'סרט דבק']}
                  />
                  <Store />
                </>
              } />
              <Route path="/about" element={
                <>
                  <SEOHead
                    title="אודותינו - הובלות המקצוען"
                    description="הכר את צוות הובלות המקצוען. למעלה מ-15 שנות ניסיון, צי מתקדם וטכנולוגיה חכמה להובלות ברמה הגבוהה ביותר."
                    keywords={['אודות', 'צוות', 'דדי', 'ניסיון', 'מקצועי', 'הובלות']}
                  />
                  <About />
                </>
              } />
              <Route path="/blog" element={
                <>
                  <SEOHead
                    title="בלוג הובלות - טיפים ומדריכים מקצועיים"
                    description="בלוג הובלות המקצוען - מדריכים, טיפים ועצות להובלה מוצלחת. כל מה שצריך לדעת לפני, במהלך ואחרי המעבר."
                    keywords={['בלוג', 'טיפים', 'מדריכים', 'הובלות', 'אריזה', 'מעבר']}
                  />
                  <Blog />
                </>
              } />
              <Route path="/admin" element={
                <>
                  <SEOHead
                    title="פאנל ניהול - הובלות המקצוען"
                    description="פאנל ניהול מתקדם לניהול לידים, שיחות צ'אט, מלאי וסטטיסטיקות."
                    keywords={['ניהול', 'פאנל', 'לידים', 'CRM', 'סטטיסטיקות']}
                  />
                  <AdminPanel />
                </>
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