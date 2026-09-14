'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/locales';
import ClarityAnalytics from '@/components/analytics/ClarityAnalytics';
import {
  type AnalyticsConsent,
  ANALYTICS_REGION_SESSION_KEY,
  readAnalyticsConsent,
  removeAnalyticsCookies,
  OPEN_ANALYTICS_SETTINGS_EVENT,
  updateGoogleAnalyticsConsent,
  writeAnalyticsConsent,
} from '@/lib/analytics-consent';

const COPY = {
  en: {
    eyebrow: 'Your privacy',
    title: 'Choose how we use analytics',
    description: 'We use Google Analytics and Microsoft Clarity to understand site performance and improve the experience. Where consent is required, they stay off unless you allow them. Elsewhere, you can turn them off here at any time. Necessary features always work.',
    accept: 'Allow analytics',
    reject: 'Necessary only',
    settings: 'Privacy settings',
    privacy: 'Read privacy policy',
    close: 'Close privacy settings',
  },
  zh: {
    eyebrow: '您的隐私',
    title: '选择分析数据的使用方式',
    description: '我们使用 Google Analytics 和 Microsoft Clarity 来了解网站性能并改善体验。在法律要求同意的地区，只有您允许后才会启用；在其他地区，您可以随时在此关闭。必要功能始终正常运行。',
    accept: '允许分析',
    reject: '仅必要功能',
    settings: '隐私设置',
    privacy: '阅读隐私政策',
    close: '关闭隐私设置',
  },
} as const;

interface AnalyticsConsentProps {
  locale: Locale;
  gaId?: string;
  clarityId?: string;
}

export default function AnalyticsConsentManager({ locale, gaId, clarityId }: AnalyticsConsentProps) {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const copy = COPY[locale];
  const privacyHref = locale === 'zh' ? '/zh/privacy' : '/privacy';

  useEffect(() => {
    const savedConsent = readAnalyticsConsent();
    if (savedConsent) {
      setConsent(savedConsent);
      setReady(true);
      return;
    }

    const sessionRegion = window.sessionStorage.getItem(ANALYTICS_REGION_SESSION_KEY);
    if (sessionRegion === 'consent-required') {
      setReady(true);
      return;
    }
    if (sessionRegion === 'automatic') {
      setConsent('granted');
      setReady(true);
      return;
    }

    const controller = new AbortController();
    void fetch('/api/analytics-region', { cache: 'no-store', signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to determine analytics region');
        return response.json() as Promise<{ consentRequired?: boolean }>;
      })
      .then(({ consentRequired }) => {
        if (consentRequired === false) {
          window.sessionStorage.setItem(ANALYTICS_REGION_SESSION_KEY, 'automatic');
          setConsent('granted');
        } else {
          window.sessionStorage.setItem(ANALYTICS_REGION_SESSION_KEY, 'consent-required');
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        // Unknown geography fails closed and displays the consent choice.
      })
      .finally(() => setReady(true));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_ANALYTICS_SETTINGS_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_ANALYTICS_SETTINGS_EVENT, openPreferences);
  }, []);

  const choose = async (nextConsent: AnalyticsConsent) => {
    writeAnalyticsConsent(nextConsent);
    updateGoogleAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
    setPreferencesOpen(false);

    if (nextConsent === 'denied') {
      try {
        const { default: Clarity } = await import('@microsoft/clarity');
        Clarity.consentV2({ ad_Storage: 'denied', analytics_Storage: 'denied' });
        Clarity.consent(false);
      } catch {
        // The tracker may never have loaded, which is the expected first-visit state.
      }
      removeAnalyticsCookies();
    }
  };

  const showPanel = ready && (consent === null || preferencesOpen);

  return (
    <>
      {process.env.NODE_ENV === 'production' && consent === 'granted' && (
        <>
          {clarityId && <ClarityAnalytics projectId={clarityId} />}
          {gaId && <GoogleAnalytics gaId={gaId} />}
        </>
      )}

      {showPanel && (
        <section
          role="dialog"
          aria-labelledby="analytics-consent-title"
          aria-describedby="analytics-consent-description"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white/95 p-5 text-stone-900 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-white/15 dark:bg-[#11111a]/95 dark:text-white sm:bottom-5 sm:p-6"
        >
          {preferencesOpen && (
            <button
              type="button"
              onClick={() => setPreferencesOpen(false)}
              aria-label={copy.close}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#191970] dark:hover:bg-white/10 dark:hover:text-white"
            >
              ×
            </button>
          )}
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#191970] dark:text-[#ffd700]">{copy.eyebrow}</p>
          <h2 id="analytics-consent-title" className="pr-10 font-serif text-xl font-bold sm:text-2xl">{copy.title}</h2>
          <p id="analytics-consent-description" className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">{copy.description}</p>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Link href={privacyHref} className="px-1 text-center text-xs font-semibold underline decoration-stone-300 underline-offset-4 hover:decoration-current sm:mr-auto sm:text-left">
              {copy.privacy}
            </Link>
            <button type="button" onClick={() => void choose('denied')} className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#191970] dark:border-white/20 dark:hover:bg-white/10">
              {copy.reject}
            </button>
            <button type="button" onClick={() => void choose('granted')} className="rounded-full bg-[#191970] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#29298b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd700] focus-visible:ring-offset-2 dark:bg-[#ffd700] dark:text-[#151515] dark:hover:bg-[#ffe34f]">
              {copy.accept}
            </button>
          </div>
        </section>
      )}

    </>
  );
}
