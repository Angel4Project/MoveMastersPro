/**
 * Input Validation and Sanitization Service
 * Provides comprehensive input validation and security sanitization
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

class ValidationService {
  /**
   * Sanitize string input
   */
  sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .replace(/[<>\"'&]/g, '') // Remove dangerous characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 10000); // Limit length
  }

  /**
   * Sanitize email input
   */
  sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeString(email).toLowerCase();
    // Basic email pattern validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize phone number
   */
  sanitizePhone(phone: string): string {
    const sanitized = this.sanitizeString(phone);
    // Allow only numbers, spaces, hyphens, parentheses, and plus
    const phonePattern = /^[\d\s\-\(\)\+]+$/;
    return phonePattern.test(sanitized) ? sanitized.replace(/\s+/g, ' ').trim() : '';
  }

  /**
   * Validate text input
   */
  validateText(value: string, rules: ValidationRule = {}): ValidationResult {
    const errors: string[] = [];
    const sanitized = this.sanitizeString(value);

    if (rules.required && (!sanitized || sanitized.length === 0)) {
      errors.push(rules.errorMessage || 'שדה זה הוא חובה');
    }

    if (rules.minLength && sanitized.length < rules.minLength) {
      errors.push(rules.errorMessage || `הטקסט חייב להיות לפחות ${rules.minLength} תווים`);
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors.push(rules.errorMessage || `הטקסט לא יכול להיות יותר מ-${rules.maxLength} תווים`);
    }

    if (rules.pattern && !rules.pattern.test(sanitized)) {
      errors.push(rules.errorMessage || 'הפורמט אינו תקין');
    }

    if (rules.custom && !rules.custom(sanitized)) {
      errors.push(rules.errorMessage || 'ערך לא תקין');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate email
   */
  validateEmail(email: string, required = true): ValidationResult {
    const sanitized = this.sanitizeEmail(email);
    const errors: string[] = [];

    if (required && !sanitized) {
      errors.push('כתובת אימייל היא חובה');
    } else if (sanitized && !sanitized.includes('@')) {
      errors.push('כתובת אימייל לא תקינה');
    } else if (sanitized && sanitized.length > 254) {
      errors.push('כתובת אימייל ארוכה מדי');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string, required = true): ValidationResult {
    const sanitized = this.sanitizePhone(phone);
    const errors: string[] = [];

    if (required && !sanitized) {
      errors.push('מספר טלפון הוא חובה');
    } else if (sanitized) {
      const digitsOnly = sanitized.replace(/\D/g, '');
      if (digitsOnly.length < 9) {
        errors.push('מספר טלפון לא תקין - חייב לפחות 9 ספרות');
      } else if (digitsOnly.length > 15) {
        errors.push('מספר טלפון ארוך מדי');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }

  /**
   * Validate lead form data
   */
  validateLeadForm(data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }): { isValid: boolean; errors: Record<string, string[]>; sanitizedData?: typeof data } {
    const results = {
      name: this.validateText(data.name, {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z\u0590-\u05FF\s]+$/,
        errorMessage: 'שם יכול להכיל רק אותיות ורווחים'
      }),
      email: this.validateEmail(data.email),
      phone: this.validatePhone(data.phone),
      message: this.validateText(data.message, {
        required: true,
        minLength: 10,
        maxLength: 2000,
        errorMessage: 'הודעה חייבת להיות בין 10 ל-2000 תווים'
      })
    };

    const errors: Record<string, string[]> = {};
    let allValid = true;

    Object.entries(results).forEach(([field, result]) => {
      if (!result.isValid) {
        errors[field] = result.errors;
        allValid = false;
      }
    });

    return {
      isValid: allValid,
      errors,
      sanitizedData: allValid ? {
        name: results.name.sanitizedValue,
        email: results.email.sanitizedValue,
        phone: results.phone.sanitizedValue,
        message: results.message.sanitizedValue
      } : undefined
    };
  }

  /**
   * Validate contact form data
   */
  validateContactForm(data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }): { isValid: boolean; errors: Record<string, string[]>; sanitizedData?: typeof data } {
    // Same validation as lead form
    return this.validateLeadForm(data);
  }

  /**
   * Check for bot-like behavior
   */
  detectBotBehavior(data: Record<string, any>): boolean {
    // Check for honeypot fields
    if (data.website || data.url || data.link) {
      return true;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    const textFields = Object.values(data).filter(val => typeof val === 'string') as string[];
    return textFields.some(field =>
      suspiciousPatterns.some(pattern => pattern.test(field))
    );
  }

  /**
   * Rate limit check for submissions
   */
  checkSubmissionFrequency(lastSubmission: number, minInterval = 30000): boolean {
    return Date.now() - lastSubmission >= minInterval;
  }
}

// Export singleton instance
export const validationService = new ValidationService();