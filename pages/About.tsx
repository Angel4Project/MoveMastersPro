
import React, { useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  PhoneCall, FileText, Box, Truck, Home, Target, Heart, Award, 
  Star, Users, Clock, MapPin, Mail, Phone, Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// import { StorageService } from '../services/storage'; // Not used in this component

const About: React.FC = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const { isAuthenticated } = useAuth();
  
  const [teamMembers] = useState([
    {
      id: '1',
      name: 'דדי',
      role: 'מנכ״ל ובעלים',
      image: '/images/דדי.png',
      fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSIjMWU0MGFmIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iIzYzNjZmMSIvPgo8cGF0aCBkPSJNNTAgMTQwUTUwIDE2MCA3MCAxNjBMMTEwIDE2MFExMzAgMTYwIDEzMCAxNDBMMTMwIDEwMFExMzAgODAgMTEwIDgwTDcwIDgwUTEwMCA4MCAxMDAgMTAwTDEwMCAxNDBaIiBmaWxsPSIjNjM2NmYxIi8+Cjwvc3ZnPgo=',
      bio: 'דדי הוא המנהל והמוביל של המיזם, והוא אחראי לכל השירותים, הפיתוחים והפתרונות הדיגיטליים המוצעים באתר. האתר פותח על ידי ANGEL4PROJECT.',
      phone: '050-5350148',
      email: 'hovalotdedi@gmail.com',
      isOwner: true
    },
  ]);

  const steps = [
    { icon: PhoneCall, title: "שיחת ייעוץ", desc: "אנחנו מבינים את הצרכים שלך, בודקים את התכולה ונותנים הצעה ראשונית." },
    { icon: FileText, title: "הצעת מחיר מסודרת", desc: "שקיפות מלאה. מקבלים מסמך עם כל הפרטים, ללא הפתעות ביום ההובלה." },
    { icon: Box, title: "אריזה מקצועית", desc: "הצוות שלנו מגיע עם ציוד מתקדם לארוז את הבית, או שאנחנו מספקים לך את הציוד." },
    { icon: Truck, title: "יום המעבר", desc: "משאיות חדשות, צוות אדיב, עבודה מהירה וזהירה. הכל מגיע בשלום." },
    { icon: Home, title: "פריקה וסידור", desc: "לא עוזבים עד שהספה במקום והמיטה מורכבת. תתחדשו!" },
  ];

  const achievements = [
    { number: "15+", label: "שנות ניסיון", icon: Clock },
    { number: "5000+", label: "לקוחות מרוצים", icon: Users },
    { number: "98%", label: "שביעות רצון", icon: Star },
    { number: "24/7", label: "זמינות לשירות", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-24 pb-12" ref={ref}>
      
      {/* Header Section */}
      <div className="max-w-5xl mx-auto px-4 text-center mb-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500"
        >
          מי <span className="text-white">אנחנו?</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-4xl mx-auto"
        >
          הובלות המקצוען הוקמה בשנת 2010 מתוך חזון לשנות את תדמית ענף ההובלות בישראל.
          אנחנו מאמינים שמעבר דירה צריך להיות חוויה מרגשת וחיובית, לא כאב ראש.
        </motion.p>
      </div>

      {/* Statistics Section */}
      <div className="max-w-6xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/10 hover:border-blue-500/30 transition-all duration-500"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <achievement.icon size={24} className="text-white" />
              </div>
              <div className="text-3xl font-black text-blue-400 mb-2">{achievement.number}</div>
              <div className="text-slate-400 text-sm font-medium">{achievement.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Vision Cards */}
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center hover:border-blue-500/30 transition-all duration-500 group"
        >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Target size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">המשימה שלנו</h3>
            <p className="text-slate-400 leading-relaxed">
              להעניק לכל לקוח שקט נפשי מוחלט, תוך שימוש בטכנולוגיה מתקדמת וצוות אנושי מעולה.
            </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ delay: 0.1 }} 
          className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center hover:border-red-500/30 transition-all duration-500 group"
        >
            <div className="w-20 h-20 bg-gradient-to-br from-red-600/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400 group-hover:scale-110 transition-transform duration-300">
              <Heart size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-red-400 transition-colors">הערכים שלנו</h3>
            <p className="text-slate-400 leading-relaxed">
              אמינות מעל הכל, שקיפות במחיר, כבוד לרכוש הלקוח, ועמידה קפדנית בזמנים.
            </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ delay: 0.2 }} 
          className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center hover:border-amber-500/30 transition-all duration-500 group"
        >
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <Award size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-amber-400 transition-colors">המצוינות שלנו</h3>
            <p className="text-slate-400 leading-relaxed">
              אנחנו לא מתפשרים על איכות חומרי האריזה, על תחזוקת המשאיות ועל הכשרת העובדים שלנו.
            </p>
        </motion.div>
      </div>

      {/* Interactive Timeline */}
      <div className="max-w-4xl mx-auto px-4 relative mb-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-black text-center mb-8 md:mb-20"
        >
          תהליך <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">העבודה</span>
        </motion.h2>

        {/* Mobile: Horizontal Scroll Cards */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-72 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-500 shadow-xl group hover:shadow-2xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    <step.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{step.title}</h3>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-slate-500 text-sm">החלק ימינה כדי לראות את כל השלבים ←</p>
          </div>
        </div>

        {/* Desktop: Original Timeline */}
        <div className="hidden md:block">
          {/* The Line */}
          <div className="absolute right-4 md:right-1/2 top-40 bottom-32 w-1 bg-slate-800 rounded-full">
              <motion.div
                  style={{ scaleY, transformOrigin: "top" }}
                  className="w-full h-full bg-gradient-to-b from-blue-500 via-cyan-400 to-amber-400"
              />
          </div>

          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} relative`}
              >
                {/* Dot on Line */}
                <div className="absolute right-0 md:right-1/2 transform translate-x-1/2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full border-4 border-slate-900 z-10 shadow-lg shadow-blue-500/30" />

                <div className="w-full md:w-1/2"></div>
                <div className="w-full md:w-1/2 pl-16 md:pl-0 md:px-12">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition-all duration-500 shadow-xl group hover:shadow-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <step.icon size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-lg">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <section className="bg-gradient-to-br from-slate-800/20 via-slate-800/10 to-slate-800/20 py-24">
          <div className="max-w-7xl mx-auto px-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl font-black text-center mb-6"
              >
                הצוות <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">המנצח</span> שלנו
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-400 text-center mb-16 max-w-2xl mx-auto"
              >
                צוות מקצועי ומנוסה שמחויב לשירות מעולה
              </motion.p>
              
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-md mx-auto">
                  {teamMembers.map((member, idx) => (
                      <motion.div 
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="text-center group relative"
                      >
                          <div className="relative mb-6 inline-block">
                              <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-slate-700 group-hover:border-blue-500 transition-all duration-500 shadow-2xl">
                                  <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700"
                                    onError={(e) => {
                                      if (member.fallbackImage) {
                                        e.currentTarget.src = member.fallbackImage;
                                      }
                                    }}
                                  />
                              </div>
                              
                              {/* Owner Badge */}
                              {member.isOwner && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-500 to-amber-400 text-white rounded-full p-3 border-4 border-slate-900 shadow-lg">
                                  <Award size={20} />
                                </div>
                              )}
                              
                              {/* Contact Icons */}
                              {member.phone && (
                                <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-full p-3 border-4 border-slate-900 shadow-lg">
                                  <Phone size={18} />
                                </div>
                              )}
                          </div>
                          
                          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-blue-500/30 transition-all duration-500">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{member.name}</h3>
                            <p className="text-blue-400 font-semibold mb-3">{member.role}</p>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">{member.bio}</p>
                            
                            {member.isOwner && (
                              <div className="flex justify-center gap-3 mt-4">
                                <a 
                                  href={`tel:${member.phone}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all duration-300 text-sm font-medium"
                                >
                                  <Phone size={16} />
                                  התקשר
                                </a>
                                <a 
                                  href={`mailto:${member.email}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 text-sm font-medium"
                                >
                                  <Mail size={16} />
                                  אימייל
                                </a>
                              </div>
                            )}
                          </div>
                      </motion.div>
                  ))}
              </div>

              {/* Admin Controls */}
              {isAuthenticated && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-16 text-center"
                >
                  <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
                    <h3 className="text-red-400 font-bold mb-4 flex items-center justify-center gap-2">
                      <Users size={20} />
                      פאנל ניהול צוות
                    </h3>
                    <p className="text-slate-400 mb-4">ניתן להוסיף, ערוך או מחק חברי צוות</p>
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 font-medium flex items-center gap-2 mx-auto">
                      <Plus size={18} />
                      הוסף חבר צוות
                    </button>
                  </div>
                </motion.div>
              )}
          </div>
      </section>

      {/* Company Location */}
      <div className="max-w-4xl mx-auto px-4 mt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <MapPin className="text-blue-400" size={32} />
            <h3 className="text-2xl font-bold">איפה אנחנו נמצאים?</h3>
          </div>
          <p className="text-xl text-slate-300 mb-4">אחוזה 131, רעננה</p>
          <p className="text-slate-400">
            אנחנו משרתים את כל אזור השרון והמרכז, ומגיעים לכל הארץ בהתאם לצורך
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default About;
