import React, { useState } from 'react';
import { Eye, Type, Sun, Moon, X, Accessibility as AccessIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityProps {
  onToggleContrast: () => void;
  onToggleFontSize: () => void;
  isHighContrast: boolean;
  isLargeFont: boolean;
}

const Accessibility: React.FC<AccessibilityProps> = ({ onToggleContrast, onToggleFontSize, isHighContrast, isLargeFont }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-1/2 left-0 z-50 transform -translate-y-1/2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -200, opacity: 0 }}
            className="bg-white text-slate-900 p-4 rounded-r-xl shadow-2xl border border-slate-200 w-64 absolute left-14 top-0 -mt-20"
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="font-bold text-lg">נגישות</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={onToggleFontSize}
                className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded transition"
              >
                <Type size={20} />
                <span>{isLargeFont ? 'הקטן טקסט' : 'הגדל טקסט'}</span>
              </button>

              <button 
                onClick={onToggleContrast}
                className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded transition"
              >
                {isHighContrast ? <Sun size={20} /> : <Moon size={20} />}
                <span>{isHighContrast ? 'מצב רגיל' : 'ניגודיות גבוהה'}</span>
              </button>
            </div>
            
            <div className="mt-4 text-xs text-slate-500 text-center">
              פיתוח ע״י Angel4Project
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-r-xl shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="פתח תפריט נגישות"
      >
        <AccessIcon size={24} />
      </button>
    </div>
  );
};

export default Accessibility;
