import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, Truck, Shield, AlertTriangle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            תנאי <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">שימוש</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            התנאים וההגבלות לשימוש בשירותי הובלות המקצוען
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
        >
          <div className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Scale className="text-blue-400" size={24} />
              קבלת התנאים
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              על ידי שימוש באתר ובשירותי הובלות המקצוען, אתם מסכימים לתנאי השימוש הללו.
              אם אינכם מסכימים לתנאים אלו, אנא אל תשתמשו בשירותינו.
            </p>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Truck className="text-orange-400" size={24} />
              שירותי הובלה
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              אנו מספקים שירותי הובלה מקצועיים הכוללים:
            </p>
            <ul className="text-slate-300 mb-8 space-y-2">
              <li>• הובלת דירות ומשרדים</li>
              <li>• אריזה מקצועית</li>
              <li>• שירותי מנוף ומעלית</li>
              <li>• אחסון זמני</li>
              <li>• הובלות בינלאומיות</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="text-green-400" size={24} />
              אחריות וביטוח
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              כל שירותי ההובלה כוללים ביטוח מלא עד 100,000 ₪. אנו אחראים לנזקים שנגרמים
              במהלך ההובלה עקב רשלנותנו. הלקוח אחראי להעריך את ערך הרכוש ולהודיע על
              פריטים יקרי ערך מראש.
            </p>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={24} />
              ביטול והחזר
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              ניתן לבטל הזמנה עד 48 שעות לפני מועד ההובלה ללא עמלות. ביטול במועד מאוחר יותר
              יחויב ב-20% מעלות השירות. במקרה של ביטול מצדנו, נחזיר את מלוא התשלום.
            </p>

            <h2 className="text-2xl font-bold mb-6">תשלום ושירות</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              התשלום מתבצע במזומן, העברה בנקאית, צ'ק או אשראי. אנו מספקים קבלות מס
              כחוק. השירות ניתן 24/7 עם זמינות מיידית.
            </p>

            <h2 className="text-2xl font-bold mb-6">הגבלת אחריות</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              אנו לא נהיה אחראים לנזקים עקיפים, אובדן רווח או נזקים מיוחדים.
              האחריות מוגבלת לסכום ששולם עבור השירות.
            </p>

            <h2 className="text-2xl font-bold mb-6">שינויים בתנאים</h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              אנו שומרים על הזכות לשנות תנאי שימוש אלו בכל עת. שינויים יפורסמו באתר
              ויכנסו לתוקף מיידית.
            </p>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5">
              <h3 className="font-bold mb-4 text-center">צרו קשר למידע נוסף</h3>
              <div className="flex items-center justify-center gap-3">
                <Phone className="text-green-400" size={20} />
                <span className="text-white font-bold">050-5350148</span>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-green-500/30"
            >
              חזרה לדף הבית
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;