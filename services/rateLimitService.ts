/**
 * Frontend Rate Limiting Service
 * Prevents abuse and ensures fair usage of resources
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  key: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private limits = new Map<string, RateLimitEntry>();

  /**
   * Check if request is allowed under rate limit
   */
  isAllowed(config: RateLimitConfig): boolean {
    const now = Date.now();
    const key = config.key;
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemainingRequests(config: RateLimitConfig): number {
    const entry = this.limits.get(config.key);
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get time until reset for a key
   */
  getTimeUntilReset(config: RateLimitConfig): number {
    const entry = this.limits.get(config.key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clear(): void {
    this.limits.clear();
  }

  /**
   * Lead submission rate limiter
   */
  checkLeadSubmission(): { allowed: boolean; remaining: number; resetIn: number } {
    const config: RateLimitConfig = {
      maxRequests: 3, // 3 submissions per window
      windowMs: 5 * 60 * 1000, // 5 minutes
      key: 'lead_submission'
    };

    const allowed = this.isAllowed(config);
    const remaining = this.getRemainingRequests(config);
    const resetIn = Math.ceil(this.getTimeUntilReset(config) / 1000); // seconds

    return { allowed, remaining, resetIn };
  }

  /**
   * Chat message rate limiter
   */
  checkChatMessage(): { allowed: boolean; remaining: number; resetIn: number } {
    const config: RateLimitConfig = {
      maxRequests: 10, // 10 messages per window
      windowMs: 60 * 1000, // 1 minute
      key: 'chat_message'
    };

    const allowed = this.isAllowed(config);
    const remaining = this.getRemainingRequests(config);
    const resetIn = Math.ceil(this.getTimeUntilReset(config) / 1000);

    return { allowed, remaining, resetIn };
  }

  /**
   * API request rate limiter
   */
  checkApiRequest(): { allowed: boolean; remaining: number; resetIn: number } {
    const config: RateLimitConfig = {
      maxRequests: 50, // 50 requests per window
      windowMs: 60 * 1000, // 1 minute
      key: 'api_request'
    };

    const allowed = this.isAllowed(config);
    const remaining = this.getRemainingRequests(config);
    const resetIn = Math.ceil(this.getTimeUntilReset(config) / 1000);

    return { allowed, remaining, resetIn };
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();