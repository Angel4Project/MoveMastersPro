import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Lead, Product, BlogPost, AppSettings, AIProvider, Campaign } from '../types';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Trash2, CheckCircle, Save, Plus, LogOut, Settings, LayoutDashboard, 
  Users, ShoppingBag, FileText, ArrowLeft, Brain, Archive, Clock, 
  Megaphone, TrendingUp, Calendar, Phone, Mail, MessageCircle, AlertTriangle, X, Search, Pin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'marketing' | 'products' | 'blog' | 'settings'>('dashboard');
  const [loginPass, setLoginPass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    basePrice: 0, pricePerKm: 0, pricePerRoom: 0, pricePerFloor: 0, pricePerCbm: 0,
    aiProvider: 'google', aiApiKey: '', aiModel: ''
  });
  const [visitsData, setVisitsData] = useState<any[]>([]);

  // Modal / Form States
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({});
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Clear search when tab changes
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  const loadData = () => {
    setLeads(StorageService.getLeads());
    setCampaigns(StorageService.getCampaigns());
    setProducts(StorageService.getProducts());
    setBlogPosts(StorageService.getPosts());
    setSettings(StorageService.getSettings());
    setVisitsData(StorageService.getVisits());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(loginPass)) {
      alert("סיסמה שגויה");
    }
  };

  // --- Filtering Logic ---
  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.phone.includes(searchTerm) ||
    (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogPosts = blogPosts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Actions ---

  // CRM Actions
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Lead['status'];

    // Optimistically update local state
    const updatedLeads = leads.map(l => 
        l.id === draggableId ? { ...l, status: newStatus } : l
    );
    setLeads(updatedLeads);

    // Update Storage
    StorageService.updateLead(draggableId, { status: newStatus });
    
    if (selectedLead && selectedLead.id === draggableId) {
        setSelectedLead({...selectedLead, status: newStatus});
    }
  };

  const moveLead = (id: string, newStatus: 'new' | 'in_progress' | 'closed') => {
    StorageService.updateLead(id, { status: newStatus });
    loadData();
    if (selectedLead && selectedLead.id === id) {
        setSelectedLead({...selectedLead, status: newStatus});
    }
  };

  const deleteLead = (id: string) => {
    if (confirm('בטוח למחוק?')) {
      StorageService.deleteLead(id);
      loadData();
      setSelectedLead(null);
    }
  };

  const saveLeadNote = (leadId: string, notes: string) => {
    StorageService.updateLead(leadId, { notes });
    loadData();
  };
  
  const setFollowUp = (leadId: string, date: string) => {
    StorageService.updateLead(leadId, { nextFollowUp: date });
    loadData();
    if (selectedLead) setSelectedLead({ ...selectedLead, nextFollowUp: date });
  };

  // Product Actions
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      price: Number(newProduct.price),
      description: newProduct.description || '',
      image: newProduct.image || `https://picsum.photos/seed/${encodeURIComponent(newProduct.name)}/200/300`,
      category: newProduct.category || 'kits'
    };
    StorageService.saveProduct(product);
    setNewProduct({});
    loadData();
  };

  // Blog Actions
  const handleAddPost = () => {
    if (!newPost.title || !newPost.content) return;
    const post: BlogPost = {
      id: Date.now().toString(),
      title: newPost.title!,
      content: newPost.content!,
      author: 'Admin',
      date: new Date().toISOString(),
      image: newPost.image || 'https://picsum.photos/800/400',
      pinned: newPost.pinned || false
    };
    StorageService.savePost(post);
    setNewPost({});
    loadData();
  };

  const deletePost = (id: string) => {
    if(confirm('למחוק פוסט זה?')) {
        StorageService.deletePost(id);
        loadData();
    }
  }

  // Settings Action
  const saveSettings = () => {
    StorageService.saveSettings(settings);
    alert('הגדרות נשמרו בהצלחה');
  };

  // Analytics Helpers
  const leadSourceData = [
    { name: 'Google', value: leads.filter(l => l.source === 'google').length + 5 },
    { name: 'Facebook', value: leads.filter(l => l.source === 'facebook').length + 3 },
    { name: 'Direct', value: leads.filter(l => l.source === 'direct' || !l.source).length },
    { name: 'Referral', value: 2 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const revenueData = [
    { name: 'ינואר', uv: 4000 }, { name: 'פברואר', uv: 3000 }, { name: 'מרץ', uv: 2000 },
    { name: 'אפריל', uv: 2780 }, { name: 'מאי', uv: 1890 }, { name: 'יוני', uv: 2390 },
    { name: 'יולי', uv: 3490 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900/90 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl w-full max-w-md space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">גישת מנהל</h2>
            <p className="text-slate-400">הכנס סיסמה לגישה לפאנל הניהול</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="סיסמה (123456)" 
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white text-center text-lg tracking-widest focus:border-blue-500 outline-none transition"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/50">
              כניסה למערכת
            </button>
            <button type="button" onClick={() => navigate('/')} className="w-full text-slate-500 text-sm hover:text-white transition">חזרה לאתר</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex overflow-hidden pt-10 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-slate-800/80 backdrop-blur-md border-l border-white/5 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-white/5">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutDashboard className="text-blue-500" /> המקצוען
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> מחובר (v2.1 Pro)
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
              { id: 'dashboard', label: 'דשבורד ראשי', icon: LayoutDashboard },
              { id: 'crm', label: 'ניהול לידים (CRM)', icon: Users },
              { id: 'marketing', label: 'שיווק וקמפיינים', icon: Megaphone },
              { id: 'products', label: 'ניהול חנות', icon: ShoppingBag },
              { id: 'blog', label: 'ניהול תוכן', icon: FileText },
              { id: 'settings', label: 'הגדרות מערכת', icon: Settings },
          ].map(item => (
            <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)} 
                className={`w-full text-right p-4 rounded-xl flex items-center gap-4 transition-all duration-200 group ${activeTab === item.id ? 'bg-gradient-to-l from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/30 font-bold' : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'}`}
            >
                <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} /> {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5 space-y-2">
            <button onClick={() => navigate('/')} className="w-full p-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl flex items-center gap-3 transition">
                <ArrowLeft size={18} /> חזרה לאתר
            </button>
            <button onClick={logout} className="w-full p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl flex items-center gap-3 transition">
                <LogOut size={18} /> התנתק
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        <div className="p-8 max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">ברוך הבא, דדי</h1>
                        <p className="text-slate-400">סקירה עסקית בזמן אמת</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                             ₪{leads.reduce((acc, curr) => acc + (curr.quote || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500">שווי צנרת לידים כולל</div>
                    </div>
                </header>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-xl hover:border-blue-500/30 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-900/50 rounded-xl text-blue-400"><Users size={24}/></div>
                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">לידים פעילים</h3>
                        <p className="text-3xl font-black text-white">{leads.filter(l => l.status === 'new' || l.status === 'in_progress').length}</p>
                    </div>
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-xl hover:border-purple-500/30 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-900/50 rounded-xl text-purple-400"><TrendingUp size={24}/></div>
                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">+5%</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">יחס המרה</h3>
                        <p className="text-3xl font-black text-white">24.8%</p>
                    </div>
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-xl hover:border-amber-500/30 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-900/50 rounded-xl text-amber-400"><Brain size={24}/></div>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">AI Insights</h3>
                        <p className="text-3xl font-black text-white">128</p>
                    </div>
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-xl hover:border-red-500/30 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-900/50 rounded-xl text-red-400"><AlertTriangle size={24}/></div>
                            <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded-full">דחוף</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium">פולואו-אפ להיום</h3>
                        <p className="text-3xl font-black text-white">3</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <h3 className="text-lg font-bold mb-6">מקורות תנועה ולידים</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {leadSourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5 shadow-xl">
                         <h3 className="text-lg font-bold mb-6">הכנסות חודשיות (משוער)</h3>
                         <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Bar dataKey="uv" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-slate-800/80 p-8 rounded-2xl border border-white/5 shadow-xl h-96">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock size={20} className="text-blue-500" /> תנועה באתר (7 ימים אחרונים)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitsData}>
                    <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="visits" stroke="#3B82F6" strokeWidth={4} dot={{ fill: '#3B82F6', r: 6, strokeWidth: 0 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </motion.div>
            )}

            {activeTab === 'crm' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col relative">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">ניהול קשרי לקוחות</h2>
                        <p className="text-slate-400 text-sm">מערכת Kanban חכמה לניהול הלידים</p>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full max-w-md">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
                        <input
                            type="text"
                            placeholder="חיפוש ליד (שם, טלפון, אימייל)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800/80 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full shadow-lg placeholder-slate-500 transition-all"
                        />
                    </div>
                </div>
                
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-3 gap-6 h-full items-start">
                        {/* CRM Columns */}
                        {[
                            { id: 'new', label: 'לידים חדשים', color: 'red', icon: Users },
                            { id: 'in_progress', label: 'בטיפול / מו"מ', color: 'blue', icon: Phone },
                            { id: 'closed', label: 'עסקאות סגורות', color: 'green', icon: CheckCircle }
                        ].map(col => (
                            <Droppable droppableId={col.id} key={col.id}>
                                {(provided) => (
                                    <div 
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 h-full min-h-[500px]"
                                    >
                                        <div className={`flex items-center gap-2 mb-4 p-2 border-b border-white/5 pb-4`}>
                                            <div className={`p-2 rounded-lg bg-${col.color}-500/10 text-${col.color}-400`}>
                                                <col.icon size={18} />
                                            </div>
                                            <h3 className="font-bold text-slate-200">{col.label}</h3>
                                            <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs ml-auto font-mono text-slate-300">
                                                {filteredLeads.filter(l => l.status === col.id).length}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {filteredLeads.filter(l => l.status === col.id).map((lead, index) => (
                                                <Draggable draggableId={lead.id} index={index} key={lead.id}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedLead(lead)}
                                                            className="bg-slate-700 p-4 rounded-xl border border-white/5 shadow-lg hover:bg-slate-600 transition cursor-pointer group relative overflow-hidden"
                                                            style={{
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${col.color}-500`}></div>
                                                            <div className="flex justify-between items-start mb-2 pl-3">
                                                                <h4 className="font-bold text-white group-hover:text-blue-400 transition">{lead.name}</h4>
                                                                {lead.score !== undefined && (
                                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${lead.score > 70 ? 'bg-green-500/20 text-green-400' : lead.score < 30 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                                        {lead.score}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 mb-3 pl-3 flex items-center gap-2">
                                                                <span>{new Date(lead.createdAt).toLocaleDateString('he-IL')}</span>
                                                                {lead.source && <span className="bg-slate-800 px-1 rounded uppercase text-[10px]">{lead.source}</span>}
                                                            </p>
                                                            <div className="flex justify-between items-center pl-3 border-t border-white/5 pt-3">
                                                                <span className="font-bold text-slate-200">₪{lead.quote}</span>
                                                                {lead.nextFollowUp && new Date(lead.nextFollowUp) <= new Date() && (
                                                                    <div className="text-red-400 animate-pulse" title="דרוש טיפול היום"><AlertTriangle size={14} /></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>

                {/* Lead Details Modal */}
                <AnimatePresence>
                    {selectedLead && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedLead(null)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                                            {selectedLead.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedLead.name}</h2>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <span>{selectedLead.phone}</span> • <span>{selectedLead.email || 'אין מייל'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-slate-700 rounded-full transition"><X /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-lg font-bold mb-4 text-blue-400 border-b border-white/5 pb-2">פרטי הובלה</h3>
                                        <div className="space-y-4 text-sm text-slate-300">
                                            <div className="flex justify-between"><span>תאריך מעבר:</span> <span className="text-white">{selectedLead.date}</span></div>
                                            <div className="flex justify-between"><span>מרחק:</span> <span className="text-white">{selectedLead.distance} ק"מ</span></div>
                                            <div className="flex justify-between"><span>קומה:</span> <span className="text-white">{selectedLead.floor}</span></div>
                                            <div className="flex justify-between"><span>מעלית:</span> <span className="text-white">{selectedLead.elevator ? 'כן' : 'לא'}</span></div>
                                            <div className="flex justify-between"><span>מנוף:</span> <span className="text-white">{selectedLead.crane ? 'כן' : 'לא'}</span></div>
                                            <div className="flex justify-between"><span>אריזה:</span> <span className="text-white">{selectedLead.packing ? 'כן' : 'לא'}</span></div>
                                            <div className="flex justify-between mt-4 text-lg font-bold border-t border-white/5 pt-2">
                                                <span>הצעת מחיר:</span> <span className="text-green-400">₪{selectedLead.quote}</span>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="text-lg font-bold mb-4 text-amber-400 border-b border-white/5 pb-2">תכולה ({selectedLead.volume.toFixed(1)} מ"ק)</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedLead.items.map((item, idx) => (
                                                    <span key={idx} className="bg-slate-800 px-3 py-1 rounded-full text-xs border border-white/5">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                            <h3 className="font-bold mb-3 flex items-center gap-2"><Clock size={16}/> תזכורת מעקב</h3>
                                            <input 
                                                type="date" 
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white mb-2"
                                                value={selectedLead.nextFollowUp || ''}
                                                onChange={(e) => setFollowUp(selectedLead.id, e.target.value)}
                                            />
                                        </div>

                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                            <h3 className="font-bold mb-3 flex items-center gap-2"><FileText size={16}/> הערות פנימיות</h3>
                                            <textarea 
                                                className="w-full h-32 bg-slate-900 border border-slate-700 rounded p-3 text-white text-sm focus:border-blue-500 outline-none resize-none"
                                                placeholder="הוסף הערות לתיק הלקוח..."
                                                value={selectedLead.notes || ''}
                                                onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})}
                                                onBlur={(e) => saveLeadNote(selectedLead.id, e.target.value)}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button onClick={() => moveLead(selectedLead.id, 'in_progress')} className="bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                                <Phone size={16} /> בטיפול
                                            </button>
                                            <button onClick={() => moveLead(selectedLead.id, 'closed')} className="bg-green-600 hover:bg-green-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                                <CheckCircle size={16} /> סגור עסקה
                                            </button>
                                            <button onClick={() => deleteLead(selectedLead.id)} className="col-span-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
                                                <Trash2 size={16} /> מחק תיק
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            )}

            {activeTab === 'marketing' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">מרכז קמפיינים</h2>
                            <p className="text-slate-400">ניהול שיווק ופרסום ממומן</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="חיפוש קמפיין..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-800 border border-white/10 rounded-full py-2 pr-10 pl-4 text-white focus:outline-none focus:border-blue-500 w-48 shadow-inner"
                                />
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20">
                                <Plus size={18} /> קמפיין חדש
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {filteredCampaigns.map(camp => (
                            <div key={camp.id} className="bg-slate-800 rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1 h-full ${camp.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{camp.platform}</div>
                                        <h3 className="text-xl font-bold text-white">{camp.name}</h3>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${camp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                        {camp.status}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-400">תקציב נוצל</span>
                                            <span className="text-white font-bold">{Math.round((camp.spent / camp.budget) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(camp.spent / camp.budget) * 100}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                            <span>₪{camp.spent}</span>
                                            <span>₪{camp.budget}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                                    <div className="text-center">
                                        <div className="text-slate-400 text-xs mb-1">חשיפות</div>
                                        <div className="font-bold text-white">{camp.clicks * 12}</div>
                                    </div>
                                    <div className="text-center border-r border-white/5 border-l">
                                        <div className="text-slate-400 text-xs mb-1">קליקים</div>
                                        <div className="font-bold text-white">{camp.clicks}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-slate-400 text-xs mb-1">לידים</div>
                                        <div className="font-bold text-green-400">{camp.leads}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold mb-4">ROI לפי פלטפורמה</h3>
                         <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={campaigns} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
                                <XAxis type="number" stroke="#64748b" hide />
                                <YAxis dataKey="platform" type="category" stroke="#94a3b8" width={80} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                                <Bar dataKey="leads" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {activeTab === 'products' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold">ניהול חנות</h2>
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="חיפוש מוצר..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-full py-2 pr-10 pl-4 text-white focus:outline-none focus:border-blue-500 w-64 shadow-inner"
                        />
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl mb-8 border border-white/5">
                <h3 className="font-bold mb-4">הוסף מוצר חדש</h3>
                <div className="flex gap-4">
                    <input type="text" placeholder="שם המוצר" className="bg-slate-900 border border-slate-700 rounded p-2 text-white flex-1" onChange={e => setNewProduct({...newProduct, name: e.target.value})} value={newProduct.name || ''} />
                    <select 
                    className="bg-slate-900 border border-slate-700 rounded p-2 text-white w-32" 
                    value={newProduct.category || 'kits'} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                    >
                    <option value="kits">ערכות</option>
                    <option value="boxes">קרטונים</option>
                    <option value="protection">הגנה</option>
                    <option value="tools">כלי עזר</option>
                    </select>
                    <input type="number" placeholder="מחיר" className="bg-slate-900 border border-slate-700 rounded p-2 text-white w-24" onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} value={newProduct.price || ''} />
                    <input type="text" placeholder="URL תמונה" className="bg-slate-900 border border-slate-700 rounded p-2 text-white flex-1" onChange={e => setNewProduct({...newProduct, image: e.target.value})} value={newProduct.image || ''} />
                    <button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded"><Plus /></button>
                </div>
                </div>
                <div className="grid grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                    <div key={p.id} className="bg-slate-800 p-4 rounded-xl border border-white/5 relative group hover:border-blue-500/50 transition">
                    <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-blue-400 font-bold">₪{p.price}</p>
                        <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">{p.category}</span>
                    </div>
                    <button onClick={() => { StorageService.deleteProduct(p.id); loadData(); }} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100 shadow-lg"><Trash2 size={16} /></button>
                    </div>
                ))}
                </div>
             </motion.div>
            )}

            {activeTab === 'blog' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold">ניהול תוכן (בלוג)</h2>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="חיפוש פוסט..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-800 border border-white/10 rounded-full py-2 pr-10 pl-4 text-white focus:outline-none focus:border-blue-500 w-64 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl mb-8 border border-white/5">
                        <h3 className="font-bold mb-4">כתוב פוסט חדש</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input 
                                type="text" 
                                placeholder="כותרת הפוסט" 
                                className="bg-slate-900 border border-slate-700 rounded p-3 text-white" 
                                value={newPost.title || ''} 
                                onChange={e => setNewPost({...newPost, title: e.target.value})} 
                            />
                            <input 
                                type="text" 
                                placeholder="URL תמונה ראשית" 
                                className="bg-slate-900 border border-slate-700 rounded p-3 text-white" 
                                value={newPost.image || ''} 
                                onChange={e => setNewPost({...newPost, image: e.target.value})} 
                            />
                        </div>
                        <textarea 
                            placeholder="תוכן הפוסט..." 
                            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white h-32 mb-4 resize-none" 
                            value={newPost.content || ''} 
                            onChange={e => setNewPost({...newPost, content: e.target.value})} 
                        />
                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                                <input 
                                    type="checkbox" 
                                    checked={newPost.pinned || false} 
                                    onChange={e => setNewPost({...newPost, pinned: e.target.checked})} 
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900" 
                                />
                                נעץ בראש הבלוג
                            </label>
                            <button onClick={handleAddPost} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                                <Plus size={18} /> פרסם מאמר
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBlogPosts.map(post => (
                            <div key={post.id} className="bg-slate-800 rounded-xl overflow-hidden border border-white/5 relative group">
                                <img src={post.image} alt={post.title} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition" />
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg leading-tight">{post.title}</h3>
                                        {post.pinned && <Pin size={16} className="text-amber-400 flex-shrink-0" />}
                                    </div>
                                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">{post.content}</p>
                                    <div className="flex justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-3">
                                        <span>{new Date(post.date).toLocaleDateString('he-IL')}</span>
                                        <span>{post.author}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deletePost(post.id)} 
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition transform scale-90 group-hover:scale-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold mb-8">הגדרות מערכת מתקדמות</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Calculator Settings */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-xl mb-6 text-blue-400 flex items-center gap-2"><Settings size={20} /> תמחור בסיס</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">מחיר בסיס להובלה (₪)</label>
                                <input type="number" value={settings.basePrice} onChange={e => setSettings({...settings, basePrice: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">מחיר לק"מ (₪)</label>
                                    <input type="number" value={settings.pricePerKm} onChange={e => setSettings({...settings, pricePerKm: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">מחיר לקוב (מ"ק)</label>
                                    <input type="number" value={settings.pricePerCbm} onChange={e => setSettings({...settings, pricePerCbm: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">מחיר לחדר (הערכה)</label>
                                    <input type="number" value={settings.pricePerRoom} onChange={e => setSettings({...settings, pricePerRoom: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">מחיר לקומה (ללא מעלית)</label>
                                    <input type="number" value={settings.pricePerFloor} onChange={e => setSettings({...settings, pricePerFloor: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Settings */}
                    <div className="bg-slate-800 p-8 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-xl mb-6 text-amber-400 flex items-center gap-2"><Brain size={20} /> מוח מלאכותי (AI)</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">ספק AI</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['google', 'openai', 'openrouter'] as AIProvider[]).map(provider => (
                                        <button 
                                            key={provider}
                                            onClick={() => setSettings({...settings, aiProvider: provider})}
                                            className={`p-3 rounded-lg border text-sm capitalize transition ${settings.aiProvider === provider ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                                        >
                                            {provider}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">API Key</label>
                                <input 
                                type="password" 
                                value={settings.aiApiKey} 
                                onChange={e => setSettings({...settings, aiApiKey: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-amber-500 outline-none font-mono text-sm" 
                                placeholder="sk-..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">דגם מודל (Model ID)</label>
                                <input 
                                type="text" 
                                value={settings.aiModel} 
                                onChange={e => setSettings({...settings, aiModel: e.target.value})} 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-amber-500 outline-none font-mono text-sm" 
                                placeholder={settings.aiProvider === 'google' ? 'gemini-2.5-flash' : 'gpt-4o'}
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    ברירת מחדל: {settings.aiProvider === 'google' ? 'gemini-2.5-flash' : settings.aiProvider === 'openai' ? 'gpt-3.5-turbo' : 'mistralai/mistral-7b-instruct'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={saveSettings} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 px-12 rounded-xl flex items-center gap-3 shadow-lg shadow-blue-600/30 font-bold text-lg transition transform hover:scale-105">
                        <Save size={20} /> שמור הגדרות מערכת
                    </button>
                </div>
            </motion.div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;