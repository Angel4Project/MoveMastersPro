import { googleSheetsService } from './googleSheetsService';

interface UserActivity {
  id: string;
  action: string;
  page: string;
  timestamp: number;
  userAgent: string;
  ip?: string;
  sessionId: string;
  referrer?: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  country?: string;
}

interface PageView {
  page: string;
  views: number;
  uniqueViews: number;
  avgTime: number;
  bounceRate: number;
}

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  activeUsers: number;
  topPages: PageView[];
  userActivity: UserActivity[];
  realTimeUsers: number;
}

class AnalyticsService {
  private sessionId: string;
  private activities: UserActivity[] = [];
  private pageStartTime: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private initializeTracking() {
    // Track page views
    this.trackPageView(window.location.pathname);

    // Track user interactions
    this.trackUserInteractions();

    // Track time on page
    this.trackTimeOnPage();

    // Track scroll depth
    this.trackScrollDepth();

    // Send data periodically
    setInterval(() => this.sendBatchData(), 30000); // Every 30 seconds
  }

  trackPageView(page: string) {
    this.pageStartTime = Date.now();

    const activity: UserActivity = {
      id: Date.now().toString(),
      action: 'page_view',
      page,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      referrer: document.referrer,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser()
    };

    this.activities.push(activity);
    this.sendActivity(activity);
  }

  private trackUserInteractions() {
    // Track button clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        this.trackActivity('button_click', target.textContent?.trim() || 'Unknown button');
      }

      // Track form submissions
      if (target.tagName === 'FORM' || target.closest('form')) {
        this.trackActivity('form_interaction', 'Form interaction');
      }
    });

    // Track link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;
      if (link) {
        this.trackActivity('link_click', link.href);
      }
    });
  }

  private trackTimeOnPage() {
    window.addEventListener('beforeunload', () => {
      const timeSpent = Date.now() - this.pageStartTime;
      this.trackActivity('time_on_page', timeSpent.toString());
    });
  }

  private trackScrollDepth() {
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (scrollPercent >= 25 && scrollPercent % 25 === 0) {
          this.trackActivity('scroll_depth', `${scrollPercent}%`);
        }
      }
    });
  }

  trackActivity(action: string, details: string = '') {
    const activity: UserActivity = {
      id: Date.now().toString(),
      action,
      page: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser()
    };

    this.activities.push(activity);
    this.sendActivity(activity);
  }

  private async sendActivity(activity: UserActivity) {
    try {
      // Send to Google Sheets
      await googleSheetsService.appendUserActivity(
        activity.action,
        activity.page,
        activity.userAgent,
        activity.ip
      );
    } catch (error) {
      console.error('Failed to send activity:', error);
    }
  }

  private async sendBatchData() {
    if (this.activities.length === 0) return;

    try {
      const batchData = this.activities.map(activity => ({
        range: 'UserActivity!A:F',
        values: [[
          activity.id,
          activity.action,
          activity.page,
          activity.userAgent,
          activity.ip || '',
          new Date(activity.timestamp).toISOString()
        ]]
      }));

      await googleSheetsService.batchUpdate(batchData);
      this.activities = []; // Clear sent activities
    } catch (error) {
      console.error('Failed to send batch data:', error);
    }
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const activities = await googleSheetsService.getAnalyticsData();

      // Process data
      const totalVisitors = new Set(activities.map((a: any) => a[5])).size; // Unique sessions
      const totalPageViews = activities.filter((a: any) => a[1] === 'page_view').length;

      // Calculate active users (last 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const activeUsers = new Set(
        activities
          .filter((a: any) => new Date(a[5]).getTime() > fiveMinutesAgo)
          .map((a: any) => a[5]) // session ID
      ).size;

      // Top pages
      const pageStats = activities.reduce((acc: any, activity: any) => {
        const page = activity[2]; // page column
        if (!acc[page]) {
          acc[page] = { views: 0, uniqueViews: new Set() };
        }
        acc[page].views++;
        acc[page].uniqueViews.add(activity[5]); // session ID
        return acc;
      }, {});

      const topPages = Object.entries(pageStats).map(([page, stats]: [string, any]) => ({
        page,
        views: stats.views,
        uniqueViews: stats.uniqueViews.size,
        avgTime: 0, // Would need time tracking data
        bounceRate: 0 // Would need exit page tracking
      }));

      return {
        totalVisitors,
        totalPageViews,
        activeUsers,
        topPages: topPages.slice(0, 10),
        userActivity: activities.map((a: any) => ({
          id: a[0],
          action: a[1],
          page: a[2],
          timestamp: new Date(a[5]).getTime(),
          userAgent: a[3],
          sessionId: a[5],
          deviceType: 'desktop', // Would need to parse user agent
          browser: 'Unknown'
        })),
        realTimeUsers: activeUsers
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      return {
        totalVisitors: 0,
        totalPageViews: 0,
        activeUsers: 0,
        topPages: [],
        userActivity: [],
        realTimeUsers: 0
      };
    }
  }

  // Public method to manually track custom events
  trackEvent(action: string, details: string = '') {
    this.trackActivity(action, details);
  }
}

export const analyticsService = new AnalyticsService();