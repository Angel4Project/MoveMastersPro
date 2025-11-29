import { Lead, ChatConversation } from '../types';
import { configService } from './configService';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  range: string;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null;

  initialize(config?: GoogleSheetsConfig) {
    if (config) {
      this.config = config;
    } else {
      // Use centralized config
      const appConfig = configService.getConfig();
      this.config = {
        spreadsheetId: appConfig.googleSheets.spreadsheetId,
        apiKey: appConfig.googleSheets.apiKey,
        range: 'Sheet1!A:P'
      };
    }
  }

  private async makeRequest(endpoint: string, data?: any) {
    if (!this.config) {
      console.warn('Google Sheets not configured');
      return null;
    }

    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/${endpoint}?key=${this.config.apiKey}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Sheets API error:', error);
      return null;
    }
  }

  async appendLead(lead: Lead) {
    const values = [[
      lead.id,
      lead.name,
      lead.phone,
      lead.email,
      lead.date,
      lead.distance,
      lead.rooms,
      lead.floor,
      lead.elevator,
      lead.crane,
      lead.packing,
      lead.volume,
      lead.quote,
      lead.status,
      lead.createdAt,
      lead.source || '',
      lead.notes || ''
    ]];

    return this.makeRequest('values/Leads!A:P:append', {
      values,
      valueInputOption: 'RAW'
    });
  }

  async appendChatConversation(conversation: ChatConversation) {
    const values = [[
      conversation.id,
      conversation.sessionId,
      conversation.userInfo?.name || '',
      conversation.userInfo?.phone || '',
      conversation.userInfo?.email || '',
      conversation.messages.length,
      conversation.startedAt,
      conversation.lastActivity,
      conversation.leadCreated ? 'כן' : 'לא',
      conversation.leadId || '',
      conversation.status
    ]];

    return this.makeRequest('values/ChatConversations!A:K:append', {
      values,
      valueInputOption: 'RAW'
    });
  }

  async appendContactForm(name: string, phone: string, email: string, message: string) {
    const values = [[
      Date.now().toString(),
      name,
      phone,
      email,
      message,
      new Date().toISOString()
    ]];

    return this.makeRequest('values/ContactForms!A:F:append', {
      values,
      valueInputOption: 'RAW'
    });
  }

  async appendUserActivity(action: string, page: string, userAgent: string, ip?: string) {
    const values = [[
      Date.now().toString(),
      action,
      page,
      userAgent,
      ip || '',
      new Date().toISOString()
    ]];

    return this.makeRequest('values/UserActivity!A:F:append', {
      values,
      valueInputOption: 'RAW'
    });
  }

  async getAnalyticsData() {
    const response = await this.makeRequest('values/UserActivity!A:F');
    return response?.values || [];
  }

  // Batch update for better performance
  async batchUpdate(data: { range: string; values: any[][] }[]) {
    if (!this.config) return null;

    const requests = data.map(item => ({
      range: item.range,
      values: item.values
    }));

    return this.makeRequest('values:batchUpdate', {
      data: requests,
      valueInputOption: 'RAW'
    });
  }
}

export const googleSheetsService = new GoogleSheetsService();