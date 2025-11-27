import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Product, CartItem, ProductCategory } from '../types';
import { ShoppingCart, Plus, Minus, X, Edit, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  index: number;
  addToCart: (product: Product) => void;
  isAuthenticated: boolean;
  navigate: (path: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index, addToCart, isAuthenticated, navigate }) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 500);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20, 
        delay: index * 0.1 
      }}
      className="bg-slate-800 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition duration-300 group flex flex-col relative shadow-lg hover:shadow-blue-500/10"
    >
      {isAuthenticated && (
        <button 
            onClick={(e) => { e.stopPropagation(); navigate('/admin'); }}
            className="absolute top-2 left-2 z-20 bg-red-600 text-white p-2 rounded-full hover:scale-110 shadow-lg"
            title="ערוך מוצר"
        >
            <Edit size={14} />
        </button>
      )}

      <div className="h-56 overflow-hidden relative bg-slate-900/50">
        <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
            loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
            <button 
                onClick={handleAddToCart} 
                className={`px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl ${isAdded ? 'bg-yellow-400 text-slate-900 scale-110' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
            >
                {isAdded ? 'נוסף לעגלה!' : 'הוסף לסל'}
            </button>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-lg leading-tight text-white">{product.name}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{product.description}</p>
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
          <span className="text-2xl font-black text-amber-400">₪{product.price}</span>
          <button 
            onClick={handleAddToCart} 
            className={`p-2 rounded-lg transition-colors duration-300 ${isAdded ? 'bg-yellow-400 text-slate-900' : 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white'}`}
          >
            {isAdded ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const allProducts = StorageService.getProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const checkout = () => {
    const msg = `שלום, אני מעוניין להזמין את הפריטים הבאים מהחנות:
${cart.map(i => `- ${i.name} (${i.quantity} יח')`).join('\n')}
סה"כ לתשלום: ₪${total}`;
    window.open(`https://wa.me/972505350148?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const categories: { id: ProductCategory | 'all', label: string }[] = [
    { id: 'all', label: 'הכל' },
    { id: 'kits', label: 'ערכות מעבר' },
    { id: 'boxes', label: 'קרטונים' },
    { id: 'protection', label: 'חומרי הגנה' },
    { id: 'tools', label: 'כלי עזר' },
  ];

  return (
    <div className="min-h-screen pt-24 px-4 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">חנות הציוד המקצועית</h1>
            <p className="text-xl text-slate-400">כל מה שצריך כדי לארוז כמו מקצוען, במחירים ישירים מהיבואן.</p>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
           {categories.map(cat => (
             <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-transparent border-slate-600 text-slate-400 hover:border-white hover:text-white'}`}
             >
               {cat.label}
             </button>
           ))}
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id}
              product={product}
              index={index}
              addToCart={addToCart}
              isAuthenticated={isAuthenticated}
              navigate={navigate}
            />
          ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-full shadow-xl shadow-amber-500/30 hover:scale-110 transition z-40"
      >
        <ShoppingCart />
        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 font-bold">{cart.length}</span>}
      </button>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-slate-800 z-50 shadow-2xl border-l border-white/10 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900">
                <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="text-amber-500" /> העגלה שלך</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:bg-slate-800 p-2 rounded"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center text-slate-500 mt-20 flex flex-col items-center">
                      <ShoppingCart size={64} className="mb-4 opacity-20" />
                      <p className="text-lg">העגלה ריקה כרגע</p>
                      <button onClick={() => setIsCartOpen(false)} className="mt-4 text-blue-400 underline">המשך לקניות</button>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      key={item.id} 
                      className="flex gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5"
                    >
                      <img src={item.image} className="w-20 h-20 object-cover rounded-lg" alt="" />
                      <div className="flex-1">
                        <h4 className="font-bold text-base mb-1">{item.name}</h4>
                        <p className="text-blue-400 font-bold">₪{item.price}</p>
                        <div className="flex items-center gap-4 mt-3">
                           <div className="flex items-center bg-slate-800 rounded-lg">
                               <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:text-white text-slate-400"><Minus size={14} /></button>
                               <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:text-white text-slate-400"><Plus size={14} /></button>
                           </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 transition"><X size={18} /></button>
                          <span className="font-bold">₪{item.price * item.quantity}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-slate-900">
                <div className="flex justify-between mb-2 text-slate-400">
                    <span>סכום ביניים:</span>
                    <span>₪{total}</span>
                </div>
                <div className="flex justify-between mb-6 text-2xl font-bold text-white items-center">
                  <span>סה״כ לתשלום:</span>
                  <motion.span 
                    key={total}
                    initial={{ scale: 1.5, color: "#4ade80" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.3 }}
                  >
                    ₪{total}
                  </motion.span>
                </div>
                <button onClick={checkout} disabled={cart.length === 0} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95">
                  אישור הזמנה בווטסאפ
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;