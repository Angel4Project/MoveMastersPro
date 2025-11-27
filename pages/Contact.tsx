
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { AppSettings, InventoryItem, Lead } from '../types';
import { Calculator, Send, Phone, MessageSquare, HelpCircle, ChevronDown, Check, Package, Home, Truck, ShieldCheck, Box, UserPlus, Gift, ArrowUp, ArrowDown, Diamond, AlertTriangle, Paperclip, X, Plus, Monitor, Tv, Minus, Info, Sofa, Armchair, Bed, Table, Computer, Utensils, Lamp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded Mock inventory data for volume calculation
const INVENTORY_PRESETS: { name: string, cbm: number, category: InventoryItem['category'], icon: any }[] = [
  // Furniture - Living Room
  { name: 'ספה 3 מושבים', cbm: 1.5, category: 'furniture', icon: Sofa },
  { name: 'ספה 2 מושבים', cbm: 1.0, category: 'furniture', icon: Sofa },
  { name: 'כורסה', cbm: 0.5, category: 'furniture', icon: Armchair },
  { name: 'מזנון/ויטרינה', cbm: 1.0, category: 'furniture', icon: Box },
  { name: 'שולחן סלון', cbm: 0.4, category: 'furniture', icon: Table },
  { name: 'ספרייה', cbm: 0.8, category: 'furniture', icon: Box },

  // Furniture - Bedroom
  { name: 'מיטה זוגית', cbm: 1.8, category: 'furniture', icon: Bed },
  { name: 'מיטה יחיד', cbm: 1.2, category: 'furniture', icon: Bed },
  { name: 'ארון 2 דלתות', cbm: 1.2, category: 'furniture', icon: Box },
  { name: 'ארון 3-4 דלתות', cbm: 2.4, category: 'furniture', icon: Box },
  { name: 'שידה/קומודה', cbm: 0.6, category: 'furniture', icon: Box },
  { name: 'שידת לילה', cbm: 0.2, category: 'furniture', icon: Box },
  
  // Furniture - Dining / Office
  { name: 'שולחן אוכל', cbm: 0.8, category: 'furniture', icon: Utensils },
  { name: 'כיסא', cbm: 0.2, category: 'furniture', icon: Box }, 
  { name: 'שולחן כתיבה', cbm: 0.5, category: 'furniture', icon: Table },
  
  // Appliances
  { name: 'מקרר רגיל', cbm: 1.0, category: 'appliances', icon: Box },
  { name: 'מקרר כפול', cbm: 1.5, category: 'appliances', icon: Box },
  { name: 'מכונת כביסה', cbm: 0.4, category: 'appliances', icon: Box },
  { name: 'מייבש כביסה', cbm: 0.4, category: 'appliances', icon: Box },
  { name: 'מדיח כלים', cbm: 0.4, category: 'appliances', icon: Box },
  { name: 'תנור אפייה', cbm: 0.3, category: 'appliances', icon: Box },
  { name: 'טלוויזיה', cbm: 0.2, category: 'appliances', icon: Tv },
  { name: 'מחשב נייח', cbm: 0.2, category: 'appliances', icon: Monitor },
  { name: 'מיקרוגל', cbm: 0.1, category: 'appliances', icon: Box },

  // Boxes & Misc
  { name: 'ארגז סטנדרטי', cbm: 0.1, category: 'boxes', icon: Package },
  { name: 'ארגז גדול', cbm: 0.15, category: 'boxes', icon: Package },
  { name: 'אופניים', cbm: 0.5, category: 'tools', icon:  Truck}, 
  { name: 'מנורה עומדת', cbm: 0.2, category: 'furniture', icon: Lamp },
];

// --- 3D Components ---

const Button3D = ({ onClick, icon: Icon, color = "blue", size = "md", disabled = false, className = "" }: any) => {
    const colorStyles: Record<string, string> = {
        blue: 'bg-blue-500 hover:bg-blue-400 border-blue-700',
        red: 'bg-red-500 hover:bg-red-400 border-red-700',
        green: 'bg-green-500 hover:bg-green-400 border-green-700',
        slate: 'bg-slate-600 hover:bg-slate-500 border-slate-800'
    };
    
    const selectedColor = colorStyles[color] || colorStyles.blue;

    return (
        <motion.button
            whileTap={!disabled ? { y: 2 } : {}}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}
            disabled={disabled}
            className={`group relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            <div className={`absolute inset-0 rounded-lg translate-y-1 ${selectedColor.split(' ')[2].replace('border', 'bg')}`}></div>
            <div className={`
                relative rounded-lg p-1 flex items-center justify-center transition-colors border-t border-white/20 shadow-md
                ${selectedColor.split(' ').slice(0,2).join(' ')}
                ${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'}
            `}>
                <Icon size={size === 'sm' ? 14 : 16} className="text-white" />
            </div>
        </motion.button>
    );
};

const Toggle3D = ({ label, checked, onChange, color = "blue", subLabel = "" }: { label: string, checked: boolean, onChange: (val: boolean) => void, color?: string, subLabel?: string }) => {
  const styles = {
    blue: { container: 'bg-blue-900/20 border-blue-500/50', knob: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/30' },
    green: { container: 'bg-green-900/20 border-green-500/50', knob: 'from-green-400 to-green-600', glow: 'shadow-green-500/30' },
    amber: { container: 'bg-amber-900/20 border-amber-500/50', knob: 'from-amber-400 to-amber-600', glow: 'shadow-amber-500/30' },
    red: { container: 'bg-red-900/20 border-red-500/50', knob: 'from-red-400 to-red-600', glow: 'shadow-red-500/30' },
  };

  const theme = styles[color as keyof typeof styles] || styles.blue;

  return (
    <div 
      onClick={() => onChange(!checked)}
      className={`
        relative cursor-pointer group p-4 rounded-2xl border-2 transition-all duration-300
        ${checked 
          ? `${theme.container} shadow-[0_0_15px_rgba(0,0,0,0.2)]` 
          : 'bg-slate-800 border-white/5 hover:border-white/20'
        }
      `}
    >
      <div className="flex justify-between items-center relative z-10">
        <div>
          <span className={`font-bold transition-colors block ${checked ? 'text-white' : 'text-slate-400'}`}>{label}</span>
          {subLabel && <span className="text-xs text-slate-500 block mt-1">{subLabel}</span>}
        </div>
        
        <div className="w-14 h-8 bg-slate-950 rounded-full p-1 shadow-inner border border-white/5 relative flex-shrink-0">
          <motion.div 
            layout
            className={`
              w-6 h-6 rounded-full shadow-lg z-10 relative bg-gradient-to-br
              ${checked ? theme.knob : 'from-slate-400 to-slate-600'}
            `}
            animate={{ x: checked ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
              <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
          </motion.div>
        </div>
      </div>
      {checked && <div className={`absolute inset-0 rounded-2xl opacity-20 pointer-events-none ${theme.glow.replace('shadow-', 'bg-')}`}></div>}
    </div>
  );
};

const Contact: React.FC = () => {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<AppSettings>({
    basePrice: 500, pricePerKm: 15, pricePerRoom: 250, pricePerFloor: 50, pricePerCbm: 100, aiProvider: 'google', aiApiKey: '', aiModel: ''
  });

  const [newItemName, setNewItemName] = useState("");
  
  const [form, setForm] = useState({
    name: '', phone: '', email: '', date: '',
    distance: 15, floor: 1, elevator: false, crane: false, 
    // Packing
    packing: false, 
    premiumPacking: false, 
    packingNotes: '',
    // Fragile
    hasFragileItems: false,
    fragileItemsList: [] as string[],
    fragileNotes: '',
    files: [] as string[],
    // Customer
    isFirstTimeCustomer: false,
    inventory: [] as InventoryItem[],
    // Vehicle
    vehicleType: 'van' as 'van' | 'small_truck' | 'big_truck',
    userSelectedVehicle: false
  });

  const [totalVolume, setTotalVolume] = useState(0);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [recommendedVehicle, setRecommendedVehicle] = useState<'van' | 'small_truck' | 'big_truck'>('van');

  useEffect(() => {
    setSettings(StorageService.getSettings());
  }, []);

  // Determine Recommended Vehicle based on Volume
  useEffect(() => {
    let rec: 'van' | 'small_truck' | 'big_truck' = 'van';
    if (totalVolume > 35) rec = 'big_truck';
    else if (totalVolume > 15) rec = 'small_truck';
    
    setRecommendedVehicle(rec);

    // Auto-select if user hasn't manually overridden
    if (!form.userSelectedVehicle) {
        setForm(prev => ({ ...prev, vehicleType: rec }));
    }
  }, [totalVolume]);

  useEffect(() => {
    const vol = form.inventory.reduce((acc, item) => acc + (item.cbm * item.quantity), 0);
    setTotalVolume(vol);

    let calculated = settings.basePrice;
    calculated += form.distance * settings.pricePerKm;
    
    if (vol > 0) {
        calculated += vol * settings.pricePerCbm;
    }

    if (!form.elevator) {
        calculated += (form.floor * settings.pricePerFloor) * (vol > 5 ? 1.5 : 1);
    }

    if (form.crane) calculated += 400;
    
    // Packing Logic
    if (form.packing) {
        calculated += (vol / 0.1) * 20; // Volume based packing
        if (form.premiumPacking) {
            calculated += 200; // Flat fee for premium
        }
    }

    // Fragile Items Logic
    if (form.hasFragileItems) {
        calculated += 150; // Base handling fee
        calculated += form.fragileItemsList.length * 50; // Per item fee
    }

    // Vehicle Surcharge logic (Simulated)
    // If user selects a vehicle larger than recommended, add surcharge
    if (form.vehicleType === 'big_truck' && recommendedVehicle !== 'big_truck') calculated += 400;
    if (form.vehicleType === 'small_truck' && recommendedVehicle === 'van') calculated += 200;

    setOriginalPrice(Math.round(calculated));

    if (form.isFirstTimeCustomer) {
        calculated = calculated * 0.95;
    }

    setPrice(Math.round(calculated));
  }, [form, settings, recommendedVehicle]);

  const updateInventory = (itemName: string, delta: number) => {
    setForm(prev => {
      const existing = prev.inventory.find(i => i.name === itemName);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return { ...prev, inventory: prev.inventory.filter(i => i.name !== itemName) };
        return { ...prev, inventory: prev.inventory.map(i => i.name === itemName ? { ...i, quantity: newQty } : i) };
      } else if (delta > 0) {
        const preset = INVENTORY_PRESETS.find(p => p.name === itemName);
        if (!preset) return prev;
        return { ...prev, inventory: [...prev.inventory, { id: itemName, name: itemName, quantity: 1, cbm: preset.cbm, category: preset.category }] };
      }
      return prev;
    });
  };

  const addFragileItem = () => {
    if (newItemName.trim()) {
        setForm(prev => ({ ...prev, fragileItemsList: [...prev.fragileItemsList, newItemName.trim()] }));
        setNewItemName("");
    }
  };

  const removeFragileItem = (index: number) => {
    setForm(prev => ({ ...prev, fragileItemsList: prev.fragileItemsList.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        // @ts-ignore
        const fileNames = Array.from(e.target.files).map((f: File) => f.name);
        setForm(prev => ({ ...prev, files: [...prev.files, ...fileNames] }));
    }
  };

  const selectVehicle = (type: 'van' | 'small_truck' | 'big_truck') => {
      setForm(prev => ({ ...prev, vehicleType: type, userSelectedVehicle: true }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: Date.now().toString(),
      ...form,
      rooms: 0,
      quote: price,
      volume: totalVolume,
      status: 'new',
      items: form.inventory,
      createdAt: Date.now()
    };
    StorageService.saveLead(lead);

    const vehicleNames = { van: 'טנדר גדול', small_truck: 'משאית 7.5 טון', big_truck: 'משאית 12 טון' };

    let msg = `היי דדי, קיבלתי הצעת מחיר באתר.
שם: ${form.name}
נפח: ${totalVolume.toFixed(1)} קו"ב
רכב מבוקש: ${vehicleNames[form.vehicleType]}
מחיר משוער: ₪${price} ${form.isFirstTimeCustomer ? '(כולל הנחת לקוח חדש)' : ''}
----------------
פרטים טכניים:
• קומה: ${form.floor} (${form.elevator ? 'עם מעלית' : 'ללא מעלית'})
• מנוף: ${form.crane ? 'כן' : 'לא'}
----------------
שירותים נוספים:
• אריזה: ${form.packing ? 'כן' : 'לא'} ${form.premiumPacking ? '(פרימיום)' : ''}
${form.packingNotes ? `• הערות אריזה: ${form.packingNotes}` : ''}
----------------
פריטים שבירים (${form.fragileItemsList.length}):
${form.hasFragileItems ? form.fragileItemsList.map(i => `- ${i}`).join('\n') : 'ללא'}
${form.fragileNotes ? `• הערות שבירים: ${form.fragileNotes}` : ''}
${form.files.length > 0 ? `• מצורפים ${form.files.length} קבצים/תמונות` : ''}`;

    window.open(`https://wa.me/972505350148?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const vehicleInfo = {
      van: { label: 'טנדר גדול', cap: 'עד 15 מ"ק', icon: Truck },
      small_truck: { label: 'משאית 7.5 טון', cap: '15-35 מ"ק', icon: Truck },
      big_truck: { label: 'משאית 12 טון', cap: '35+ מ"ק', icon: Truck },
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 bg-slate-900 text-white overflow-hidden perspective-1000">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Progress Bar */}
        <div className="mb-12">
            <div className="flex justify-between mb-4 px-4 text-sm font-bold text-slate-400">
                <span className={step >= 1 ? 'text-blue-400' : ''}>פרטים</span>
                <span className={step >= 2 ? 'text-blue-400' : ''}>תכולה</span>
                <span className={step >= 3 ? 'text-blue-400' : ''}>גישה</span>
                <span className={step >= 4 ? 'text-blue-400' : ''}>סיכום</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 relative"
                >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                </motion.div>
            </div>
        </div>

        {/* 3D Container */}
        <div className="relative min-h-[600px]">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, rotateX: -10, y: 50 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        exit={{ opacity: 0, rotateX: 10, y: -50 }}
                        transition={{ duration: 0.4 }}
                        className="bg-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] absolute w-full"
                    >
                        <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-white">
                            <Truck className="text-blue-500" strokeWidth={3} /> פרטים אישיים
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-slate-400 font-bold text-sm">שם מלא</label>
                                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="ישראל ישראלי" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-slate-400 font-bold text-sm">טלפון</label>
                                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="050..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-slate-400 font-bold text-sm">תאריך מעבר</label>
                                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-xl p-4 focus:border-blue-500 outline-none text-slate-300 shadow-inner" />
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner flex flex-col justify-between">
                                <label className="flex justify-between text-slate-400 font-bold text-sm mb-4">
                                    <span>מרחק נסיעה</span>
                                    <span className="text-blue-400 text-lg font-mono">{form.distance} ק"מ</span>
                                </label>
                                
                                <div className="h-40 flex items-center justify-center relative perspective-500">
                                    <div className="w-full h-6 bg-slate-800 rounded-full relative overflow-hidden border-b border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-600 transform -translate-y-1/2" style={{ backgroundImage: 'linear-gradient(to right, transparent 50%, #475569 50%)', backgroundSize: '20px 100%' }}></div>
                                    </div>
                                    <input type="range" min="1" max="200" value={form.distance} onChange={e => setForm({...form, distance: Number(e.target.value)})} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
                                    <motion.div className="absolute top-1/2 z-10 pointer-events-none" style={{ left: `${((form.distance - 1) / 199) * 100}%` }} animate={{ x: '-50%', y: '-50%' }}>
                                        <div className="relative group">
                                            <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-xl border-t border-blue-400 relative z-10 transform -skew-x-6">
                                                <div className="absolute right-2 top-2 w-4 h-6 bg-blue-900/50 rounded-sm"></div>
                                                <div className="absolute bottom-1 left-1 font-bold text-[8px] text-white/50 tracking-widest">DEDI</div>
                                            </div>
                                            <div className="absolute -bottom-2 left-2 w-4 h-4 bg-slate-900 rounded-full border-2 border-slate-700 shadow-lg z-20"></div>
                                            <div className="absolute -bottom-2 right-2 w-4 h-4 bg-slate-900 rounded-full border-2 border-slate-700 shadow-lg z-20"></div>
                                        </div>
                                    </motion.div>
                                </div>
                                <p className="text-center text-xs text-slate-500">גרור את המשאית כדי לשנות מרחק</p>
                            </div>
                        </div>
                        <div className="mt-12 flex justify-end">
                            <button onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/50 transition transform hover:scale-105">
                                המשך לתכולה <ChevronDown className="rotate-90" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] absolute w-full h-[650px] flex flex-col"
                    >
                         <h2 className="text-3xl font-black mb-2 flex items-center gap-3 text-white">
                            <Package className="text-amber-400" /> בחירת תכולה
                         </h2>
                         <p className="text-slate-400 mb-6">השתמש בכפתורים להוספת פריטים למשאית הווירטואלית</p>
                         
                         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-20">
                                {INVENTORY_PRESETS.map((item, idx) => {
                                    const count = form.inventory.find(i => i.name === item.name)?.quantity || 0;
                                    return (
                                        <motion.div 
                                            key={idx}
                                            whileHover={{ y: -5 }}
                                            className={`
                                                relative p-3 rounded-2xl border-2 transition-all duration-300 group select-none
                                                flex flex-col items-center justify-between text-center aspect-[4/5]
                                                ${count > 0 
                                                    ? 'bg-gradient-to-b from-slate-700 to-slate-800 border-blue-500/50 shadow-xl' 
                                                    : 'bg-slate-800/50 border-white/5 hover:border-white/20 hover:bg-slate-700/50'
                                                }
                                            `}
                                        >
                                            <AnimatePresence>
                                                {count > 0 && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold shadow-lg z-10">
                                                        {count} יח'
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className={`flex-1 w-full flex items-center justify-center ${count > 0 ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                <item.icon size={36} strokeWidth={1.5} />
                                            </div>
                                            <div className="w-full mb-3">
                                                <div className={`font-bold text-sm leading-tight ${count > 0 ? 'text-white' : 'text-slate-400'}`}>{item.name}</div>
                                                <div className="text-[10px] text-slate-500">{item.cbm} מ"ק</div>
                                            </div>
                                            <div className="w-full flex items-center justify-center gap-2 mt-auto">
                                                <Button3D onClick={() => updateInventory(item.name, -1)} icon={Minus} color="slate" size="sm" disabled={count === 0} />
                                                <div className="w-6 text-center font-mono font-bold text-lg">{count}</div>
                                                <Button3D onClick={() => updateInventory(item.name, 1)} icon={Plus} color="blue" size="sm" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                         </div>
                         
                        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 rounded-b-[2rem] flex items-center gap-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400 font-bold">נפח העמסה</span>
                                    <span className="text-white font-bold">{totalVolume.toFixed(1)} מ"ק</span>
                                </div>
                                <div className="h-5 bg-slate-950 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-300"
                                        animate={{ width: `${Math.min((totalVolume / 40) * 100, 100)}%` }} 
                                    />
                                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.1) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.1) 50%,rgba(0,0,0,.1) 75%,transparent 75%,transparent)', backgroundSize: '10px 10px' }}></div>
                                </div>
                            </div>
                            <div className="text-right min-w-[120px]">
                                <div className="text-xs text-slate-500">רכב מומלץ</div>
                                <div className="text-sm font-bold text-blue-400 flex items-center justify-end gap-2">
                                    {vehicleInfo[recommendedVehicle].label} <Truck size={14} />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={prevStep} className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition">חזור</button>
                                <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/50">
                                    המשך
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.4 }}
                        className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] absolute w-full overflow-y-auto max-h-[80vh] custom-scrollbar"
                    >
                         <h2 className="text-3xl font-black mb-8 flex items-center gap-3 text-white"><Home className="text-green-400"/> גישה ולוגיסטיקה</h2>
                         
                         <div className="flex flex-col gap-8">
                             {/* Floor Selector & Toggles */}
                             <div className="flex flex-col md:flex-row gap-12">
                                <div className="md:w-1/3 bg-slate-900/50 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
                                    <label className="text-slate-400 font-bold mb-4">קומה (ממוצעת)</label>
                                    <div className="h-64 w-24 relative perspective-500 flex justify-center my-4">
                                        <div className="absolute inset-y-0 w-20 bg-slate-800 border-x-2 border-slate-700/50 rounded-lg flex flex-col justify-between py-2 items-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                                            {[...Array(8)].map((_, i) => <div key={i} className="w-12 h-[1px] bg-slate-700/50"></div>)}
                                        </div>
                                        <input type="range" min="0" max="20" 
                                            // @ts-ignore
                                            orient="vertical" value={form.floor} onChange={e => setForm({...form, floor: Number(e.target.value)})} className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20" style={{ writingMode: 'vertical-lr', WebkitAppearance: 'slider-vertical' }} 
                                        />
                                        <motion.div className="absolute z-10 w-24 h-16 pointer-events-none" style={{ bottom: `${(form.floor / 20) * 100}%` }} animate={{ y: '50%' }}>
                                            <div className="w-full h-full bg-slate-700 rounded-xl border-t border-white/20 shadow-2xl relative flex items-center justify-center transform preserve-3d">
                                                <div className="absolute inset-1 flex overflow-hidden rounded-lg border border-black/30">
                                                    <div className="w-1/2 h-full bg-gradient-to-r from-slate-500 to-slate-600 border-r border-slate-800"></div>
                                                    <div className="w-1/2 h-full bg-gradient-to-l from-slate-500 to-slate-600"></div>
                                                </div>
                                                <div className="absolute -top-8 bg-green-500 text-slate-900 font-black px-3 py-1 rounded-lg text-sm shadow-lg border-b-2 border-green-700">קומה {form.floor}</div>
                                            </div>
                                        </motion.div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-6 text-center">גרור את המעלית</p>
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <Toggle3D label="יש מעלית (בשני הצדדים)" checked={form.elevator} onChange={(v) => setForm({...form, elevator: v})} />
                                        <Toggle3D label="נדרש מנוף הרמה (+₪400)" checked={form.crane} onChange={(v) => setForm({...form, crane: v})} color="amber" />
                                        <Toggle3D label="שירותי אריזה (VIP)" checked={form.packing} onChange={(v) => { setForm(prev => ({ ...prev, packing: v, premiumPacking: v ? prev.premiumPacking : false })) }} color="green" />
                                        <AnimatePresence>
                                            {form.packing && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-900/30 rounded-b-2xl border-x border-b border-white/5 p-4 mx-2">
                                                    <div className="pl-4 border-r-2 border-green-500/20 space-y-4">
                                                        <div className="relative">
                                                            <Toggle3D label="אריזת פרימיום (+₪200)" subLabel="הגנה מיוחדת לחפצים יקרי ערך וזכוכיות" checked={form.premiumPacking} onChange={(v) => setForm({...form, premiumPacking: v})} color="amber" />
                                                            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-slate-900 rounded-full p-1 border border-amber-500/30"><Diamond size={14} className="text-amber-400" /></div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-slate-400">הערות לאריזה</label>
                                                            <textarea value={form.packingNotes} onChange={(e) => setForm({...form, packingNotes: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm focus:border-green-500/50 outline-none resize-none" placeholder="לדוגמה: נא להיזהר על הארון..." rows={2} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <Toggle3D label="יש פריטים שבירים?" checked={form.hasFragileItems} onChange={(v) => setForm({...form, hasFragileItems: v})} color="red" subLabel="תוספת ביטוח וטיפול מיוחד (+₪150)" />
                                        <AnimatePresence>
                                            {form.hasFragileItems && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-900/30 rounded-b-2xl border-x border-b border-white/5 p-4 mx-2">
                                                    <div className="pl-4 border-r-2 border-red-500/20 space-y-4">
                                                        <div className="flex gap-2 mb-3">
                                                            <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFragileItem()} placeholder="הוסף פריט שביר..." className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-red-500/50 outline-none" />
                                                            <Button3D onClick={addFragileItem} icon={Plus} color="red" />
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">{form.fragileItemsList.map((item, i) => (<motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-900/30 border border-red-500/30 text-red-200 text-xs px-2 py-1 rounded-lg flex items-center gap-2">{item}<button onClick={() => removeFragileItem(i)} className="hover:text-white"><X size={12} /></button></motion.span>))}</div>
                                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition relative overflow-hidden group">
                                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 group-hover:text-blue-400 transition-colors"><Paperclip size={20} className="mb-2" /><p className="text-xs">העלאת תמונות</p></div>
                                                            <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                                                        </label>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                             </div>

                             {/* Vehicle Selection Section */}
                             <div className="border-t border-white/10 pt-8">
                                <h3 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                                    <Truck size={20} className="text-blue-400" /> בחירת רכב
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(['van', 'small_truck', 'big_truck'] as const).map((vType) => {
                                        const info = vehicleInfo[vType];
                                        const isSelected = form.vehicleType === vType;
                                        const isRecommended = recommendedVehicle === vType;
                                        const isTooSmall = vType === 'van' && recommendedVehicle === 'small_truck' || vType !== 'big_truck' && recommendedVehicle === 'big_truck';

                                        return (
                                            <div 
                                                key={vType}
                                                onClick={() => selectVehicle(vType)}
                                                className={`
                                                    relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden
                                                    ${isSelected ? 'bg-blue-900/20 border-blue-500 shadow-lg' : 'bg-slate-800 border-white/5 hover:border-white/20'}
                                                `}
                                            >
                                                {isRecommended && (
                                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">
                                                        מומלץ למערכת
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start mb-2">
                                                    <info.icon size={24} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
                                                    {isSelected && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                                                </div>
                                                <div className="font-bold text-white mb-1">{info.label}</div>
                                                <div className="text-xs text-slate-400">{info.cap}</div>
                                                
                                                {isTooSmall && (
                                                    <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1 bg-amber-900/20 p-1 rounded">
                                                        <AlertTriangle size={10} /> אולי קטן מדי
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <Info size={12} /> בחירת רכב גדול מהמומלץ עשויה לגרור תוספת תשלום (תוספת תפעולית).
                                </p>
                             </div>

                             {/* First Time Customer */}
                             <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-1 rounded-2xl border border-purple-500/30">
                                <label className="flex items-center justify-between p-3 cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${form.isFirstTimeCustomer ? 'bg-purple-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}>
                                            <Gift size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">לקוח חדש?</div>
                                            <div className="text-xs text-purple-300">קבל 5% הנחה מיידית!</div>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={form.isFirstTimeCustomer} onChange={e => setForm({...form, isFirstTimeCustomer: e.target.checked})} />
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${form.isFirstTimeCustomer ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFirstTimeCustomer ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>
                             </div>
                         </div>

                         <div className="mt-8 flex justify-between">
                            <button onClick={prevStep} className="text-slate-400 hover:text-white px-6 py-2">חזור</button>
                            <button onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/50 transition transform hover:scale-105">
                                סיכום וחישוב <ChevronDown className="rotate-90" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.2)] absolute w-full text-center"
                    >
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} 
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/40 border-4 border-slate-800"
                        >
                            <Check size={48} className="text-white" strokeWidth={3} />
                        </motion.div>
                        
                        <h2 className="text-4xl font-black mb-2 text-white">הצעת המחיר מוכנה!</h2>
                        <p className="text-slate-400 mb-8">הנה הסיכום המשוער עבור ההובלה שלך</p>

                        <div className="bg-slate-900/80 p-8 rounded-3xl max-w-lg mx-auto border border-white/10 mb-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 animate-gradient-x"></div>
                            <div className="text-sm text-slate-500 mb-2 uppercase tracking-widest font-bold">סה"כ לתשלום (משוער)</div>
                            
                            <div className="flex flex-col items-center justify-center gap-1 relative z-10">
                                {form.isFirstTimeCustomer && (
                                    <div className="text-xl text-slate-500 line-through decoration-red-500 decoration-2">
                                        ₪{originalPrice}
                                    </div>
                                )}
                                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-sm">
                                    ₪{price}
                                </div>
                                {form.isFirstTimeCustomer && (
                                    <motion.div 
                                        initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                        className="text-xs text-green-900 font-bold bg-green-400 px-3 py-1 rounded-full mt-2 flex items-center gap-1 shadow-lg shadow-green-500/20"
                                    >
                                        <Gift size={12} /> כולל 5% הנחת לקוח חדש
                                    </motion.div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400 mb-8">
                             <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5"><Truck size={14} className="text-blue-500" /> {vehicleInfo[form.vehicleType].label}</div>
                             <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5"><Package size={14} className="text-amber-500" /> {totalVolume.toFixed(1)} מ"ק</div>
                             <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-white/5"><ShieldCheck size={14} className="text-green-500" /> ביטוח כלול</div>
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl text-xs text-blue-200 mb-8 max-w-lg mx-auto">
                            <Info size={14} className="inline-block ml-1 mb-0.5" />
                            שים לב: המחיר הינו הערכה בלבד. המחיר הסופי ייקבע לאחר שיחה עם דדי ותיאום ציפיות מלא. בחירת רכב שאינו תואם את הנפח עלולה לגרור עלויות נוספות.
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={prevStep} className="text-slate-400 hover:text-white px-6">ערוך פרטים</button>
                            <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-600/30 flex items-center gap-3 transform hover:scale-105 transition ring-4 ring-green-500/20">
                                <Send size={20} /> שלח הזמנה לווטסאפ
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Contact;
