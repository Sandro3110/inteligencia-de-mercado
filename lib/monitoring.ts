/**
 * Sistema de Monitoramento e Analytics
 *
 * Rastreia:
 * - Ações de usuário
 * - Performance
 * - Erros
 * - Métricas de negócio
 */

interface EventData {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class MonitoringService {
  private isProduction = process.env.NODE_ENV === 'production';
  private isStaging = process.env.NEXT_PUBLIC_APP_ENV === 'staging';
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Rastrear evento de usuário
   */
  trackEvent(data: EventData) {
    const event = {
      ...data,
      timestamp: new Date().toISOString(),
      environment: this.getEnvironment(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Log no console em dev/staging
    if (this.isDevelopment || this.isStaging) {
      console.log('📊 [Analytics]', event);
    }

    // Enviar para analytics em produção
    if (this.isProduction && typeof window !== 'undefined') {
      // Vercel Analytics
      if ((window as any).va) {
        (window as any).va('track', data.action, event);
      }

      // Google Analytics (se configurado)
      if ((window as any).gtag) {
        (window as any).gtag('event', data.action, {
          event_category: data.category,
          event_label: data.label,
          value: data.value,
        });
      }
    }
  }

  /**
   * Rastrear performance
   */
  trackPerformance(metric: PerformanceMetric) {
    const data = {
      ...metric,
      timestamp: new Date().toISOString(),
      environment: this.getEnvironment(),
    };

    // Log no console
    if (this.isDevelopment || this.isStaging) {
      const emoji =
        metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} [Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
    }

    // Enviar para analytics
    if (this.isProduction && typeof window !== 'undefined') {
      if ((window as any).va) {
        (window as any).va('track', 'performance', data);
      }
    }
  }

  /**
   * Rastrear erro
   */
  trackError(error: Error, context?: Record<string, any>) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      environment: this.getEnvironment(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Log no console
    console.error('❌ [Error]', errorData);

    // Enviar para Sentry (se configurado)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  /**
   * Rastrear ação de botão
   */
  trackButtonClick(buttonName: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'Button',
      action: 'click',
      label: buttonName,
      metadata,
    });
  }

  /**
   * Rastrear sucesso de ação
   */
  trackSuccess(actionName: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'Success',
      action: actionName,
      metadata,
    });
  }

  /**
   * Rastrear falha de ação
   */
  trackFailure(actionName: string, error: string, metadata?: Record<string, any>) {
    this.trackEvent({
      category: 'Failure',
      action: actionName,
      label: error,
      metadata,
    });
  }

  /**
   * Obter ambiente atual
   */
  private getEnvironment(): 'production' | 'staging' | 'development' {
    if (this.isProduction) return 'production';
    if (this.isStaging) return 'staging';
    return 'development';
  }
}

// Singleton
export const monitoring = new MonitoringService();

// Helpers para uso fácil
export const trackEvent = (data: EventData) => monitoring.trackEvent(data);
export const trackPerformance = (metric: PerformanceMetric) => monitoring.trackPerformance(metric);
export const trackError = (error: Error, context?: Record<string, any>) =>
  monitoring.trackError(error, context);
export const trackButtonClick = (buttonName: string, metadata?: Record<string, any>) =>
  monitoring.trackButtonClick(buttonName, metadata);
export const trackSuccess = (actionName: string, metadata?: Record<string, any>) =>
  monitoring.trackSuccess(actionName, metadata);
export const trackFailure = (actionName: string, error: string, metadata?: Record<string, any>) =>
  monitoring.trackFailure(actionName, error, metadata);
