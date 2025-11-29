import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Phone, Truck, Mail, MapPin, Shield,
  Facebook, Instagram, Twitter, MessageCircle,
  Clock, Star, Users, Zap, Eye, Palette, Languages
} from 'lucide-react';
import { COMPANY_INFO } from '../types';
import { getTranslation, getCurrentLanguage, setCurrentLanguage, Language } from '../src/translations';

// Import images using reliable static paths
const LogoImage = '/images/logo.png';

interface HeaderProps {
  isAuthenticated?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('he');
  const location = useLocation();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Language initialization
  useEffect(() => {
    const savedLanguage = getCurrentLanguage();
    setCurrentLanguageState(savedLanguage);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.translate-dropdown') && !target.closest('.theme-dropdown')) {
        setIsTranslateOpen(false);
        setIsThemeOpen(false);
      }
    };

    if (isTranslateOpen || isThemeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTranslateOpen, isThemeOpen]);

  const links = [
    { path: '/', label: getTranslation('home', currentLanguage), icon: Truck },
    { path: '/quote', label: getTranslation('quote', currentLanguage), icon: Star },
    { path: '/store', label: getTranslation('store', currentLanguage), icon: Zap },
    { path: '/about', label: getTranslation('about', currentLanguage), icon: Users },
    { path: '/blog', label: getTranslation('blog', currentLanguage), icon: Eye },
  ];

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    setIsThemeOpen(false);
  };

  const handleLanguageSelect = (langCode: string) => {
    setCurrentLanguage(langCode as Language);
    setCurrentLanguageState(langCode as Language);
    setIsTranslateOpen(false);
    // Optionally reload the page to apply translations
    window.location.reload();
  };

  return (
    <nav className={`fixed left-0 right-0 z-[1000] transition-all duration-500 ${isAuthenticated ? 'top-10' : 'top-0'}`}>
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
              loading="eager"
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
            <div className="relative theme-dropdown">
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                title={`${getTranslation('chooseTheme', currentLanguage)}: ${currentTheme}`}
              >
                <Palette size={18} />
              </button>

              {isThemeOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-[1000]">
                  <div className="p-3">
                    <div className="text-sm font-medium text-white mb-2">{getTranslation('chooseTheme', currentLanguage)}</div>
                    <div className="space-y-1">
                      {[
                        { key: 'default', name: getTranslation('defaultTheme', currentLanguage), desc: 'כהה עם גרדיאנטים' },
                        { key: 'dark', name: getTranslation('darkTheme', currentLanguage), desc: 'שחור ואפור' },
                        { key: 'light', name: getTranslation('lightTheme', currentLanguage), desc: 'לבן ותכלת' },
                        { key: 'ocean', name: getTranslation('oceanTheme', currentLanguage), desc: 'כחול וירוק' }
                      ].map((theme) => (
                        <button
                          key={theme.key}
                          onClick={() => handleThemeChange(theme.key)}
                          className={`w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
                            currentTheme === theme.key ? 'bg-blue-600/30 text-blue-300' : ''
                          }`}
                        >
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-xs opacity-75">{theme.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative translate-dropdown">
              <button
                onClick={() => setIsTranslateOpen(!isTranslateOpen)}
                className="p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                title={getTranslation('translateSite', currentLanguage)}
              >
                <Languages size={18} />
              </button>

              {isTranslateOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-[1000]">
                  <div className="p-3">
                    <div className="text-sm font-medium text-white mb-2">{getTranslation('chooseLanguage', currentLanguage)}</div>
                    <div className="space-y-1">
                      {[
                        { code: 'he', name: 'עברית', native: 'עברית' },
                        { code: 'en', name: 'English', native: 'English' },
                        { code: 'ar', name: 'العربية', native: 'العربية' },
                        { code: 'ru', name: 'Русский', native: 'Русский' },
                        { code: 'fr', name: 'Français', native: 'Français' },
                        { code: 'es', name: 'Español', native: 'Español' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageSelect(lang.code)}
                          className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs opacity-75">{lang.native}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            <span>{getTranslation('orderMoving', currentLanguage)}</span>
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
                    <span>{getTranslation('adminLogin', currentLanguage)}</span>
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

export default Header;