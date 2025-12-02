/**
 * Analytics - Rastreamento de eventos e pageviews
 * Suporta Google Analytics 4, Plausible e PostHog
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean = false;
  private provider: 'ga4' | 'plausible' | 'posthog' | null = null;

  constructor() {
    // Detectar provider baseado em variáveis de ambiente
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      this.provider = 'ga4';
      this.enabled = true;
      this.initGA4();
    } else if (import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
      this.provider = 'plausible';
      this.enabled = true;
      this.initPlausible();
    } else if (import.meta.env.VITE_POSTHOG_KEY) {
      this.provider = 'posthog';
      this.enabled = true;
      this.initPostHog();
    }
  }

  private initGA4() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    // Carregar script do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Inicializar gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(arguments);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // Controlar manualmente
    });
  }

  private initPlausible() {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    
    // Carregar script do Plausible
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  private initPostHog() {
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
    
    // Carregar PostHog via CDN
    const script = document.createElement('script');
    script.innerHTML = `
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${apiKey}',{api_host:'${apiHost}'})
    `;
    document.head.appendChild(script);
  }

  /**
   * Rastrear pageview
   */
  page(path?: string) {
    if (!this.enabled) return;

    const pagePath = path || window.location.pathname;

    if (this.provider === 'ga4' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: document.title,
      });
    } else if (this.provider === 'plausible' && (window as any).plausible) {
      (window as any).plausible('pageview');
    } else if (this.provider === 'posthog' && (window as any).posthog) {
      (window as any).posthog.capture('$pageview');
    }

    console.log('[Analytics] Page view:', pagePath);
  }

  /**
   * Rastrear evento customizado
   */
  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    if (this.provider === 'ga4' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    } else if (this.provider === 'plausible' && (window as any).plausible) {
      (window as any).plausible(event, { props: properties });
    } else if (this.provider === 'posthog' && (window as any).posthog) {
      (window as any).posthog.capture(event, properties);
    }

    console.log('[Analytics] Event:', event, properties);
  }

  /**
   * Identificar usuário
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.enabled) return;

    if (this.provider === 'ga4' && (window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId,
        ...traits,
      });
    } else if (this.provider === 'posthog' && (window as any).posthog) {
      (window as any).posthog.identify(userId, traits);
    }

    console.log('[Analytics] Identify:', userId, traits);
  }

  /**
   * Resetar identidade (logout)
   */
  reset() {
    if (!this.enabled) return;

    if (this.provider === 'posthog' && (window as any).posthog) {
      (window as any).posthog.reset();
    }

    console.log('[Analytics] Reset');
  }
}

// Exportar instância singleton
export const analytics = new Analytics();

// Eventos pré-definidos
export const AnalyticsEvents = {
  // Projetos
  PROJETO_CRIADO: 'projeto_criado',
  PROJETO_EDITADO: 'projeto_editado',
  PROJETO_DELETADO: 'projeto_deletado',
  PROJETO_ARQUIVADO: 'projeto_arquivado',
  
  // Pesquisas
  PESQUISA_CRIADA: 'pesquisa_criada',
  PESQUISA_EXECUTADA: 'pesquisa_executada',
  PESQUISA_CANCELADA: 'pesquisa_cancelada',
  
  // Importação
  IMPORTACAO_INICIADA: 'importacao_iniciada',
  IMPORTACAO_CONCLUIDA: 'importacao_concluida',
  IMPORTACAO_ERRO: 'importacao_erro',
  
  // Enriquecimento
  ENRIQUECIMENTO_INICIADO: 'enriquecimento_iniciado',
  ENRIQUECIMENTO_CONCLUIDO: 'enriquecimento_concluido',
  ENRIQUECIMENTO_ERRO: 'enriquecimento_erro',
  
  // Análise
  CUBO_CONSULTA: 'cubo_consulta',
  CUBO_EXPORT: 'cubo_export',
  ANALISE_TEMPORAL: 'analise_temporal',
  ANALISE_GEOGRAFICA: 'analise_geografica',
  ANALISE_MERCADO: 'analise_mercado',
  
  // Erros
  ERRO_CAPTURADO: 'erro_capturado',
  ERRO_BOUNDARY: 'erro_boundary',
};
