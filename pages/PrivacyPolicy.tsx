import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            מדיניות <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">פרטיות</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            אנו מחויבים להגן על הפרטיות והמידע האישי שלכם
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
              <Lock className="text-blue-400" size={24} />
              איסוף מידע
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              אנו אוספים מידע אישי רק כאשר אתם מספקים אותו לנו ישירות, כגון כאשר אתם:
            </p>
            <ul className="text-slate-300 mb-8 space-y-2">
              <li>• מזמינים הצעת מחיר דרך האתר</li>
              <li>• נרשמים לניוזלטר</li>
              <li>• יוצרים קשר דרך הטופס או הצ'אט</li>
              <li>• משתמשים בשירותי האתר</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Database className="text-green-400" size={24} />
              סוגי המידע שאנו אוספים
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold mb-2 text-blue-400">מידע אישי</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• שם מלא</li>
                  <li>• מספר טלפון</li>
                  <li>• כתובת אימייל</li>
                  <li>• כתובת למשלוח</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <h3 className="font-bold mb-2 text-green-400">מידע טכני</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• כתובת IP</li>
                  <li>• סוג דפדפן</li>
                  <li>• זמן ביקור באתר</li>
                  <li>• דפים שנצפו</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Eye className="text-purple-400" size={24} />
              שימוש במידע
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              המידע שאנו אוספים משמש אך ורק למטרות הבאות:
            </p>
            <ul className="text-slate-300 mb-8 space-y-2">
              <li>• מתן שירותי הובלה והעברות</li>
              <li>• תקשורת בנוגע להזמנות והצעות מחיר</li>
              <li>• שיפור חווית המשתמש באתר</li>
              <li>• עמידה בחובות משפטיות ורגולטוריות</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Mail className="text-red-400" size={24} />
              שיתוף מידע עם צדדים שלישיים
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              אנו לא מוכרים, משכירים או משתפים את המידע האישי שלכם עם צדדים שלישיים למטרות שיווקיות.
              המידע עשוי להיות משותף רק במקרים הבאים:
            </p>
            <ul className="text-slate-300 mb-8 space-y-2">
              <li>• עם הסכמתכם המפורשת</li>
              <li>• לצורך מתן השירות (למשל חברות הובלה)</li>
              <li>• כאשר נדרש על פי חוק</li>
              <li>• להגנה על זכויותינו המשפטיות</li>
            </ul>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Shield className="text-yellow-400" size={24} />
              אבטחת מידע
            </h2>
            <p className="text-slate-300 leading-relaxed mb-8">
              אנו מיישמים אמצעי אבטחה מתקדמים להגנה על המידע האישי שלכם, כולל הצפנה,
              גישה מוגבלת למידע, ושרתי אחסון מאובטחים. עם זאת, אין שיטת העברה או אחסון
              אלקטרונית שהיא 100% בטוחה.
            </p>

            <h2 className="text-2xl font-bold mb-6">יצירת קשר</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              אם יש לכם שאלות בנוגע למדיניות הפרטיות שלנו או לטיפול במידע האישי שלכם,
              אנא צרו קשר:
            </p>
            <div className="bg-slate-900/50 p-6 rounded-xl border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="text-green-400" size={20} />
                <span className="text-white font-bold">050-5350148</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-blue-400" size={20} />
                <span className="text-white">hovalotdedi@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              חזרה לדף הבית
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;