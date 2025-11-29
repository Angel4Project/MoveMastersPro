import React, { useState, useEffect } from 'react';
import { Eye, Type, Sun, Moon, X, Accessibility as AccessIcon, Volume2, VolumeX, ZoomIn, ZoomOut, Palette, MousePointer, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilityProps {
  onToggleContrast: () => void;
  onToggleFontSize: () => void;
  isHighContrast: boolean;
  isLargeFont: boolean;
}

const Accessibility: React.FC<AccessibilityProps> = ({ onToggleContrast, onToggleFontSize, isHighContrast, isLargeFont }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [isHighSaturation, setIsHighSaturation] = useState(false);
  const [isMonochrome, setIsMonochrome] = useState(false);
  const [isInverted, setIsInverted] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;

    // Reading mode
    if (isReadingMode) {
      root.style.setProperty('--reading-mode', 'reading');
      root.style.lineHeight = '1.8';
      root.style.letterSpacing = '0.5px';
    } else {
      root.style.removeProperty('--reading-mode');
      root.style.lineHeight = '';
      root.style.letterSpacing = '';
    }

    // Dyslexic font
    if (isDyslexicFont) {
      root.style.fontFamily = '"OpenDyslexic", "Comic Sans MS", sans-serif';
    } else {
      root.style.fontFamily = '';
    }

    // Color adjustments
    if (isHighSaturation) {
      root.style.filter = 'saturate(2)';
    } else if (isMonochrome) {
      root.style.filter = 'grayscale(100%)';
    } else if (isInverted) {
      root.style.filter = 'invert(100%)';
    } else {
      root.style.filter = '';
    }

    // Zoom
    root.style.fontSize = `${zoomLevel * 100}%`;

    return () => {
      root.style.fontSize = '';
      root.style.lineHeight = '';
      root.style.letterSpacing = '';
      root.style.fontFamily = '';
      root.style.filter = '';
    };
  }, [isReadingMode, isDyslexicFont, isHighSaturation, isMonochrome, isInverted, zoomLevel]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && isTextToSpeech) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.lang = 'he-IL'; // Hebrew
      speechSynthesis.speak(utterance);
    }
  };

  const resetAll = () => {
    setIsReadingMode(false);
    setIsDyslexicFont(false);
    setIsHighSaturation(false);
    setIsMonochrome(false);
    setIsInverted(false);
    setIsTextToSpeech(false);
    setSpeechRate(1);
    setZoomLevel(1);
    onToggleContrast();
    onToggleFontSize();
  };

  return (
    <div className="fixed top-1/2 left-0 z-50 transform -translate-y-1/2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="bg-white text-slate-900 p-6 rounded-r-xl shadow-2xl border border-slate-200 w-80 absolute left-14 top-0 -mt-32 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <AccessIcon size={24} />
                נגישות
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded"
                aria-label="סגור תפריט נגישות"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Vision Accessibility */}
              <div>
                <h4 className="font-semibold mb-3 text-blue-600 border-b border-blue-100 pb-1">ראייה</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onToggleFontSize}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isLargeFont ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                  >
                    <Type size={16} />
                    <span>{isLargeFont ? 'הקטן טקסט' : 'הגדל טקסט'}</span>
                  </button>

                  <button
                    onClick={onToggleContrast}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isHighContrast ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                  >
                    {isHighContrast ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{isHighContrast ? 'ניגוד רגיל' : 'ניגוד גבוה'}</span>
                  </button>

                  <button
                    onClick={() => setIsMonochrome(!isMonochrome)}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isMonochrome ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                  >
                    <Eye size={16} />
                    <span>{isMonochrome ? 'צבע רגיל' : 'שחור לבן'}</span>
                  </button>

                  <button
                    onClick={() => setIsInverted(!isInverted)}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isInverted ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100'}`}
                  >
                    <Palette size={16} />
                    <span>{isInverted ? 'צבע רגיל' : 'הפוך צבעים'}</span>
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">זום טקסט</span>
                    <span className="text-xs text-slate-500">{Math.round(zoomLevel * 100)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                      className="p-1 hover:bg-slate-100 rounded"
                      disabled={zoomLevel <= 0.5}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${((zoomLevel - 0.5) / 1.5) * 100}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                      className="p-1 hover:bg-slate-100 rounded"
                      disabled={zoomLevel >= 2}
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cognitive Accessibility */}
              <div>
                <h4 className="font-semibold mb-3 text-green-600 border-b border-green-100 pb-1">קוגניטיבי</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsReadingMode(!isReadingMode)}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isReadingMode ? 'bg-green-100 text-green-800' : 'hover:bg-slate-100'}`}
                  >
                    <Eye size={16} />
                    <span>{isReadingMode ? 'קריאה רגילה' : 'מצב קריאה'}</span>
                  </button>

                  <button
                    onClick={() => setIsDyslexicFont(!isDyslexicFont)}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isDyslexicFont ? 'bg-green-100 text-green-800' : 'hover:bg-slate-100'}`}
                  >
                    <Type size={16} />
                    <span>{isDyslexicFont ? 'גופן רגיל' : 'גופן דיסלקסיה'}</span>
                  </button>
                </div>
              </div>

              {/* Hearing Accessibility */}
              <div>
                <h4 className="font-semibold mb-3 text-purple-600 border-b border-purple-100 pb-1">שמיעה</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsTextToSpeech(!isTextToSpeech)}
                    className={`flex items-center gap-2 w-full p-2 rounded transition text-sm ${isTextToSpeech ? 'bg-purple-100 text-purple-800' : 'hover:bg-slate-100'}`}
                  >
                    {isTextToSpeech ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isTextToSpeech ? 'כבה קריאה' : 'הפעל קריאה'}</span>
                  </button>

                  {isTextToSpeech && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">מהירות קריאה</span>
                        <span className="text-xs text-slate-500">{speechRate}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Motor Accessibility */}
              <div>
                <h4 className="font-semibold mb-3 text-orange-600 border-b border-orange-100 pb-1">מוטורי</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => document.querySelectorAll('button, a, input, select, textarea').forEach(el => {
                      (el as HTMLElement).style.minWidth = '44px';
                      (el as HTMLElement).style.minHeight = '44px';
                    })}
                    className="flex items-center gap-2 w-full p-2 hover:bg-slate-100 rounded transition text-sm"
                  >
                    <MousePointer size={16} />
                    <span>גדל כפתורים</span>
                  </button>

                  <button
                    onClick={() => {
                      // Focus management for keyboard navigation
                      document.addEventListener('keydown', (e) => {
                        if (e.key === 'Tab') {
                          const focusable = document.querySelectorAll('button, a, input, select, textarea');
                          const current = document.activeElement;
                          const index = Array.from(focusable).indexOf(current as Element);
                          if (e.shiftKey) {
                            (focusable[index - 1] as HTMLElement || focusable[focusable.length - 1] as HTMLElement)?.focus();
                          } else {
                            (focusable[index + 1] as HTMLElement || focusable[0] as HTMLElement)?.focus();
                          }
                          e.preventDefault();
                        }
                      });
                    }}
                    className="flex items-center gap-2 w-full p-2 hover:bg-slate-100 rounded transition text-sm"
                  >
                    <Keyboard size={16} />
                    <span>ניווט מקלדת</span>
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={resetAll}
                  className="w-full p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-medium"
                >
                  איפוס כל ההגדרות
                </button>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500 text-center border-t pt-4">
              כלי נגישות - Angel0S-WEB
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-r-xl shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105"
        aria-label="פתח תפריט נגישות"
      >
        <AccessIcon size={28} />
      </button>
    </div>
  );
};

export default Accessibility;
