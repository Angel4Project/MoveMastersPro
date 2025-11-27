
import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { PhoneCall, FileText, Box, Truck, Home, Target, Heart, Award } from 'lucide-react';

const About: React.FC = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const steps = [
    { icon: PhoneCall, title: "שיחת ייעוץ", desc: "אנחנו מבינים את הצרכים שלך, בודקים את התכולה ונותנים הצעה ראשונית." },
    { icon: FileText, title: "הצעת מחיר מסודרת", desc: "שקיפות מלאה. מקבלים מסמך עם כל הפרטים, ללא הפתעות ביום ההובלה." },
    { icon: Box, title: "אריזה מקצועית", desc: "הצוות שלנו מגיע עם ציוד מתקדם לארוז את הבית, או שאנחנו מספקים לך את הציוד." },
    { icon: Truck, title: "יום המעבר", desc: "משאיות חדשות, צוות אדיב, עבודה מהירה וזהירה. הכל מגיע בשלום." },
    { icon: Home, title: "פריקה וסידור", desc: "לא עוזבים עד שהספה במקום והמיטה מורכבת. תתחדשו!" },
  ];

  const team = [
    { name: 'דדי כהן', role: 'מנכ״ל ובעלים', img: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'אבי לוי', role: 'מנהל תפעול', img: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { name: 'שרה ישראלי', role: 'שירות לקוחות', img: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { name: 'דני רופ', role: 'ראש צוות הובלות', img: 'https://randomuser.me/api/portraits/men/4.jpg' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-24 pb-12" ref={ref}>
      
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-24">
        <h1 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
          מי אנחנו?
        </h1>
        <p className="text-xl text-slate-300 leading-relaxed">
          הובלות המקצוען הוקמה בשנת 2010 מתוך חזון לשנות את תדמית ענף ההובלות בישראל.
          אנחנו מאמינים שמעבר דירה צריך להיות חוויה מרגשת וחיובית, לא כאב ראש.
        </p>
      </div>

      {/* Vision Cards */}
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 mb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-slate-800 p-8 rounded-2xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400"><Target size={32} /></div>
            <h3 className="text-2xl font-bold mb-4">המשימה שלנו</h3>
            <p className="text-slate-400">להעניק לכל לקוח שקט נפשי מוחלט, תוך שימוש בטכנולוגיה מתקדמת וצוות אנושי מעולה.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-slate-800 p-8 rounded-2xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400"><Heart size={32} /></div>
            <h3 className="text-2xl font-bold mb-4">הערכים שלנו</h3>
            <p className="text-slate-400">אמינות מעל הכל, שקיפות במחיר, כבוד לרכוש הלקוח, ועמידה קפדנית בזמנים.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-slate-800 p-8 rounded-2xl border border-white/5 text-center">
            <div className="w-16 h-16 bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-400"><Award size={32} /></div>
            <h3 className="text-2xl font-bold mb-4">המצוינות שלנו</h3>
            <p className="text-slate-400">אנחנו לא מתפשרים על איכות חומרי האריזה, על תחזוקת המשאיות ועל הכשרת העובדים שלנו.</p>
        </motion.div>
      </div>

      {/* Interactive Timeline */}
      <div className="max-w-4xl mx-auto px-4 relative mb-32">
        <h2 className="text-4xl font-bold text-center mb-16">תהליך העבודה</h2>
        
        {/* The Line */}
        <div className="absolute right-4 md:right-1/2 top-32 bottom-20 w-1 bg-slate-800 rounded-full">
            <motion.div 
                style={{ scaleY, transformOrigin: "top" }} 
                className="w-full h-full bg-gradient-to-b from-blue-500 to-amber-400"
            />
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} relative`}
            >
              {/* Dot on Line */}
              <div className="absolute right-0 md:right-1/2 transform translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-900 z-10" />

              <div className="w-full md:w-1/2"></div>
              <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-12">
                <div className="bg-slate-800/50 backdrop-blur border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-colors shadow-xl">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <section className="bg-slate-800/30 py-20">
          <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16">הצוות המנצח שלנו</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {team.map((member, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-center group"
                      >
                          <div className="relative mb-4 inline-block">
                              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-700 group-hover:border-blue-500 transition-colors duration-300">
                                  <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                              </div>
                              <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 border-4 border-slate-900">
                                  <Truck size={16} />
                              </div>
                          </div>
                          <h3 className="text-xl font-bold">{member.name}</h3>
                          <p className="text-slate-400">{member.role}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

    </div>
  );
};

export default About;
