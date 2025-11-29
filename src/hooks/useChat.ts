import { useState, useCallback, useRef } from 'react';

interface MessageAction {
  label: string;
  type: 'phone' | 'whatsapp' | 'link';
  value: string;
  icon?: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  actions?: MessageAction[];
}

// Extend window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useChat = () => {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Voice recognition setup
  const initVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceError('דפדפן זה לא תומך בזיהוי קול');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'he-IL'; // Hebrew
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setVoiceError(`שגיאה בזיהוי קול: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  const startVoiceRecognition = useCallback((onResult: (transcript: string) => void) => {
    const recognition = recognitionRef.current || initVoiceRecognition();
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    try {
      recognition.start();
    } catch (error) {
      setVoiceError('לא ניתן להתחיל זיהוי קול');
    }
  }, [initVoiceRecognition]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Quick actions
  const quickActions = [
    { label: 'הצעת מחיר', value: 'אני רוצה הצעת מחיר להובלה', icon: '💰' },
    { label: 'שירותים', value: 'איזה שירותים אתם מציעים?', icon: '🚚' },
    { label: 'צור קשר', value: 'איך אפשר ליצור איתכם קשר?', icon: '📞' },
    { label: 'שאלות נפוצות', value: 'מה הן השאלות הנפוצות?', icon: '❓' }
  ];

  // Send message with conversation history
  const sendMessage = useCallback(async (input: string, conversation: Message[] = []) => {
    try {
      const response = await fetch('/api/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          conversation: conversation.slice(-10) // Last 10 messages for context
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Chat send error:', error);
      return {
        success: false,
        response: 'שגיאה בשליחת ההודעה. אנא נסה שוב.'
      };
    }
  }, []);

  // Lead detection helper
  const detectLeadInfo = useCallback((text: string) => {
    const nameMatch = text.match(/שמי\s+([א-ת\s]+)/i) || text.match(/אני\s+([א-ת\s]+)/i);
    const phoneMatch = text.match(/(\d{3}-?\d{3}-?\d{4}|\d{10}|\d{2,3}-\d{7})/);
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);

    return {
      name: nameMatch ? nameMatch[1].trim() : null,
      phone: phoneMatch ? phoneMatch[1] : null,
      email: emailMatch ? emailMatch[1] : null
    };
  }, []);

  return {
    // Voice
    isListening,
    voiceError,
    startVoiceRecognition,
    stopVoiceRecognition,

    // Quick actions
    quickActions,

    // Chat
    sendMessage,

    // Utils
    detectLeadInfo
  };
};