
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Mic, MicOff, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
import { COMPANY_INFO, Lead, ChatConversation, ChatMessage } from '../types';
import { useChat } from '../src/hooks/useChat';

// Import avatar image
const ChatBotAvatar = new URL('/images/assistant-avatar.png', import.meta.url).href;

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


interface ChatBotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen: externalIsOpen, onToggle }) => {
   const [internalIsOpen, setInternalIsOpen] = useState(false);
   const [conversationId, setConversationId] = useState<string>('');
   const [isDarkMode, setIsDarkMode] = useState(true);

   const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
   const toggleOpen = onToggle || (() => setInternalIsOpen(!internalIsOpen));

   // Use the chat hook
   const { isListening, voiceError, startVoiceRecognition, stopVoiceRecognition, quickActions, sendMessage, detectLeadInfo } = useChat();

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
   const [leadData, setLeadData] = useState<{name: string, phone: string, email: string}>({ name: '', phone: '', email: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local knowledge base for fallback
  const getLocalResponse = (input: string) => {
    const lowerInput = input.toLowerCase().trim();

    // Direct matches
    const responses: { [key: string]: string } = {
      'שלום': 'שלום! אני העוזר הדיגיטלי של הובלות המקצוען. איך אפשר לעזור לך היום?',
      'היי': 'היי! אני כאן לעזור לך עם כל שאלה בנוגע להובלות. מה אתה צריך?',
      'מה השירותים שלכם': 'אנחנו מציעים: הובלת דירות, משרדים, אריזה מקצועית, שירותי מנוף, אחסון זמני והובלות בינלאומיות. כל השירותים עם ביטוח מלא.',
      'מה המחירים': 'המחירים תלויים במרחק, גודל ההובלה ומספר החדרים. מחיר בסיס: 800 ש״ח, 15 ש״ח לק״מ, 200 ש״ח לחדר. צור קשר לקבלת הצעת מחיר מדויקת.',
      'מי אתה': 'אני העוזר הדיגיטלי של הובלות המקצוען, חברה בבעלות דדי. האתר נוצר על ידי ANGEL4PROJECT.',
      'מי יצר את האתר': 'האתר נוצר על ידי ANGEL4PROJECT, מומחה לפיתוח אתרים ופתרונות דיגיטליים מתקדמים.',
      'איפה אתם נמצאים': 'אנחנו ממוקמים באחוזה 131, רעננה. משרתים את כל הארץ עם צי מתקדם.',
      'מה הטלפון': 'ניתן להשיג את דדי בטלפון: 050-5350148 או בוואטסאפ.',
      'איך להזמין': 'ניתן להזמין שירות דרך האתר, טלפון או וואטסאפ. נשמח לתאם ביקור להערכת היקף ההובלה.',
      'מה הביטוח': 'כל הובלה כוללת ביטוח תכולה מלא עד 100,000 ש״ח. אנחנו דואגים לביטחון הרכוש שלך.',
      'איך להתכונן להובלה': 'הכנת רשימת חפצים, אריזה של חפצים שבירים, ניקוי המקום הישן והכנת המקום החדש. אנחנו נעזור בכל השלבים.',
      'כמה זמן לוקחת הובלה': 'הובלת דירה ממוצעת לוקחת 4-6 שעות. תלוי בגודל ההובלה ומרחק הנסיעה.',
      'איך לבטל הזמנה': 'ניתן לבטל או לשנות הזמנה עד 48 שעות לפני מועד ההובלה ללא עמלות.',
      'מה כולל השירות': 'השירות כולל: אריזה מקצועית, הובלה, פריקה, הרכבה של רהיטים והובלה למקום החדש.',
      'האם אתם עובדים בסופש': 'כן, אנחנו עובדים גם בסופי שבוע וחגים. זמינים 24/7 לשירות לקוחות.',
      'מה הציוד שלכם': 'צי מתקדם של משאיות מודרניות עם מנופים, צוות מאומן וביטוח מלא.',
      'איך לשלם': 'אפשר לשלם במזומן, העברה בנקאית, צ\'ק או אשראי. קבלות מס כחוק.',
      'יש הנחות': 'כן, הנחות לחברי מילואים, סטודנטים ומשפחות ברוכות ילדים. צור קשר לבדוק זכאות.',
      'מה הלקוחות אומרים': 'לקוחותינו מרוצים מהשירות המקצועי, האמינות והמחירים ההוגנים. קרא חוות דעת באתר.',
      'איך לעקוב אחר ההובלה': 'נעדכן אותך בזמן אמת על התקדמות ההובלה. ניתן להתקשר בכל עת.',
      'מה אם יש נזק': 'במקרה נדיר של נזק, הביטוח שלנו מכסה עד 100,000 ש״ח. נטפל בכל בעיה מיידית.',
      'איך להכין רשימת אריזה': 'הכן רשימת חדרים וחפצים. סמן חפצים שבירים. הכן קופסאות וחומרי אריזה.',
      'כמה אנשים צריך': 'לדירה 3-4 חדרים: 2-3 אנשים. למשרד: תלוי בגודל. נמליץ על הצוות המתאים.',
      'האם אתם עושים אריזה': 'כן, שירות אריזה מקצועי עם חומרים איכותיים וצוות מנוסה.',
      'מה לגבי חיות מחמד': 'אנחנו יכולים להוביל חיות מחמד בבטחה. יש להודיע מראש על הצורך.',
      'איך לבחור תאריך': 'בחר תאריך נוח. אנחנו זמינים כל השבוע. מומלץ לתכנן שבוע-שבועיים מראש.',
      'מה אם אני צריך אחסון': 'יש לנו מחסנים מאובטחים לאחסון זמני. שירות מלא עם ביטוח.',
      'האם אתם עושים הובלות בינלאומיות': 'כן, הובלות בינלאומיות עם כל הניירת והביטוח הנדרש.',
      'מה היתרון שלכם': '15 שנות ניסיון, צי מתקדם, ביטוח מלא, שירות 24/7 ומחירים הוגנים.',
      'איך להתחיל': 'צור קשר עכשיו לקבלת הצעת מחיר חינמית. נשלח נציג להערכה.',
      'תודה': 'תודה לך! נשמח לעזור בכל שאלה נוספת. צור קשר בכל עת.',
      'ביי': 'להתראות! בהצלחה עם ההובלה. נשאר בקשר.',
      'ברוכים הבאים': 'ברוך הבא לאתר הובלות המקצוען! איך אפשר לעזור לך היום?'
    };

    // Direct matches
    if (responses[lowerInput]) {
      return responses[lowerInput];
    }

    // Partial matches
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key) || key.includes(lowerInput)) {
        return response;
      }
    }

    // Keyword-based responses
    if (lowerInput.includes('מחיר') || lowerInput.includes('עלות') || lowerInput.includes('כמה')) {
      return responses['מה המחירים'];
    }

    if (lowerInput.includes('שירות') || lowerInput.includes('מה אתם עושים')) {
      return responses['מה השירותים שלכם'];
    }

    if (lowerInput.includes('טלפון') || lowerInput.includes('צור קשר') || lowerInput.includes('דדי')) {
      return responses['מה הטלפון'];
    }

    if (lowerInput.includes('איפה') || lowerInput.includes('מיקום') || lowerInput.includes('כתובת')) {
      return responses['איפה אתם נמצאים'];
    }

    if (lowerInput.includes('מי') || lowerInput.includes('יצר') || lowerInput.includes('angel4project')) {
      return responses['מי יצר את האתר'];
    }

    if (lowerInput.includes('הזמן') || lowerInput.includes('הזמנה') || lowerInput.includes('איך')) {
      return responses['איך להזמין'];
    }

    if (lowerInput.includes('ביטוח') || lowerInput.includes('אחריות')) {
      return responses['מה הביטוח'];
    }

    // Default response
    return 'שלום! אני העוזר הדיגיטלי של הובלות המקצוען. איך אפשר לעזור לך? אתה יכול לשאול על מחירים, שירותים, או צור קשר עם דדי בטלפון 050-5350148.';
  };

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

  const saveLeadToCRM = (name: string, phone: string, email: string = '') => {
    const newLead: Lead = {
      id: Date.now().toString(),
      name: name,
      phone: phone,
      email: email,
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
        userInfo: { name, phone, email }
      });
    }
  };


  const handleVoiceResult = (transcript: string) => {
    setInputValue(transcript);
    // Optionally auto-send
    // handleSend();
  };

  const handleQuickAction = (action: any) => {
    setInputValue(action.value);
    // Auto send quick actions
    setTimeout(() => handleSend(), 100);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    saveMessageToConversation(userMsg);
    setInputValue("");
    setIsTyping(true);

    // Detect lead info
    const detectedLead = detectLeadInfo(inputValue);
    if (detectedLead.name) setLeadData(prev => ({ ...prev, name: detectedLead.name || prev.name }));
    if (detectedLead.phone) setLeadData(prev => ({ ...prev, phone: detectedLead.phone || prev.phone }));
    if (detectedLead.email) setLeadData(prev => ({ ...prev, email: detectedLead.email || prev.email }));

    // Get chatbot source from settings
    const settings = StorageService.getSettings();

    // Try AI or local knowledge base
    if ((settings as any).chatbotSource === 'local' || !settings.aiApiKey) {
      // Use local knowledge base
      const localResponse = getLocalResponse(inputValue);
      addBotMessage(localResponse);
    } else {
      // Try AI first
      try {
        const data = await sendMessage(inputValue, messages);
        if (data.success) {
          addBotMessage(data.response);
          // Handle lead from AI
          if (data.leadDetected) {
            const lead = data.leadDetected;
            setLeadData(prev => ({
              name: lead.name || prev.name,
              phone: lead.phone || prev.phone,
              email: lead.email || prev.email
            }));
            if (lead.name && lead.phone) {
              saveLeadToCRM(lead.name, lead.phone, lead.email);
            }
          }
        } else {
          // Fallback to local knowledge base
          const localResponse = getLocalResponse(inputValue);
          addBotMessage(localResponse);
        }
      } catch (e) {
        // Fallback to local knowledge base
        const localResponse = getLocalResponse(inputValue);
        addBotMessage(localResponse);
      }
    }

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
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-xl border border-blue-500/30 w-[calc(100vw-2rem)] sm:w-80 max-w-sm h-[calc(100vh-8rem)] sm:h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4`}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2">
                <motion.img
                  src={ChatBotAvatar}
                  alt="עוזר צ'אט"
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                  animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMxZTQwYWYiLz4KPHBhdGggZD0iTTIyIDIyYzAtMS41LTEuMS0yLjctMi43LTMtMy0uMy00LTEuMy00LTMtMS41IDAtMi43IDEuMS0zIDIuN3MtLjMgMy0xLjMgNC0xLjMgMy0yLjcgMy0zIDIuNy0zIDMuNXMxLjEgMi43IDMgM2MzIC4zIDQgMS4zIDQgM3MxLjMgMi43IDIuNyAzIDMgMi43IDMgMy41LTEuMSAyLjctMyAzLTMgLjMtNC0xLjMtNC0zcy0uMy0yLjctMS4zLTRTMTEgMTYuNSA5IDE2LjVzLTEuMS0yLjctMy0zLTMtLjMtNC0xLjMtNC0zcy0uMy0yLjctMS4zLTRTMTEgMTMuNSA5IDEzLjVzLTEuMS0yLjctMy0zLTMtLjMtNC0xLjMtNC0zeiIgZmlsbD0iIzYzNjZmMSIvPgo8L3N2Zz4K';
                  }}
                />
                <div>
                    <span className="text-white font-bold block leading-none">העוזר של דדי</span>
                    <span className="text-blue-200 text-xs">מחובר כעת</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-white/80 hover:text-white p-1"
                  title={isDarkMode ? 'מצב בהיר' : 'מצב כהה'}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button onClick={() => onToggle ? onToggle() : setInternalIsOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : isDarkMode
                        ? 'bg-slate-700 text-slate-200 rounded-bl-none border border-white/5'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none border border-gray-300'
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

            {/* Quick Actions */}
            <div className="px-3 py-2 bg-slate-800/50 border-t border-white/5">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className={`p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'} border-t border-white/10 flex gap-2`}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="שאל אותי משהו..."
                className={`flex-1 text-sm rounded-lg px-3 py-2 border focus:border-blue-500 outline-none text-right ${
                  isDarkMode
                    ? 'bg-slate-900 text-white border-slate-600'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
                autoFocus
              />
              <motion.button
                onClick={() => isListening ? stopVoiceRecognition() : startVoiceRecognition(handleVoiceResult)}
                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-600 hover:bg-slate-500 text-white'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isListening ? 'עצור הקלטה' : 'התחל הקלטה קולית'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>
              <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Send size={18} /></button>
            </div>

            {voiceError && (
              <div className="px-3 pb-2 text-red-400 text-xs">
                {voiceError}
              </div>
            )}
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
