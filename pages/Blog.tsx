
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { BlogPost } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pin, Edit, Calendar, User, Clock, ArrowLeft, 
  Share2, Bookmark, Heart, MessageCircle, Search,
  Filter, Tag, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BlogModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const BlogModal: React.FC<BlogModalProps> = ({ post, isOpen, onClose }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (!post) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setLiked(!liked)}
                  className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    liked ? 'bg-red-500/80 text-white' : 'bg-slate-900/80 hover:bg-red-500/80 text-white'
                  }`}
                >
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setBookmarked(!bookmarked)}
                  className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    bookmarked ? 'bg-blue-500/80 text-white' : 'bg-slate-900/80 hover:bg-blue-500/80 text-white'
                  }`}
                >
                  <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-slate-900/80 hover:bg-slate-800 text-white rounded-xl backdrop-blur-sm transition-all duration-300"
                >
                  <Share2 size={18} />
                </motion.button>
              </div>

              {/* Badge */}
              {post.pinned && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-amber-500/90 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                  <Pin size={14} />
                  <span>נעוץ</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 max-h-[calc(90vh-20rem)] overflow-y-auto">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar size={16} />
                  <span>{new Date(post.date).toLocaleDateString('he-IL')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
                {post.readTime && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock size={16} />
                    <span>{post.readTime}</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="prose prose-invert prose-lg max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-slate-300 leading-relaxed mb-4 text-base md:text-lg"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
                  {post.tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 text-blue-400 text-sm rounded-full border border-blue-500/30"
                    >
                      <Tag size={12} />
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle size={20} className="text-slate-400" />
                  <span className="text-slate-400">תגובות</span>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-500 text-center py-8">
                    התגובות יתווספו בקרוב... 
                    <br />
                    <span className="text-sm">צור קשר כדי לשתף את דעתך!</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const allPosts = StorageService.getPosts();
    setPosts(allPosts);
    setFilteredPosts(allPosts);
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags?.includes(selectedTag)
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedTag]);

  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPost(null), 300);
  };

  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  const pinnedPosts = filteredPosts.filter(post => post.pinned);
  const regularPosts = filteredPosts.filter(post => !post.pinned);

  return (
    <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            ה<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">בלוג</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            טיפים מקצועיים, מדריכים מפורטים ועצות מהמומחים שלנו בעולם ההובלות
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="חפש במאמרים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Tags Filter */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    !selectedTag 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  הכל
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-700/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-slate-400">
            נמצאו {filteredPosts.length} מאמרים
            {searchTerm && ` עבור "${searchTerm}"`}
            {selectedTag && ` בתג "${selectedTag}"`}
          </p>
        </motion.div>

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Pin className="text-amber-400" size={24} />
              מאמרים נעוצים
            </h2>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {pinnedPosts.map((post, index) => (
                <BlogPostCard 
                  key={post.id} 
                  post={post} 
                  index={index} 
                  onOpen={() => openPost(post)}
                  viewMode={viewMode}
                  isPinned={true}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {pinnedPosts.length > 0 && (
            <h2 className="text-2xl font-bold mb-6">כל המאמרים</h2>
          )}
          
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {regularPosts.map((post, index) => (
              <BlogPostCard 
                key={post.id} 
                post={post} 
                index={index} 
                onOpen={() => openPost(post)}
                viewMode={viewMode}
                isPinned={false}
              />
            ))}
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">לא נמצאו מאמרים</h3>
            <p className="text-slate-500">נסה לשנות את מונחי החיפוש או הסנן</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300"
            >
              נקה חיפוש
            </button>
          </motion.div>
        )}
      </div>

      {/* Blog Modal */}
      <BlogModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
  onOpen: () => void;
  viewMode: 'grid' | 'list';
  isPinned: boolean;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ 
  post, 
  index, 
  onOpen, 
  viewMode, 
  isPinned 
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={`group relative bg-slate-800/30 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/30 transition-all duration-500 cursor-pointer ${
        isPinned ? 'ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/10' : ''
      }`}
      onClick={onOpen}
    >
      {isPinned && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
          <Pin size={12} />
          <span>נעוץ</span>
        </div>
      )}

      {isAuthenticated && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate('/admin');
          }}
          className="absolute top-3 left-3 z-10 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300"
          title="ערוך פוסט זה"
        >
          <Edit size={14} />
        </button>
      )}

      <div className={viewMode === 'list' ? 'md:flex md:h-64' : ''}>
        <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-1/3' : ''}`}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 md:h-full object-cover group-hover:scale-110 transition duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className={`p-6 ${viewMode === 'list' ? 'md:w-2/3 flex flex-col justify-center' : ''}`}>
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(post.date).toLocaleDateString('he-IL')}
            </span>
            <span className="flex items-center gap-1">
              <User size={14} />
              {post.author}
            </span>
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-slate-300 mb-4 leading-relaxed line-clamp-3">
            {post.content.substring(0, 150)}...
          </p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-slate-700/50 text-blue-400 text-xs rounded-full border border-blue-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default Blog;
