import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Box, Clock, ShieldCheck, ChevronDown, Star, Users, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Testimonial } from '../types';

const Home: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  
  useEffect(() => {
    setReviews(StorageService.getReviews());
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full text-slate-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
           <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
           <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 left-20 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-bold tracking-wider uppercase"
          >
            דור העתיד של ההובלות בישראל
          </motion.div>
          
          <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-amber-400 mb-6 drop-shadow-2xl leading-tight"
          >
            הובלות המקצוען
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-slate-300 mb-10 font-light max-w-3xl mx-auto"
          >
            חווית מעבר חכמה, שקטה ובטוחה. אנחנו משלבים טכנולוגיה מתקדמת עם שירות אנושי מעולה כדי שהראש שלך יישאר שקט.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link to="/quote" className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white font-bold text-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2">
              <Truck size={24} /> קבל הצעת מחיר
            </Link>
            <Link to="/store" className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-xl hover:bg-white/10 transition duration-300 flex items-center justify-center gap-2">
              <Box size={24} /> חנות הציוד
            </Link>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/30"
        >
          <ChevronDown size={40} />
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 bg-slate-800/50 border-y border-white/5 backdrop-blur relative z-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'שנות ניסיון', value: '15+', icon: Clock },
            { label: 'לקוחות מרוצים', value: '5,000+', icon: Users },
            { label: 'ערים בארץ', value: '40+', icon: MapPin },
            { label: 'קרטונים נארזו', value: '120K+', icon: Package },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <stat.icon className="mx-auto mb-2 text-blue-500 opacity-80" size={32} />
              <div className="text-4xl md:text-5xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 bg-slate-900 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-bold mb-4">למה לבחור במקצוען?</h2>
             <p className="text-slate-400 max-w-2xl mx-auto">אנחנו לא סתם עוד חברת הובלות. אנחנו מערכת לוגיסטית חכמה שדואגת לציוד שלך מא' ועד ת'.</p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Truck, title: "צי מתקדם", desc: "משאיות חדישות משנת 2024 עם בולמי זעזועים פניאומיטיים להגנה מקסימלית על הריהוט והמוצרים השבירים." },
              { icon: Box, title: "אריזה חכמה", desc: "שירות אריזה ופריקה VIP. הצוות שלנו מגיע יום לפני, אורז הכל בצורה מסודרת, ופורק בבית החדש." },
              { icon: Clock, title: "דיוק בזמנים", desc: "אצלנו 08:00 זה 08:00. מערכת ניהול לו״ז חכמה וניטור GPS מבטיחה שנגיע בדיוק בדקה שקבענו." },
              { icon: ShieldCheck, title: "ביטוח מלא", desc: "שקט נפשי מלא. כל הובלה מבוטחת בביטוח סחורה בהעברה עד 100,000 ש״ח ללא תוספת תשלום." },
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                variants={item}
                className="bg-slate-800/40 backdrop-blur-lg border border-white/5 p-8 rounded-3xl hover:bg-slate-800/60 transition duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300 shadow-lg shadow-blue-600/30">
                  <service.icon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-slate-400 leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
         <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">מה הלקוחות שלנו אומרים</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review, idx) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="bg-slate-700/30 p-8 rounded-3xl border border-white/5 relative"
                >
                  <div className="absolute -top-6 right-8 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl">❝</div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                  </div>
                  <p className="text-slate-300 mb-6 italic text-lg leading-relaxed">"{review.content}"</p>
                  <div className="flex items-center gap-4">
                    <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full border-2 border-slate-600" />
                    <div>
                      <h4 className="font-bold text-white">{review.name}</h4>
                      <p className="text-sm text-slate-500">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700/20 backdrop-blur-sm"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 bg-slate-800/80 p-12 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-black mb-6">מוכנים למעבר החלק בחייכם?</h2>
          <p className="text-xl text-slate-300 mb-8">אל תחכו לרגע האחרון. הלו"ז שלנו מתמלא מהר. שריינו תאריך עוד היום וקבלו 10% הנחה על חומרי אריזה.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote" className="px-12 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xl transition shadow-lg flex items-center justify-center gap-2">
              <Truck /> הזמן הובלה עכשיו
            </Link>
            <Link to="/contact" className="px-12 py-4 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white font-bold rounded-xl text-xl transition">
              דבר עם נציג
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;