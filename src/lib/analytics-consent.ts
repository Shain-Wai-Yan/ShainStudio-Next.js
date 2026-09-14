export const ANALYTICS_CONSENT_KEY = 'shain-studio:analytics-consent:v1';
export const ANALYTICS_REGION_SESSION_KEY = 'shain-studio:analytics-region:v1';
export const OPEN_ANALYTICS_SETTINGS_EVENT = 'shain-studio:open-analytics-settings';

export type AnalyticsConsent = 'granted' | 'denied';

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

export function writeAnalyticsConsent(value: AnalyticsConsent) {
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
}

export function updateGoogleAnalyticsConsent(value: AnalyticsConsent) {
  if (typeof window === 'undefined') return;
  const win = window as typeof window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  // Queue the consent update even when the Google tag has not mounted yet.
  // GoogleAnalytics consumes this dataLayer when its script initializes.
  win.dataLayer ??= [];
  win.gtag ??= (...args: unknown[]) => {
    win.dataLayer?.push(args);
  };
  win.gtag('consent', 'update', { analytics_storage: value });
}

export function readEffectiveAnalyticsConsent(): AnalyticsConsent | null {
  const explicitConsent = readAnalyticsConsent();
  if (explicitConsent) return explicitConsent;
  if (typeof window === 'undefined') return null;

  return window.sessionStorage.getItem(ANALYTICS_REGION_SESSION_KEY) === 'automatic'
    ? 'granted'
    : null;
}

export function removeAnalyticsCookies() {
  const analyticsCookie = /^(_ga|_gid|_gat|_gac_|_clck$|_clsk$|CLID$|ANONCHK$|MR$|MUID$|SM$)/;
  const hostnameParts = window.location.hostname.split('.');
  const domains = ['', window.location.hostname];

  if (hostnameParts.length > 1) domains.push(`.${hostnameParts.slice(-2).join('.')}`);

  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0]?.trim();
    if (!name || !analyticsCookie.test(name)) return;

    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : '';
      document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
    }
  });
}
