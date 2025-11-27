
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { BlogPost } from '../types';
import { motion } from 'framer-motion';
import { Pin, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setPosts(StorageService.getPosts());
  }, []);

  return (
    <div className="min-h-screen pt-24 px-4 bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">הבלוג של המקצוען</h1>
        
        <div className="space-y-8">
          {posts.map(post => (
            <motion.article 
              key={post.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className={`bg-slate-800 rounded-2xl overflow-hidden shadow-xl border relative group ${post.pinned ? 'border-amber-500/50 shadow-amber-500/20' : 'border-white/5'}`}
            >
              {isAuthenticated && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="absolute top-4 left-4 z-20 bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                  title="ערוך פוסט זה"
                >
                  <Edit size={16} />
                </button>
              )}

              <div className="md:flex">
                <div className="md:w-1/3 relative overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover min-h-[200px] group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                  {post.pinned && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-2 uppercase tracking-wide">
                      <Pin size={16} /> נעוץ
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                  <p className="text-slate-300 mb-6 leading-relaxed whitespace-pre-line">{post.content}</p>
                  <div className="flex justify-between text-sm text-slate-500 mt-auto pt-4 border-t border-white/5">
                    <span className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                        {post.author}
                    </span>
                    <span>{new Date(post.date).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
