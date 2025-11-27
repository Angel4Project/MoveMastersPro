import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Check } from 'lucide-react';

const CookiesBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('hamiktzoan_cookie_consent');
    if (!consent) {
      // Delay showing slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hamiktzoan_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[100]"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
             {/* Neon Glow */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>
             
             <div className="flex items-start gap-4">
               <div className="p-3 bg-slate-800 rounded-xl text-amber-400">
                 <Cookie size={24} />
               </div>
               <div>
                 <h4 className="font-bold text-white mb-1">חוויית גלישה חכמה</h4>
                 <p className="text-sm text-slate-400 leading-relaxed mb-4">
                   אנחנו משתמשים ב"עוגיות" (Cookies) כדי לזכור את העדפות האריזה שלך ולהציע לך חוויה מותאמת אישית באתר החדש שלנו.
                 </p>
                 <div className="flex gap-3">
                   <button 
                     onClick={handleAccept}
                     className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                   >
                     <Check size={14} /> אני מסכים
                   </button>
                   <button 
                     onClick={() => setIsVisible(false)}
                     className="text-slate-400 hover:text-white text-sm font-bold px-4 py-2"
                   >
                     סגור
                   </button>
                 </div>
               </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookiesBanner;