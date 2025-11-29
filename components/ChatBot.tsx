
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIResponse } from '../services/aiService';
import { StorageService } from '../services/storage';
import { COMPANY_INFO, Lead, ChatConversation, ChatMessage } from '../types';

interface MessageAction {
  label: string;
  type: 'phone' | 'whatsapp' | 'link';
  value: string;
  icon?: any;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  actions?: MessageAction[];
}

type ConversationStep = 'idle' | 'name' | 'phone';

interface ChatBotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen: externalIsOpen, onToggle }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `שלום! אני העוזר הדיגיטלי של ${COMPANY_INFO.owner}. איך אפשר לעזור לך היום?`,
      sender: 'bot',
      actions: [
        { label: 'חייג לדדי', type: 'phone', value: COMPANY_INFO.phone, icon: Phone },
        { label: 'וואטסאפ', type: 'whatsapp', value: COMPANY_INFO.phone, icon: MessageCircle }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Lead Capture State
  const [conversationStep, setConversationStep] = useState<ConversationStep>('idle');
  const [leadData, setLeadData] = useState<{name: string, phone: string}>({ name: '', phone: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  // Initialize conversation session
  useEffect(() => {
    if (isOpen && !conversationId) {
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(sessionId);

      const newConversation: ChatConversation = {
        id: sessionId,
        sessionId,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: Date.now(),
          actions: msg.actions
        })),
        startedAt: Date.now(),
        lastActivity: Date.now(),
        status: 'active'
      };

      StorageService.saveChatConversation(newConversation);
    }
  }, [isOpen, conversationId, messages]);

  // Save messages to conversation
  const saveMessageToConversation = (message: Message) => {
    if (conversationId) {
      const conversation = StorageService.getChatConversations().find(c => c.id === conversationId);
      if (conversation) {
        const chatMessage: ChatMessage = {
          id: message.id,
          text: message.text,
          sender: message.sender,
          timestamp: Date.now(),
          actions: message.actions
        };

        const updatedConversation = {
          ...conversation,
          messages: [...conversation.messages, chatMessage],
          lastActivity: Date.now(),
          userInfo: conversation.userInfo || leadData.name ? {
            name: leadData.name,
            phone: leadData.phone
          } : undefined,
          leadCreated: conversation.leadCreated || Boolean(leadData.name && leadData.phone),
          status: 'active' as const
        };

        StorageService.saveChatConversation(updatedConversation);
      }
    }
  };

  const addBotMessage = (text: string, actions?: MessageAction[]) => {
    const newMessage = { id: Date.now(), text, sender: 'bot' as const, actions };
    setMessages(prev => [...prev, newMessage]);
    saveMessageToConversation(newMessage);
  };

  const saveLeadToCRM = (name: string, phone: string) => {
    const newLead: Lead = {
      id: Date.now().toString(),
      name: name,
      phone: phone,
      email: '',
      date: new Date().toLocaleDateString('he-IL'),
      distance: 0, rooms: 0, floor: 0, elevator: false, crane: false, packing: false, volume: 0, items: [], quote: 0,
      status: 'new',
      source: 'chatbot', // Special source tag
      createdAt: Date.now(),
      notes: 'נוצר אוטומטית דרך הצ׳אט בוט'
    };
    StorageService.saveLead(newLead);

    // Update conversation with lead info
    if (conversationId) {
      StorageService.updateChatConversation(conversationId, {
        leadCreated: true,
        leadId: newLead.id,
        userInfo: { name, phone }
      });
    }
  };

  const handleStepLogic = async (text: string) => {
    // 1. Handling Name Input
    if (conversationStep === 'name') {
      setLeadData(prev => ({ ...prev, name: text }));
      setConversationStep('phone');
      setTimeout(() => {
        addBotMessage(`נעים להכיר, ${text}. מה מספר הטלפון שלך לחזרה?`);
      }, 500);
      return;
    }

    // 2. Handling Phone Input
    if (conversationStep === 'phone') {
      const phoneRegex = /^05\d-?\d{7}$/;
      const cleanPhone = text.replace(/[-\s]/g, '');
      if (phoneRegex.test(text) || (cleanPhone.length === 10 && cleanPhone.startsWith('05'))) {
        setLeadData(prev => ({ ...prev, phone: text }));
        // Save to CRM
        saveLeadToCRM(leadData.name, text);

        setConversationStep('idle');
        setTimeout(() => {
          addBotMessage("מעולה! שמרתי את הפרטים שלך. דדי יצור איתך קשר בהקדם.", [
             { label: 'חייג עכשיו', type: 'phone', value: COMPANY_INFO.phone, icon: Phone }
          ]);
        }, 500);
      } else {
        setTimeout(() => {
          addBotMessage("המספר נראה לא תקין. בבקשה בדוק שוב ונסה להקליד את המספר הנכון (לדוגמה: 050-1234567).");
        }, 500);
      }
      return;
    }

    // 3. IDLE State - Intent Detection
    const lowerText = text.toLowerCase();
    
    // Check for moving intent triggers
    if (/הובלה|מעבר|מחיר|הצעת|להזמין|פנוי|מתי|quote|move/.test(lowerText) && conversationStep === 'idle') {
        setConversationStep('name');
        setTimeout(() => {
            addBotMessage("אשמח לעזור לך עם הצעת מחיר! איך קוראים לך?");
        }, 600);
        return;
    }

    // Regex Q&A
    if (/ביטוח|אחריות/.test(lowerText)) {
        setTimeout(() => addBotMessage("בוודאי! כל הובלה כוללת ביטוח תכולה מלא עד 100,000 ש״ח."), 600);
        return;
    }
    if (/טלפון|דדי/.test(lowerText)) {
        setTimeout(() => addBotMessage(`ניתן להשיג את דדי ב-${COMPANY_INFO.phone}.`, [
            { label: 'חייג', type: 'phone', value: COMPANY_INFO.phone, icon: Phone }
        ]), 600);
        return;
    }
    if (/אזורים|רעננה/.test(lowerText)) {
        setTimeout(() => addBotMessage(`אנחנו יושבים ב${COMPANY_INFO.address} ועובדים בכל הארץ.`), 600);
        return;
    }
    if (/angel4project|מי יצר|מי פיתח|מי בנה/.test(lowerText)) {
        setTimeout(() => addBotMessage("האתר הזה פותח על ידי ANGEL4PROJECT, מומחה לפיתוח אתרים ופתרונות דיגיטליים מתקדמים."), 600);
        return;
    }
    if (/מה זה האתר|אודות האתר|על האתר/.test(lowerText)) {
        setTimeout(() => addBotMessage("האתר הזה נבנה על ידי ANGEL4PROJECT, ומספק מגוון שירותים מתקדמים בתחום יצירת אתרים, פיתוח פתרונות דיגיטליים והובלות מקצועיות."), 600);
        return;
    }

    // AI Fallback
    const settings = StorageService.getSettings();
    if (settings.aiApiKey) {
      try {
        const aiReply = await generateAIResponse(text);
        addBotMessage(aiReply);
      } catch (e) {
        addBotMessage("מתנצל, יש לי עומס כרגע.");
      }
    } else {
      setTimeout(() => {
        addBotMessage(`שאלה מעולה. הכי טוב שתדבר עם דדי: ${COMPANY_INFO.phone}`, [
            { label: 'וואטסאפ', type: 'whatsapp', value: COMPANY_INFO.phone, icon: MessageCircle }
        ]);
      }, 800);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    saveMessageToConversation(userMsg);
    setInputValue("");
    setIsTyping(true);

    await handleStepLogic(inputValue);

    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-24 left-4 sm:left-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 w-80 sm:w-80 h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                    <span className="text-white font-bold block leading-none">העוזר של דדי</span>
                    <span className="text-blue-200 text-xs">מחובר כעת</span>
                </div>
              </div>
              <button onClick={() => onToggle ? onToggle() : setInternalIsOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-700 text-slate-200 rounded-bl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Action Buttons */}
                  {msg.actions && (
                      <div className="flex gap-2 mt-2">
                          {msg.actions.map((action, idx) => (
                              <a 
                                key={idx}
                                href={action.type === 'phone' ? `tel:${action.value}` : action.type === 'whatsapp' ? `https://wa.me/972${action.value.replace(/-/g, '').substring(1)}` : action.value}
                                target={action.type !== 'phone' ? '_blank' : undefined}
                                rel="noreferrer"
                                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
                              >
                                  {action.icon && <action.icon size={12} />}
                                  {action.label}
                              </a>
                          ))}
                      </div>
                  )}
                </div>
              ))}
              {isTyping && <div className="text-slate-500 text-xs px-4 animate-pulse">מקליד...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-slate-800 border-t border-white/10 flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={conversationStep === 'name' ? 'הקלד את שמך...' : conversationStep === 'phone' ? 'הקלד טלפון...' : "שאל אותי משהו..."}
                className="flex-1 bg-slate-900 text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:border-blue-500 outline-none text-right"
                autoFocus
              />
              <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleOpen}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] relative group"
      >
        <MessageCircle size={28} />
        {!isOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>}
      </motion.button>
    </div>
  );
};

export default ChatBot;
