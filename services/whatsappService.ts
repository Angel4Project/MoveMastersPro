import { configService } from './configService';

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessPhone: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;

  initialize(config?: WhatsAppConfig) {
    if (config) {
      this.config = config;
    } else {
      // Use centralized config
      const appConfig = configService.getConfig();
      this.config = {
        phoneNumberId: appConfig.whatsapp.phoneNumberId || '',
        accessToken: appConfig.whatsapp.accessToken || '',
        businessPhone: appConfig.business.waPhoneNumber,
      };
    }
  }

  private async sendMessage(to: string, message: string) {
    if (!this.config) {
      console.warn('WhatsApp service not configured');
      return false;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${result.error?.message || response.status}`);
      }

      return true;
    } catch (error) {
      console.error('WhatsApp sending failed:', error);
      return false;
    }
  }

  async sendLeadNotification(lead: any) {
    const message = `🚛 *ליד חדש מאתר המקצוען*

👤 *שם:* ${lead.name}
📞 *טלפון:* ${lead.phone}
📧 *אימייל:* ${lead.email || 'לא צוין'}
📅 *תאריך:* ${lead.date}
📍 *מרחק:* ${lead.distance} ק"מ
🏠 *חדרים:* ${lead.rooms}
📊 *קומה:* ${lead.floor}
🛗 *מעלית:* ${lead.elevator ? 'כן' : 'לא'}
🏗️ *מנוף:* ${lead.crane ? 'כן' : 'לא'}
📦 *אריזה:* ${lead.packing ? 'כן' : 'לא'}
📏 *נפח:* ${lead.volume} מ"ק
💰 *הצעת מחיר:* ₪${lead.quote}
🔍 *מקור:* ${lead.source || 'אתר'}
📝 *הערות:* ${lead.notes || 'אין'}

*נוצר ב:* ${new Date(lead.createdAt).toLocaleString('he-IL')}`;

    return this.sendMessage(this.config?.businessPhone || '', message);
  }

  async sendContactFormNotification(name: string, phone: string, email: string, message: string) {
    const whatsappMessage = `💬 *הודעת יצירת קשר חדשה*

👤 *שם:* ${name}
📞 *טלפון:* ${phone}
📧 *אימייל:* ${email}
💌 *הודעה:* ${message}

*התקבל ב:* ${new Date().toLocaleString('he-IL')}`;

    return this.sendMessage(this.config?.businessPhone || '', whatsappMessage);
  }

  async sendChatNotification(conversation: any) {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const message = `💭 *שיחת צ'אט חדשה*

👤 *שם:* ${conversation.userInfo?.name || 'משתמש אנונימי'}
📞 *טלפון:* ${conversation.userInfo?.phone || 'לא צוין'}
🆔 *מזהה שיחה:* ${conversation.sessionId}
📊 *מספר הודעות:* ${conversation.messages.length}
💬 *הודעה אחרונה:* ${lastMessage?.text || 'אין'}
✅ *ליד נוצר:* ${conversation.leadCreated ? 'כן' : 'לא'}

*התחילה ב:* ${new Date(conversation.startedAt).toLocaleString('he-IL')}`;

    return this.sendMessage(this.config?.businessPhone || '', message);
  }

  // Send prepared message to visitor
  async sendPreparedMessageToVisitor(visitorPhone: string, message: string) {
    return this.sendMessage(visitorPhone, message);
  }

  // Create WhatsApp link for visitor
  createWhatsAppLink(phone: string, message: string) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }
}

export const whatsappService = new WhatsAppService();