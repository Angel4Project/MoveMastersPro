import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Phone, Mail, MessageCircle, Clock,
  User, MessageSquare, Calendar, CheckCircle
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    preferredTime: ''
  });

  const contactMethods = [
    {
      id: 'phone',
      title: 'שיחה טלפונית',
      description: 'שוחח ישירות עם דדי',
      icon: Phone,
      action: () => window.open('tel:050-5350148'),
      color: 'from-green-500 to-emerald-500',
      available: 'זמין 24/7'
    },
    {
      id: 'whatsapp',
      title: 'וואטסאפ',
      description: 'צ׳אט מהיר וחופשי',
      icon: MessageCircle,
      action: () => window.open('https://wa.me/972505350148'),
      color: 'from-green-600 to-green-500',
      available: 'זמין 24/7'
    },
    {
      id: 'email',
      title: 'אימייל',
      description: 'שלח הודעה מפורטת',
      icon: Mail,
      action: () => window.open('mailto:hovalotdedi@gmail.com'),
      color: 'from-blue-500 to-blue-600',
      available: 'תגובה תוך שעה'
    },
    {
      id: 'form',
      title: 'טופס קשר',
      description: 'מלא פרטים ונחזור אליך',
      icon: MessageSquare,
      action: () => {},
      color: 'from-purple-500 to-purple-600',
      available: 'תגובה תוך 30 דקות'
    }
  ];

  const timeSlots = [
    'בהקדם',
    'הבוקר (8:00-12:00)',
    'אחר הצהריים (12:00-17:00)',
    'הערב (17:00-21:00)',
    'סוף שבוע'
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await StorageService.saveContactForm(
        formData.name,
        formData.phone,
        '', // Email field not implemented yet
        formData.message
      );
      alert('ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.');
      setFormData({ name: '', phone: '', message: '', preferredTime: '' });
      onClose();
    } catch (error) {
      console.error('Failed to send contact form:', error);
      alert('שגיאה בשליחת ההודעה. אנא נסה שוב.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
          className="bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <MessageCircle size={32} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">
                דבר עם נציג שלנו
              </h2>
              <p className="text-blue-100 text-lg">
                בחר את הדרך הכי נוחה עבורך ליצור קשר
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[calc(90vh-12rem)] overflow-y-auto">
            {!selectedMethod && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {contactMethods.map((method, index) => (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`group relative p-6 bg-gradient-to-br ${method.color} rounded-2xl text-white text-right hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/10`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <method.icon size={24} />
                      </div>
                      <div className="w-3 h-3 bg-white/50 rounded-full group-hover:bg-white transition-colors"></div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                    <p className="text-white/90 mb-3">{method.description}</p>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Clock size={14} />
                      <span>{method.available}</span>
                    </div>

                    <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Contact Method Details */}
            <AnimatePresence mode="wait">
              {selectedMethod && selectedMethod !== 'form' && (
                <motion.div
                  key={selectedMethod}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="mb-8">
                    <button
                      onClick={() => setSelectedMethod('')}
                      className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2 mx-auto transition-colors"
                    >
                      ← חזרה לאפשרויות
                    </button>

                    <div className="bg-slate-800/50 rounded-2xl p-8 border border-white/10">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {React.createElement(
                          contactMethods.find(m => m.id === selectedMethod)?.icon || Phone,
                          { size: 40, className: 'text-white' }
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4">
                        {contactMethods.find(m => m.id === selectedMethod)?.title}
                      </h3>
                      <p className="text-slate-300 mb-6 text-lg">
                        {contactMethods.find(m => m.id === selectedMethod)?.description}
                      </p>

                      <div className="flex justify-center gap-4">
                        <button
                          onClick={contactMethods.find(m => m.id === selectedMethod)?.action}
                          className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <CheckCircle size={20} />
                          פתח עכשיו
                        </button>
                        
                        <button
                          onClick={() => window.open('https://wa.me/972505350148', '_blank')}
                          className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <MessageCircle size={20} />
                          וואטסאפ חירום
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Contact Form */}
              {selectedMethod === 'form' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setSelectedMethod('')}
                    className="text-blue-400 hover:text-blue-300 mb-6 flex items-center gap-2 transition-colors"
                  >
                    ← חזרה לאפשרויות
                  </button>

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          שם מלא *
                        </label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full pr-12 pl-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="הכנס את שמך"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          טלפון *
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full pr-12 pl-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="050-1234567"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        זמן נוח ליצירת קשר
                      </label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <select
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleInputChange}
                          className="w-full pr-12 pl-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-300"
                        >
                          <option value="">בחר זמן מועדף</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        הודעה *
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute right-3 top-3 text-slate-400" size={20} />
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full pr-12 pl-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all duration-300 resize-none"
                          placeholder="ספר לנו על הפרויקט שלך..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={20} />
                        שלח הודעה
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => window.open('https://wa.me/972505350148', '_blank')}
                        className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={20} />
                        וואטסאפ
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContactModal;