
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, X, Sparkles, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show only once per session or use localStorage for persistent checking
    const hasSeenWelcome = sessionStorage.getItem('hamiktzoan_seen_welcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hamiktzoan_seen_welcome', 'true');
  };

  const handleAction = (path: string) => {
    handleClose();
    navigate(path);
  };

  const handleHomeAction = () => {
    if (location.pathname !== '/') {
      handleAction('/');
    } else {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

            <button 
                onClick={handleClose}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white z-20"
            >
                <X size={24} />
            </button>

            <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 relative z-10 flex flex-col justify-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-wider mb-4"
                    >
                        <Sparkles size={14} /> ברוכים הבאים
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight"
                    >
                        האתר החדש של <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">הובלות המקצוען</span>
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-400 leading-relaxed mb-8"
                    >
                        שדרגנו את חווית השירות! מעכשיו ניתן לקבל הצעת מחיר ב-3D, לנהל הזמנות בחנות האונליין ולהתייעץ עם ה-AI החכם שלנו.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-3"
                    >
                        <button 
                            onClick={() => handleAction('/quote')}
                            className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/50"
                        >
                            <Truck size={18} /> קבל הצעת מחיר
                        </button>
                        <button
                            onClick={() => handleAction('/store')}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                        >
                             לחנות האריזה
                        </button>
                        <button
                            onClick={handleHomeAction}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-green-900/50"
                        >
                            <Home size={18} /> המשך לדף הבית
                        </button>
                    </motion.div>
                </div>

                <div className="hidden md:block bg-[url('https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center relative">
                    <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
