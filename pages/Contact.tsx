import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from '../services/storage';
import { AppSettings, InventoryItem, Lead } from '../types';
import { Calculator, Send, Phone, MessageSquare, HelpCircle, ChevronDown, Check, Package, Home, Truck, ShieldCheck, Box, UserPlus, Gift, ArrowUp, ArrowDown, Diamond, AlertTriangle, Paperclip, X, Plus, Monitor, Tv, Minus, Info, Sofa, Armchair, Bed, Table, Computer, Utensils, Lamp, RotateCcw, Zap, Volume2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { getTranslation, getCurrentLanguage } from '../src/translations';

// Revolutionary 3D Truck Component - Mobile Optimized
const Truck3DVisualization = ({ volume, maxVolume = 40, selectedItems = [] }: {
  volume: number;
  maxVolume?: number;
  selectedItems?: InventoryItem[];
}) => {
  const fillPercentage = Math.min((volume / maxVolume) * 100, 100);
  const rotationX = useMotionValue(15);
  const rotationY = useMotionValue(-15);

  // Generate 3D boxes based on selected items
  const generateBoxes = useCallback(() => {
    const boxes: any[] = [];
    let currentVolume = 0;

    selectedItems.forEach((item, index) => {
      const itemVolume = item.cbm * item.quantity;
      if (itemVolume === 0) return;

      const boxHeight = Math.max(0.3, Math.min(1.5, itemVolume / 2));
      const boxWidth = Math.max(0.3, Math.min(1.5, itemVolume / 1.5));
      const boxDepth = Math.max(0.3, Math.min(1.5, itemVolume / 1.2));

      // Position boxes in 3D space - optimized for mobile
      const x = (index % 3 - 1) * 1.2;
      const z = Math.floor(index / 3) * 0.8;
      const y = currentVolume / maxVolume * 1.5;

      boxes.push({
        id: item.id,
        x, y, z,
        width: boxWidth,
        height: boxHeight,
        depth: boxDepth,
        color: item.category === 'furniture' ? '#3b82f6' :
               item.category === 'appliances' ? '#ef4444' :
               item.category === 'boxes' ? '#f59e0b' : '#10b981',
        name: item.name
      });

      currentVolume += itemVolume;
    });

    return boxes;
  }, [selectedItems, maxVolume]);

  const boxes = generateBoxes();

  return (
    <div className="relative w-full h-48 sm:h-64 perspective-1000 touch-manipulation">
      <motion.div
        className="w-full h-full relative"
        style={{
          transformStyle: 'preserve-3d',
          rotateX: rotationX,
          rotateY: rotationY,
        }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => {
          rotationY.set(rotationY.get() + info.delta.x * 0.3);
          rotationX.set(rotationX.get() - info.delta.y * 0.3);
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Truck Body - Simplified for mobile */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Truck Bed */}
          <motion.div
            className="relative bg-gradient-to-b from-slate-600 to-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl"
            style={{
              width: '200px',
              height: '80px',
              transform: 'translateZ(15px)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Truck Cab */}
            <div
              className="absolute -left-12 top-1 bg-gradient-to-b from-blue-600 to-blue-800 border-2 border-blue-700 rounded-lg shadow-xl"
              style={{
                width: '45px',
                height: '60px',
                transform: 'translateZ(8px)',
              }}
            />

            {/* Wheels - Simplified */}
            <div className="absolute -bottom-3 left-2 w-6 h-6 bg-slate-900 border-3 border-slate-700 rounded-full" />
            <div className="absolute -bottom-3 right-2 w-6 h-6 bg-slate-900 border-3 border-slate-700 rounded-full" />
            <div className="absolute -bottom-3 left-12 w-6 h-6 bg-slate-900 border-3 border-slate-700 rounded-full" />
            <div className="absolute -bottom-3 right-12 w-6 h-6 bg-slate-900 border-3 border-slate-700 rounded-full" />

            {/* Loading Area Fill */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/80 to-blue-400/60 rounded-b-md"
              style={{
                height: `${fillPercentage * 0.7}%`,
              }}
              animate={{ height: `${fillPercentage * 0.7}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* 3D Boxes - Optimized for mobile */}
            {boxes.slice(0, 6).map((box: any, index: number) => (
              <motion.div
                key={box.id}
                className="absolute border border-white/20 rounded-sm"
                style={{
                  width: `${box.width * 15}px`,
                  height: `${box.height * 15}px`,
                  backgroundColor: box.color,
                  transform: `translate3d(${box.x * 15 + 100}px, ${60 - box.y * 15 - box.height * 15}px, ${box.z * 8}px)`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                title={box.name}
              >
                {/* Simple 3D effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-sm" />
              </motion.div>
            ))}

            {/* Volume Indicator */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white px-2 py-1 rounded text-xs font-bold border border-slate-700">
              {volume.toFixed(1)} / {maxVolume} מ"ק
            </div>
          </motion.div>
        </div>

        {/* Mobile-friendly instructions */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 text-center">
          {fillPercentage.toFixed(0)}% מלא
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Mobile-Optimized Inventory Grid
const InventoryGrid = ({ inventory, onUpdate }: {
  inventory: InventoryItem[];
  onUpdate: (name: string, delta: number) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'הכל', icon: Package },
    { key: 'furniture', label: 'ריהוט', icon: Sofa },
    { key: 'appliances', label: 'חשמל', icon: Tv },
    { key: 'boxes', label: 'ארגזים', icon: Box },
  ];

  const filteredItems = INVENTORY_PRESETS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="חיפוש פריטים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all"
          />
          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <cat.icon size={16} />
              <span className="text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item, idx) => {
          const count = inventory.find(i => i.name === item.name)?.quantity || 0;

          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none
                flex flex-col items-center justify-between text-center min-h-[120px]
                ${count > 0
                  ? 'bg-gradient-to-b from-blue-600/20 to-blue-700/20 border-blue-500/50 shadow-lg'
                  : 'bg-slate-800/50 border-slate-600/50 hover:border-slate-500/70'
                }
              `}
              onClick={() => onUpdate(item.name, 1)}
            >
              <AnimatePresence>
                {count > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-slate-900"
                  >
                    {count}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex-1 w-full flex items-center justify-center mb-2 ${count > 0 ? 'text-blue-300' : 'text-slate-400'}`}>
                <item.icon size={28} strokeWidth={1.5} />
              </div>

              <div className="w-full">
                <div className={`font-semibold text-xs leading-tight mb-1 ${count > 0 ? 'text-white' : 'text-slate-300'}`}>
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {item.cbm} מ"ק
                </div>
              </div>

              {/* Quick Controls */}
              <div className="flex items-center gap-1 mt-2 w-full justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(item.name, -1); }}
                  className="w-6 h-6 bg-red-600/80 hover:bg-red-600 rounded flex items-center justify-center transition-colors"
                  disabled={count === 0}
                >
                  <Minus size={12} className="text-white" />
                </button>
                <span className="text-xs font-bold text-white min-w-[20px] text-center">{count}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(item.name, 1); }}
                  className="w-6 h-6 bg-green-600/80 hover:bg-green-600 rounded flex items-center justify-center transition-colors"
                >
                  <Plus size={12} className="text-white" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p>לא נמצאו פריטים</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Mobile-Optimized Components
const FloatingButton = ({ onClick, icon: Icon, label, color = "blue", disabled = false }: {
  onClick: () => void;
  icon: any;
  label: string;
  color?: string;
  disabled?: boolean;
}) => {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30',
    green: 'bg-green-600 hover:bg-green-500 shadow-green-500/30',
    red: 'bg-red-600 hover:bg-red-500 shadow-red-500/30',
    amber: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30',
    slate: 'bg-slate-600 hover:bg-slate-500 shadow-slate-500/30',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300
        ${colors[color as keyof typeof colors] || colors.blue}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </motion.button>
  );
};

const SmartToggle = ({ label, checked, onChange, color = "blue", subLabel = "", icon: Icon }: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  color?: string;
  subLabel?: string;
  icon?: any;
}) => {
  const colors = {
    blue: { bg: 'bg-blue-600', border: 'border-blue-500', glow: 'shadow-blue-500/20' },
    green: { bg: 'bg-green-600', border: 'border-green-500', glow: 'shadow-green-500/20' },
    amber: { bg: 'bg-amber-600', border: 'border-amber-500', glow: 'shadow-amber-500/20' },
    red: { bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-red-500/20' },
    purple: { bg: 'bg-purple-600', border: 'border-purple-500', glow: 'shadow-purple-500/20' },
  };

  const theme = colors[color as keyof typeof colors] || colors.blue;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onChange(!checked)}
      className={`
        relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden
        ${checked
          ? `${theme.bg} text-white border-transparent ${theme.glow} shadow-lg`
          : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-500'
        }
      `}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className={checked ? 'text-white' : 'text-slate-400'} />}
          <div>
            <span className="font-semibold block">{label}</span>
            {subLabel && <span className="text-xs opacity-80 block mt-1">{subLabel}</span>}
          </div>
        </div>

        <motion.div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            checked ? 'bg-white border-white' : 'border-slate-400'
          }`}
          animate={{ scale: checked ? 1.1 : 1 }}
        >
          {checked && <Check size={14} className="text-blue-600" />}
        </motion.div>
      </div>

      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
};

// Expanded inventory data
const INVENTORY_PRESETS: { name: string, cbm: number, category: InventoryItem['category'], icon: any }[] = [
  // ריהוט סלון
  { name: 'ספה 3 מושבים', cbm: 1.5, category: 'furniture', icon: Sofa },
  { name: 'ספה 2 מושבים', cbm: 1.0, category: 'furniture', icon: Sofa },
  { name: 'כורסה', cbm: 0.5, category: 'furniture', icon: Armchair },
  { name: 'מזנון/ויטרינה', cbm: 1.0, category: 'furniture', icon: Box },
  { name: 'שולחן סלון', cbm: 0.4, category: 'furniture', icon: Table },
  { name: 'ספרייה', cbm: 0.8, category: 'furniture', icon: Box },
  { name: 'שולחן אוכל', cbm: 0.8, category: 'furniture', icon: Utensils },
  { name: 'כיסא', cbm: 0.2, category: 'furniture', icon: Box },

  // ריהוט חדר שינה
  { name: 'מיטה זוגית', cbm: 1.8, category: 'furniture', icon: Bed },
  { name: 'מיטה יחיד', cbm: 1.2, category: 'furniture', icon: Bed },
  { name: 'ארון 2 דלתות', cbm: 1.2, category: 'furniture', icon: Box },
  { name: 'ארון 3-4 דלתות', cbm: 2.4, category: 'furniture', icon: Box },
  { name: 'שידה/קומודה', cbm: 0.6, category: 'furniture', icon: Box },
  { name: 'שידת לילה', cbm: 0.2, category: 'furniture', icon: Box },

  // ריהוט משרד
  { name: 'שולחן כתיבה', cbm: 0.5, category: 'furniture', icon: Table },
  { name: 'כיסא משרדי', cbm: 0.3, category: 'furniture', icon: Box },

  // מכשירי חשמל
  { name: 'מקרר רגיל', cbm: 1.0, category: 'appliances', icon: Box },
  { name: 'מקרר כפול', cbm: 1.5, category: 'appliances', icon: Box },
  { name: 'מכונת כביסה', cbm: 0.4, category: 'appliances', icon: Box },
  { name: 'מייבש כביסה', cbm: 0.4, category: 'appliances', icon: Box },
  { name: 'מדיח כלים', cbm: 0.4, category: 'appliances', icon: Box },
  { name: 'תנור אפייה', cbm: 0.3, category: 'appliances', icon: Box },
  { name: 'מיקרוגל', cbm: 0.1, category: 'appliances', icon: Box },
  { name: 'טלוויזיה', cbm: 0.2, category: 'appliances', icon: Tv },
  { name: 'מחשב נייח', cbm: 0.2, category: 'appliances', icon: Monitor },

  // ארגזים וכלי עזר
  { name: 'ארגז סטנדרטי', cbm: 0.1, category: 'boxes', icon: Package },
  { name: 'ארגז גדול', cbm: 0.15, category: 'boxes', icon: Package },
  { name: 'אופניים', cbm: 0.5, category: 'tools', icon: Truck },
  { name: 'מנורה עומדת', cbm: 0.2, category: 'furniture', icon: Lamp },
];

// Main Contact Component - Mobile First
const Contact: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentLanguage] = useState(getCurrentLanguage());
  const [settings, setSettings] = useState<AppSettings>({
    basePrice: 500, pricePerKm: 15, pricePerRoom: 250, pricePerFloor: 50, pricePerCbm: 100, aiProvider: 'google', aiApiKey: '', aiModel: ''
  });

  const [formData, setFormData] = useState({
    // Personal Info
    name: '', phone: '', email: '', date: '',
    distance: 15,

    // Access & Logistics
    floor: 1, elevator: false, crane: false,

    // Services
    packing: false, premiumPacking: false, packingNotes: '',
    hasFragileItems: false, fragileItemsList: [] as string[], fragileNotes: '',
    files: [] as string[],

    // Customer
    isFirstTimeCustomer: false,

    // Inventory
    inventory: [] as InventoryItem[],

    // Vehicle
    vehicleType: 'van' as 'van' | 'small_truck' | 'big_truck',
    userSelectedVehicle: false
  });

  const [calculations, setCalculations] = useState({
    totalVolume: 0,
    price: 0,
    originalPrice: 0,
    recommendedVehicle: 'van' as 'van' | 'small_truck' | 'big_truck'
  });

  // Initialize settings
  useEffect(() => {
    setSettings(StorageService.getSettings());
  }, []);

  // Advanced calculation engine
  useEffect(() => {
    const vol = formData.inventory.reduce((acc, item) => acc + (item.cbm * item.quantity), 0);

    // Determine recommended vehicle
    let rec: 'van' | 'small_truck' | 'big_truck' = 'van';
    if (vol > 35) rec = 'big_truck';
    else if (vol > 15) rec = 'small_truck';

    // Auto-select vehicle if not manually chosen
    if (!formData.userSelectedVehicle) {
      setFormData(prev => ({ ...prev, vehicleType: rec }));
    }

    // Advanced pricing calculation
    let calculated = settings.basePrice;
    calculated += formData.distance * settings.pricePerKm;

    if (vol > 0) {
      calculated += vol * settings.pricePerCbm;
    }

    // Floor access costs
    if (!formData.elevator) {
      const floorMultiplier = vol > 5 ? 1.5 : 1;
      calculated += (formData.floor * settings.pricePerFloor) * floorMultiplier;
    }

    // Special equipment
    if (formData.crane) calculated += 400;

    // Packing services
    if (formData.packing) {
      calculated += (vol / 0.1) * 20; // Volume-based packing
      if (formData.premiumPacking) calculated += 200;
    }

    // Fragile items handling
    if (formData.hasFragileItems) {
      calculated += 150; // Base fee
      calculated += formData.fragileItemsList.length * 50; // Per item
    }

    // Vehicle surcharges
    if (formData.vehicleType === 'big_truck' && rec !== 'big_truck') calculated += 400;
    if (formData.vehicleType === 'small_truck' && rec === 'van') calculated += 200;

    const originalPrice = Math.round(calculated);
    const finalPrice = formData.isFirstTimeCustomer ? Math.round(calculated * 0.95) : originalPrice;

    setCalculations({
      totalVolume: vol,
      price: finalPrice,
      originalPrice,
      recommendedVehicle: rec
    });
  }, [formData, settings]);

  // Inventory management
  const updateInventory = useCallback((itemName: string, delta: number) => {
    setFormData(prev => {
      const existing = prev.inventory.find(i => i.name === itemName);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return { ...prev, inventory: prev.inventory.filter(i => i.name !== itemName) };
        }
        return {
          ...prev,
          inventory: prev.inventory.map(i =>
            i.name === itemName ? { ...i, quantity: newQty } : i
          )
        };
      } else if (delta > 0) {
        const preset = INVENTORY_PRESETS.find(p => p.name === itemName);
        if (!preset) return prev;
        return {
          ...prev,
          inventory: [...prev.inventory, {
            id: itemName,
            name: itemName,
            quantity: 1,
            cbm: preset.cbm,
            category: preset.category
          }]
        };
      }
      return prev;
    });
  }, []);

  // Navigation
  const nextStep = useCallback(() => setCurrentStep(s => Math.min(s + 1, 4)), []);
  const prevStep = useCallback(() => setCurrentStep(s => Math.max(s - 1, 1)), []);

  // Vehicle information
  const vehicleInfo = {
    van: { label: 'טנדר גדול', cap: 'עד 15 מ"ק', maxVolume: 15, icon: Truck },
    small_truck: { label: 'משאית 7.5 טון', cap: '15-35 מ"ק', maxVolume: 35, icon: Truck },
    big_truck: { label: 'משאית 12 טון', cap: '35+ מ"ק', maxVolume: 50, icon: Truck },
  };

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!formData.name || !formData.phone) {
      alert('נא למלא פרטים בסיסיים');
      return;
    }

    // Create lead object
    const newLead: Lead = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      date: formData.date,
      distance: formData.distance,
      rooms: formData.inventory.length, // Approximation
      floor: formData.floor,
      elevator: formData.elevator,
      crane: formData.crane,
      packing: formData.packing,
      volume: calculations.totalVolume,
      items: formData.inventory,
      quote: calculations.price,
      status: 'new',
      createdAt: Date.now(),
      vehicleType: formData.vehicleType,
      isFirstTimeCustomer: formData.isFirstTimeCustomer
    };

    // Save lead
    StorageService.saveLead(newLead);

    // Success message
    alert(`הצעת המחיר נשלחה בהצלחה! נציג יצור איתך קשר בקרוב.`);
    
    // Reset form
    setCurrentStep(1);
    setFormData({
      name: '', phone: '', email: '', date: '',
      distance: 15,
      floor: 1, elevator: false, crane: false,
      packing: false, premiumPacking: false, packingNotes: '',
      hasFragileItems: false, fragileItemsList: [], fragileNotes: '',
      files: [],
      isFirstTimeCustomer: false,
      inventory: [],
      vehicleType: 'van',
      userSelectedVehicle: false
    });
  }, [formData, calculations]);

  return (
    <div className="min-h-screen pt-20 pb-6 px-4 bg-slate-900 text-white overflow-x-hidden">
      <div className="max-w-2xl mx-auto relative z-10">

        {/* Mobile-First Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-white">מחשבון הובלה</span>
            <span className="text-sm text-slate-400">שלב {currentStep} מתוך 4</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 4) * 100}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Step Labels - Mobile Optimized */}
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span className={currentStep >= 1 ? 'text-blue-400 font-semibold' : ''}>פרטים</span>
            <span className={currentStep >= 2 ? 'text-blue-400 font-semibold' : ''}>תכולה</span>
            <span className={currentStep >= 3 ? 'text-blue-400 font-semibold' : ''}>גישה</span>
            <span className={currentStep >= 4 ? 'text-blue-400 font-semibold' : ''}>סיכום</span>
          </div>
        </div>

        {/* Mobile-First Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="text-blue-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">פרטים אישיים</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">שם מלא</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="ישראל ישראלי"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">טלפון</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="050-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">תאריך מעבר</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    מרחק נסיעה: <span className="text-blue-400 font-bold">{formData.distance} ק"מ</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    value={formData.distance}
                    onChange={e => setFormData({...formData, distance: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 ק"מ</span>
                    <span>200 ק"מ</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <FloatingButton
                  onClick={nextStep}
                  icon={ChevronDown}
                  label="המשך לתכולה"
                  color="blue"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Inventory Selection with 3D Truck */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
                  <Package className="text-amber-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">בחירת תכולה</h2>
              </div>

              {/* 3D Truck Visualization */}
              <div className="mb-6">
                <Truck3DVisualization
                  volume={calculations.totalVolume}
                  maxVolume={vehicleInfo[formData.vehicleType].maxVolume}
                  selectedItems={formData.inventory}
                />
              </div>

              {/* Volume and Vehicle Info */}
              <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400">נפח כולל</div>
                    <div className="text-lg font-bold text-blue-400">{calculations.totalVolume.toFixed(1)} מ"ק</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">רכב נבחר</div>
                    <div className="text-sm font-bold text-green-400 flex items-center justify-center gap-1">
                      {(() => {
                        const VehicleIcon = vehicleInfo[formData.vehicleType].icon;
                        return <VehicleIcon size={14} />;
                      })()}
                      {vehicleInfo[formData.vehicleType].label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Grid */}
              <InventoryGrid
                inventory={formData.inventory}
                onUpdate={updateInventory}
              />

              <div className="mt-8 flex justify-between">
                <FloatingButton
                  onClick={prevStep}
                  icon={ArrowUp}
                  label="חזור"
                  color="slate"
                />
                <FloatingButton
                  onClick={nextStep}
                  icon={ChevronDown}
                  label="המשך לגישה"
                  color="blue"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Access & Services */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <Home className="text-green-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">גישה ולוגיסטיקה</h2>
              </div>

              <div className="space-y-4">
                {/* Floor Selection */}
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">קומה (ממוצעת)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={formData.floor}
                      onChange={e => setFormData({...formData, floor: Number(e.target.value)})}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-blue-400 font-bold min-w-[40px] text-center">{formData.floor}</span>
                  </div>
                </div>

                {/* Service Toggles */}
                <div className="space-y-3">
                  <SmartToggle
                    label="יש מעלית בבניין"
                    checked={formData.elevator}
                    onChange={(v) => setFormData({...formData, elevator: v})}
                    color="green"
                  />

                  <SmartToggle
                    label="נדרש מנוף הרמה (+₪400)"
                    checked={formData.crane}
                    onChange={(v) => setFormData({...formData, crane: v})}
                    color="amber"
                    subLabel="עבור קומות גבוהות או חפצים כבדים"
                  />

                  <SmartToggle
                    label="שירותי אריזה"
                    checked={formData.packing}
                    onChange={(v) => setFormData(prev => ({ ...prev, packing: v, premiumPacking: v ? prev.premiumPacking : false }))}
                    color="blue"
                    subLabel="אריזה מקצועית של החפצים"
                  />

                  {formData.packing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-4 pl-4 border-l-2 border-blue-500/30"
                    >
                      <SmartToggle
                        label="אריזת פרימיום (+₪200)"
                        checked={formData.premiumPacking}
                        onChange={(v) => setFormData({...formData, premiumPacking: v})}
                        color="amber"
                        subLabel="הגנה מיוחדת לחפצים יקרי ערך"
                      />
                    </motion.div>
                  )}

                  <SmartToggle
                    label="יש פריטים שבירים"
                    checked={formData.hasFragileItems}
                    onChange={(v) => setFormData({...formData, hasFragileItems: v})}
                    color="red"
                    subLabel="טיפול מיוחד ותוספת ביטוח (+₪150)"
                  />
                </div>

                {/* First Time Customer */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-1 rounded-xl border border-purple-500/30">
                  <SmartToggle
                    label="לקוח חדש"
                    checked={formData.isFirstTimeCustomer}
                    onChange={(v) => setFormData({...formData, isFirstTimeCustomer: v})}
                    color="purple"
                    subLabel="קבל 5% הנחה מיידית!"
                    icon={Gift}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <FloatingButton
                  onClick={prevStep}
                  icon={ArrowUp}
                  label="חזור"
                  color="slate"
                />
                <FloatingButton
                  onClick={nextStep}
                  icon={ChevronDown}
                  label="סיכום וחישוב"
                  color="green"
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Summary and Quote */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30"
              >
                <Check size={32} className="text-white" strokeWidth={3} />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">הצעת המחיר מוכנה!</h2>
              <p className="text-slate-400 mb-6">הנה הסיכום המשוער עבור ההובלה שלך</p>

              {/* Price Display */}
              <div className="bg-slate-900/80 rounded-2xl p-6 mb-6 border border-white/10">
                <div className="text-sm text-slate-500 mb-2">סה"כ לתשלום (משוער)</div>

                <div className="flex flex-col items-center gap-2 relative">
                  {formData.isFirstTimeCustomer && (
                    <div className="text-lg text-slate-500 line-through decoration-red-500 decoration-2">
                      ₪{calculations.originalPrice}
                    </div>
                  )}
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                    ₪{calculations.price}
                  </div>
                  {formData.isFirstTimeCustomer && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xs text-green-400 font-bold bg-green-900/30 px-3 py-1 rounded-full"
                    >
                      כולל 5% הנחת לקוח חדש
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Summary Details */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-slate-400">נפח כולל</div>
                  <div className="font-bold text-blue-400">{calculations.totalVolume.toFixed(1)} מ"ק</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-slate-400">רכב</div>
                  <div className="font-bold text-green-400">{vehicleInfo[formData.vehicleType].label}</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-slate-400">מרחק</div>
                  <div className="font-bold text-amber-400">{formData.distance} ק"מ</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <div className="text-slate-400">קומה</div>
                  <div className="font-bold text-purple-400">{formData.floor}</div>
                </div>
              </div>

              {/* Services Summary */}
              {(formData.packing || formData.crane || formData.hasFragileItems) && (
                <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-slate-400 mb-2">שירותים נוספים:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {formData.packing && (
                      <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-full">
                        אריזה{formData.premiumPacking ? ' פרימיום' : ''}
                      </span>
                    )}
                    {formData.crane && (
                      <span className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-full">
                        מנוף הרמה
                      </span>
                    )}
                    {formData.hasFragileItems && (
                      <span className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded-full">
                        פריטים שבירים
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 justify-center text-blue-300 text-sm">
                  <AlertTriangle size={16} />
                  <span>הצעת מחיר ראשונית - מחירים עשויים להשתנות</span>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <FloatingButton
                  onClick={prevStep}
                  icon={ArrowUp}
                  label="חזור לעריכה"
                  color="slate"
                />
                <FloatingButton
                  onClick={handleSubmit}
                  icon={Send}
                  label="שלח הצעת מחיר"
                  color="green"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Contact;