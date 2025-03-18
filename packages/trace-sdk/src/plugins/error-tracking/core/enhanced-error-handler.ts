import { ErrorSeverity, ErrorCategory, ErrorContext, ExceptionMetrics, ErrorEventType } from '../types';
import { generateUniqueId } from '../../../utils';

interface ErrorHandlerConfig {
  samplingRate: number;
  maxQueueSize: number;
  environment: string;
  release?: string;
  tags?: Record<string, string>;
}

export class EnhancedErrorHandler {
  private config: ErrorHandlerConfig;
  private errorQueue: ExceptionMetrics[] = [];

  constructor(config: ErrorHandlerConfig) {
    this.config = {
      ...{
        samplingRate: 1.0,
        maxQueueSize: 100,
        environment: 'production',
      },
      ...config,
    };
  }

  public handleError(error: Error): ExceptionMetrics | null {
    if (!this.shouldSample()) {
      return null;
    }

    const errorMetrics = this.buildErrorMetrics(error);
    this.addToQueue(errorMetrics);
    return errorMetrics;
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  private buildErrorMetrics(error: Error): ExceptionMetrics {
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error);
    const context = this.buildErrorContext(severity, category);

    return {
      type: 'js_error' as ErrorEventType,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      errorUid: generateUniqueId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      severity,
      category,
      context,
      sampling: {
        rate: this.config.samplingRate,
        isSelected: true,
      },
      mechanism: {
        type: 'js',
        handled: true,
      },
      meta: {
        name: error.name,
        ...this.config.tags,
      },
    };
  }

  private categorizeError(error: Error): ErrorCategory {
    switch (error.name) {
      case 'TypeError':
      case 'ReferenceError':
        return ErrorCategory.RUNTIME;
      case 'SyntaxError':
        return ErrorCategory.SYNTAX;
      case 'NetworkError':
      case 'AbortError':
        return ErrorCategory.NETWORK;
      case 'SecurityError':
        return ErrorCategory.SECURITY;
      default:
        return ErrorCategory.CUSTOM;
    }
  }

  private determineSeverity(error: Error): ErrorSeverity {
    switch (error.name) {
      case 'TypeError':
      case 'ReferenceError':
        return ErrorSeverity.HIGH;
      case 'SyntaxError':
        return ErrorSeverity.CRITICAL;
      case 'NetworkError':
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.LOW;
    }
  }

  private buildErrorContext(severity: ErrorSeverity, category: ErrorCategory): ErrorContext {
    return {
      severity,
      category,
      environment: this.config.environment,
      release: this.config.release,
      tags: this.config.tags,
      deviceInfo: this.getDeviceInfo(),
      networkInfo: this.getNetworkInfo(),
      sessionId: this.getSessionId(),
    };
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    const browser = this.detectBrowser(ua);
    const os = this.detectOS(ua);

    return {
      os,
      browser,
      device: this.detectDevice(ua),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
  }

  private getNetworkInfo() {
    const connection = (navigator as any).connection;
    if (!connection) return {};

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }

  private detectBrowser(ua: string): string {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private detectOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
  }

  private detectDevice(ua: string): string {
    if (ua.includes('Mobile')) return 'Mobile';
    if (ua.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('trace_session_id');
    if (!sessionId) {
      sessionId = generateUniqueId();
      sessionStorage.setItem('trace_session_id', sessionId);
    }
    return sessionId;
  }

  private addToQueue(error: ExceptionMetrics): void {
    if (this.errorQueue.length >= this.config.maxQueueSize) {
      this.errorQueue.shift(); // 移除最早的错误
    }
    this.errorQueue.push(error);
  }

  public getQueue(): ExceptionMetrics[] {
    return [...this.errorQueue];
  }

  public clearQueue(): void {
    this.errorQueue = [];
  }
}
