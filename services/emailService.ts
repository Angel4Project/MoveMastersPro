import { configService } from './configService';

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  toEmail: string;
}

class EmailService {
  private config: EmailConfig | null = null;

  initialize(config?: EmailConfig) {
    if (config) {
      this.config = config;
    } else {
      // Use centralized config
      const appConfig = configService.getConfig();
      this.config = {
        serviceId: appConfig.emailjs.serviceId,
        templateId: appConfig.emailjs.templateId,
        publicKey: appConfig.emailjs.publicKey,
        toEmail: appConfig.business.email,
      };
    }
  }

  async sendLeadNotification(lead: any) {
    if (!this.config) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const templateParams = {
        to_email: this.config.toEmail,
        from_name: lead.name,
        from_email: lead.email || 'noreply@hamiktzoan.com',
        phone: lead.phone,
        message: `ליד חדש מהאתר:
        
שם: ${lead.name}
טלפון: ${lead.phone}
אימייל: ${lead.email || 'לא צוין'}
תאריך: ${lead.date}
מרחק: ${lead.distance} ק"מ
חדרים: ${lead.rooms}
קומה: ${lead.floor}
מעלית: ${lead.elevator ? 'כן' : 'לא'}
מנוף: ${lead.crane ? 'כן' : 'לא'}
אריזה: ${lead.packing ? 'כן' : 'לא'}
נפח: ${lead.volume} מ"ק
הצעת מחיר: ₪${lead.quote}
מקור: ${lead.source || 'לא ידוע'}
הערות: ${lead.notes || 'אין'}`,
        subject: `ליד חדש מאתר המקצוען - ${lead.name}`
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.config.serviceId,
          template_id: this.config.templateId,
          user_id: this.config.publicKey,
          template_params: templateParams
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendContactFormNotification(name: string, phone: string, email: string, message: string) {
    if (!this.config) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const templateParams = {
        to_email: this.config.toEmail,
        from_name: name,
        from_email: email,
        phone: phone,
        message: `הודעת יצירת קשר חדשה:
        
שם: ${name}
טלפון: ${phone}
אימייל: ${email}
הודעה: ${message}`,
        subject: `הודעת יצירת קשר מאתר המקצוען - ${name}`
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.config.serviceId,
          template_id: this.config.templateId,
          user_id: this.config.publicKey,
          template_params: templateParams
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendChatNotification(conversation: any) {
    if (!this.config) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const templateParams = {
        to_email: this.config.toEmail,
        from_name: conversation.userInfo?.name || 'משתמש אנונימי',
        from_email: 'chat@hamiktzoan.com',
        phone: conversation.userInfo?.phone || 'לא צוין',
        message: `שיחת צ'אט חדשה:
        
שם: ${conversation.userInfo?.name || 'לא ידוע'}
טלפון: ${conversation.userInfo?.phone || 'לא צוין'}
מזהה שיחה: ${conversation.sessionId}
מספר הודעות: ${conversation.messages.length}
הודעה אחרונה: ${lastMessage?.text || 'אין'}
ליד נוצר: ${conversation.leadCreated ? 'כן' : 'לא'}`,
        subject: `שיחת צ'אט חדשה - ${conversation.userInfo?.name || 'משתמש אנונימי'}`
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.config.serviceId,
          template_id: this.config.templateId,
          user_id: this.config.publicKey,
          template_params: templateParams
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();