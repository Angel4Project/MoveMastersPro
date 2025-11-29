import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, X, Bot, User } from 'lucide-react';
import { COMPANY_INFO } from '../types';

interface RepresentativePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatbot: () => void;
}

const RepresentativePopup: React.FC<RepresentativePopupProps> = ({
  isOpen,
  onClose,
  onOpenChatbot
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <User size={32} />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                דבר עם נציג
              </h2>
              <p className="text-blue-100 text-sm">
                בחר את האופן הנוח לך ליצירת קשר
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Chatbot Option */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => {
                onOpenChatbot();
                onClose();
              }}
              className="w-full group relative bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 hover:border-blue-500/50 p-6 rounded-2xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Bot size={24} className="text-white" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="text-lg font-bold mb-1">צ'אט בוט חכם</h3>
                  <p className="text-slate-300 text-sm">עוזר וירטואלי זמין 24/7</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            {/* Call Dadi Option */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              href={`tel:${COMPANY_INFO.phone}`}
              className="w-full group relative bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 hover:border-green-500/50 p-6 rounded-2xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone size={24} className="text-white" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="text-lg font-bold mb-1">שיחה עם דדי</h3>
                  <p className="text-slate-300 text-sm">{COMPANY_INFO.phone}</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.a>

            {/* WhatsApp Alternative */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              href={`https://wa.me/972${COMPANY_INFO.phone.replace(/-/g, '').substring(1)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full group relative bg-gradient-to-r from-green-600/20 to-green-500/20 hover:from-green-600/30 hover:to-green-500/30 border border-green-500/30 hover:border-green-500/50 p-4 rounded-2xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 block"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle size={18} />
                <span className="text-sm">או שלח הודעה בוואטסאפ</span>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RepresentativePopup;