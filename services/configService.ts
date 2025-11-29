/**
 * Configuration Service
 * Validates and provides access to environment variables with security checks
 */

interface AppConfig {
  // AI Services
  geminiApiKey: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;

  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };

  // External Services
  googleSheets: {
    spreadsheetId: string;
    apiKey: string;
  };

  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };

  telegram: {
    botToken: string;
    chatId: string;
  };

  whatsapp: {
    phoneNumberId?: string;
    accessToken?: string;
  };

  // Business Info
  business: {
    waPhoneNumber: string;
    email: string;
    phone: string;
  };

  // App Settings
  app: {
    nodeEnv: string;
    baseUrl: string;
    apiBaseUrl: string;
    vercelUrl?: string;
  };

  // Security
  security: {
    allowedOrigins: string[];
    sessionSecret: string;
    jwtSecret: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    leadSubmissionWindowMs: number;
    leadSubmissionMax: number;
  };

  // Features
  features: {
    aiAnalysis: boolean;
    emailNotifications: boolean;
    telegramIntegration: boolean;
    smsNotifications: boolean;
  };
}

class ConfigService {
  private config: AppConfig | null = null;
  private validationErrors: string[] = [];

  /**
   * Get validated configuration
   */
  getConfig(): AppConfig {
    if (!this.config) {
      this.config = this.loadAndValidateConfig();
    }
    return this.config;
  }

  /**
   * Check if configuration is valid
   */
  isValid(): boolean {
    try {
      this.getConfig();
      return this.validationErrors.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  /**
   * Load and validate configuration from environment variables
   */
  private loadAndValidateConfig(): AppConfig {
    this.validationErrors = [];

    const config: AppConfig = {
      // AI Services
      geminiApiKey: this.getRequiredEnv('GEMINI_API_KEY'),
      openaiApiKey: this.getOptionalEnv('OPENAI_API_KEY'),
      openrouterApiKey: this.getOptionalEnv('OPENROUTER_API_KEY'),

      // Firebase
      firebase: {
        apiKey: this.getRequiredEnv('VITE_FIREBASE_API_KEY'),
        authDomain: this.getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
        projectId: this.getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
        storageBucket: this.getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: this.getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
        appId: this.getRequiredEnv('VITE_FIREBASE_APP_ID'),
      },

      // External Services
      googleSheets: {
        spreadsheetId: this.getRequiredEnv('GOOGLE_SHEETS_SPREADSHEET_ID'),
        apiKey: this.getRequiredEnv('GOOGLE_SHEETS_API_KEY'),
      },

      emailjs: {
        serviceId: this.getRequiredEnv('EMAILJS_SERVICE_ID'),
        templateId: this.getRequiredEnv('EMAILJS_TEMPLATE_ID'),
        publicKey: this.getRequiredEnv('EMAILJS_PUBLIC_KEY'),
      },

      telegram: {
        botToken: this.getRequiredEnv('TELEGRAM_BOT_TOKEN'),
        chatId: this.getRequiredEnv('TELEGRAM_CHAT_ID'),
      },

      whatsapp: {
        phoneNumberId: this.getOptionalEnv('WHATSAPP_PHONE_NUMBER_ID'),
        accessToken: this.getOptionalEnv('WHATSAPP_ACCESS_TOKEN'),
      },

      // Business Info
      business: {
        waPhoneNumber: this.getRequiredEnv('BUSINESS_WA_PHONE_NUMBER'),
        email: this.getRequiredEnv('BUSINESS_EMAIL'),
        phone: this.getRequiredEnv('BUSINESS_PHONE'),
      },

      // App Settings
      app: {
        nodeEnv: this.getEnvWithDefault('NODE_ENV', 'development'),
        baseUrl: this.getEnvWithDefault('BASE_URL', 'http://localhost:3000'),
        apiBaseUrl: this.getEnvWithDefault('API_BASE_URL', 'http://localhost:3001'),
        vercelUrl: this.getOptionalEnv('VERCEL_URL'),
      },

      // Security
      security: {
        allowedOrigins: this.getEnvWithDefault('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
        sessionSecret: this.getRequiredEnv('SESSION_SECRET'),
        jwtSecret: this.getRequiredEnv('JWT_SECRET'),
      },

      // Rate Limiting
      rateLimit: {
        windowMs: parseInt(this.getEnvWithDefault('RATE_LIMIT_WINDOW_MS', '900000')),
        maxRequests: parseInt(this.getEnvWithDefault('RATE_LIMIT_MAX_REQUESTS', '100')),
        leadSubmissionWindowMs: parseInt(this.getEnvWithDefault('LEAD_SUBMISSION_RATE_LIMIT_WINDOW_MS', '60000')),
        leadSubmissionMax: parseInt(this.getEnvWithDefault('LEAD_SUBMISSION_RATE_LIMIT_MAX', '5')),
      },

      // Features
      features: {
        aiAnalysis: this.getEnvWithDefault('FEATURE_AI_ANALYSIS', 'true') === 'true',
        emailNotifications: this.getEnvWithDefault('FEATURE_EMAIL_NOTIFICATIONS', 'true') === 'true',
        telegramIntegration: this.getEnvWithDefault('FEATURE_TELEGRAM_INTEGRATION', 'true') === 'true',
        smsNotifications: this.getEnvWithDefault('FEATURE_SMS_NOTIFICATIONS', 'false') === 'true',
      },
    };

    // Validate critical configurations
    this.validateFirebaseConfig(config.firebase);
    this.validateSecurityConfig(config.security);

    if (this.validationErrors.length > 0) {
      console.error('Configuration validation errors:', this.validationErrors);
      throw new Error(`Configuration validation failed: ${this.validationErrors.join(', ')}`);
    }

    return config;
  }

  /**
   * Get required environment variable
   */
  private getRequiredEnv(key: string): string {
    const value = this.getEnv(key);
    if (!value) {
      this.validationErrors.push(`Missing required environment variable: ${key}`);
      return '';
    }
    return value;
  }

  /**
   * Get optional environment variable
   */
  private getOptionalEnv(key: string): string | undefined {
    return this.getEnv(key) || undefined;
  }

  /**
   * Get environment variable with default value
   */
  private getEnvWithDefault(key: string, defaultValue: string): string {
    return this.getEnv(key) || defaultValue;
  }

  /**
   * Get environment variable (handles both client and server environments)
   */
  private getEnv(key: string): string | undefined {
    // Client-side: use import.meta.env for Vite
    if (typeof window !== 'undefined' && (import.meta as any)?.env) {
      return ((import.meta as any).env)[key] || process.env?.[key];
    }
    // Server-side: use process.env
    return process.env?.[key];
  }

  /**
   * Validate Firebase configuration
   */
  private validateFirebaseConfig(firebase: AppConfig['firebase']): void {
    const required = ['apiKey', 'authDomain', 'projectId'];
    for (const field of required) {
      if (!firebase[field as keyof typeof firebase]) {
        this.validationErrors.push(`Invalid Firebase config: missing ${field}`);
      }
    }

    // Validate API key format
    if (firebase.apiKey && !firebase.apiKey.startsWith('AIza')) {
      this.validationErrors.push('Invalid Firebase API key format');
    }
  }

  /**
   * Validate security configuration
   */
  private validateSecurityConfig(security: AppConfig['security']): void {
    if (security.sessionSecret.length < 32) {
      this.validationErrors.push('Session secret must be at least 32 characters');
    }

    if (security.jwtSecret.length < 32) {
      this.validationErrors.push('JWT secret must be at least 32 characters');
    }
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.getConfig().app.nodeEnv === 'production';
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.getConfig().app.nodeEnv === 'development';
  }

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return this.getConfig().app.nodeEnv;
  }
}

// Export singleton instance
export const configService = new ConfigService();

// Export types
export type { AppConfig };