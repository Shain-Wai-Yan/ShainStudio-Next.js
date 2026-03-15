'use client';

import { useState, useRef, useEffect } from 'react';

interface BlogHeroProps {
  title: string;
  subtitle?: string;
  language: 'en' | 'zh';
}

type FormStep = 'email' | 'name' | 'loading' | 'success' | 'error';

// ── Exact values from your subscription-form.js ────────────────────────────
const HUBSPOT_PORTAL_ID = '49395743';
const HUBSPOT_FORM_ID   = '148e9cca-9066-40dc-8f56-2e4dbc0120d2';
const WORKER_URL        = 'https://form.shainwaiyan.com';

// ── Read hubspotutk cookie (matches vanilla getCookie helper) ──────────────
function getHubspotCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split('; hubspotutk=');
  if (parts.length === 2) return parts.pop()!.split(';').shift() ?? null;
  return null;
}

// ── Submit via your Cloudflare Worker (matches vanilla submitToHubspotWorker) ──
async function submitViaWorker(
  email: string,
  firstName: string,
  lastName: string
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      portalId: HUBSPOT_PORTAL_ID,
      formId:   HUBSPOT_FORM_ID,
      fields: [
        { name: 'email',     value: email },
        { name: 'firstname', value: firstName },
        { name: 'lastname',  value: lastName },
      ],
      context: {
        pageUri:  typeof window !== 'undefined' ? window.location.href : '',
        pageName: typeof document !== 'undefined' ? document.title : 'Blog | Shain Studio',
        hutk:     getHubspotCookie(),
      },
    }),
  });

  const result = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, message: result.message || result.error || `Error ${res.status}` };
  }
  return { ok: true };
}

export default function BlogHero({ title, subtitle, language }: BlogHeroProps) {
  const [step, setStep]           = useState<FormStep>('email');
  const [email, setEmail]         = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [errorMsg, setErrorMsg]   = useState('');
  const [isNarrow, setIsNarrow]   = useState(false);

  const emailRef     = useRef<HTMLInputElement>(null);
  const firstRef     = useRef<HTMLInputElement>(null);

  const zh = language === 'zh';

  // Responsive placeholder adjustment — mirrors vanilla adjustPlaceholders()
  useEffect(() => {
    function onResize() { setIsNarrow(window.innerWidth <= 480); }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-focus first name field when step changes to 'name'
  useEffect(() => {
    if (step === 'name') firstRef.current?.focus();
  }, [step]);

  // ── Step 1: validate email → show name fields ──────────────────────────
  function handleEmailNext() {
    const val = email.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setErrorMsg(zh ? '请输入有效的电子邮箱' : 'Please enter a valid email address');
      emailRef.current?.focus();
      return;
    }
    setErrorMsg('');
    setStep('name');
  }

  // ── Step 2: submit to Worker ───────────────────────────────────────────
  async function handleSubmit() {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg(zh ? '请填写您的姓名' : 'Please enter your first and last name.');
      return;
    }
    setStep('loading');
    setErrorMsg('');
    const result = await submitViaWorker(email.trim(), firstName.trim(), lastName.trim());
    if (result.ok) {
      setStep('success');
    } else {
      setErrorMsg(result.message || (zh ? '出错了，请重试' : 'Something went wrong. Please try again.'));
      setStep('error');
    }
  }

  function handleReset() {
    setStep('email');
    setEmail('');
    setFirstName('');
    setLastName('');
    setErrorMsg('');
  }

  // Shared input class
  const inputCls = 'flex-1 min-w-0 px-4 py-3 text-sm rounded-sm border-0 bg-white dark:bg-[#2a2a2a] text-[#333] dark:text-[#e0e0e0] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#191970]/30 dark:focus:ring-[#ffd700]/30 transition-all';
  const inputStyle = { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' };
  const btnStyle   = { background: '#191970', boxShadow: '0 2px 8px rgba(25,25,112,0.3)' };

  return (
    <section className="relative overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e] mt-[80px]">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23191970' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(25,25,112,0.04)_0%,transparent_70%)]" />

      {/* Content — generous padding on all sizes, never clips */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-5 sm:px-8 pt-10 pb-12 sm:pt-14 sm:pb-18">

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #191970, #e6c200)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>

        {/* Underline */}
        <div className="w-16 h-1 mx-auto mb-5 rounded-full bg-gradient-to-r from-[#191970] to-[#ffd700]" />

        {/* Subtitle — always visible, wraps naturally */}
        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-[#666] dark:text-[#b0b0b0] leading-relaxed mb-8">
            {subtitle}
          </p>
        )}

        {/* ── Newsletter form ── */}
        <div className="w-full max-w-md mx-auto text-left">

          {/* Label */}
          <p className="text-[10px] font-bold text-[#191970] dark:text-[#ffd700] uppercase tracking-widest mb-3 text-center">
            {zh ? '订阅最新文章' : 'Subscribe for updates'}
          </p>

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(25,25,112,0.1)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#191970" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#191970] dark:text-[#ffd700]">
                {zh ? '订阅成功！感谢您的关注。' : "You're subscribed! Thanks for joining."}
              </p>
              <p className="text-xs text-[#666] dark:text-[#b0b0b0]">
                {zh
                  ? '我们会在发布新文章时通知您。'
                  : "We'll send you an email when new articles are published."}
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {step === 'error' && (
            <div className="flex flex-col items-center gap-3 py-3 text-center">
              <p className="text-sm text-[#dc3545] dark:text-[#ff6b6b]">
                {errorMsg || (zh ? '出错了，请重试' : 'Something went wrong. Please try again.')}
              </p>
              <button onClick={handleReset} className="text-xs text-[#191970] dark:text-[#ffd700] hover:underline">
                {zh ? '重试' : 'Try again'}
              </button>
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <div className="flex gap-2">
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                  placeholder={zh ? '您的电子邮箱' : 'your@email.com'}
                  className={inputCls}
                  style={inputStyle}
                  aria-label={zh ? '电子邮箱' : 'Email address'}
                  autoComplete="email"
                />
                <button
                  onClick={handleEmailNext}
                  className="flex-shrink-0 px-5 py-3 text-sm font-bold text-white rounded-sm transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                  style={btnStyle}
                >
                  {zh ? '继续 »' : 'Next »'}
                </button>
              </div>
              {errorMsg && (
                <p className="mt-2 text-xs text-[#dc3545] dark:text-[#ff6b6b]" role="alert">{errorMsg}</p>
              )}
            </>
          )}

          {/* ── Step 2: Name ── */}
          {step === 'name' && (
            <>
              {/* Email confirmation + change link */}
              <p className="text-xs text-[#666] dark:text-[#b0b0b0] mb-2 truncate">
                {zh ? `邮箱：` : `Email: `}
                <span className="font-medium text-[#333] dark:text-[#e0e0e0]">{email}</span>
                {' — '}
                <button
                  onClick={() => { setStep('email'); setErrorMsg(''); }}
                  className="text-[#191970] dark:text-[#ffd700] hover:underline"
                >
                  {zh ? '修改' : 'Change'}
                </button>
              </p>

              {/* Name inputs — stack on very narrow screens */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <input
                  ref={firstRef}
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrorMsg(''); }}
                  placeholder={isNarrow ? (zh ? '名字' : 'First Name') : (zh ? '您的名字' : 'Your First Name')}
                  className={inputCls}
                  style={{ ...inputStyle, minWidth: '0' }}
                  aria-label={zh ? '名字' : 'First name'}
                  autoComplete="given-name"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setErrorMsg(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={isNarrow ? (zh ? '姓氏' : 'Last Name') : (zh ? '您的姓氏' : 'Your Last Name')}
                  className={inputCls}
                  style={{ ...inputStyle, minWidth: '0' }}
                  aria-label={zh ? '姓氏' : 'Last name'}
                  autoComplete="family-name"
                />
                <button
                  onClick={handleSubmit}
                  className="flex-shrink-0 px-5 py-3 text-sm font-bold text-white rounded-sm transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap w-full sm:w-auto"
                  style={btnStyle}
                >
                  {zh ? '订阅 »' : 'Subscribe »'}
                </button>
              </div>
              {errorMsg && (
                <p className="mt-2 text-xs text-[#dc3545] dark:text-[#ff6b6b]" role="alert">{errorMsg}</p>
              )}
            </>
          )}

          {/* ── Loading ── */}
          {step === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-4">
              <svg className="w-5 h-5 animate-spin text-[#191970] dark:text-[#ffd700]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm text-[#666] dark:text-[#b0b0b0]">
                {zh ? '订阅中...' : 'Subscribing...'}
              </span>
            </div>
          )}

          {/* Privacy note */}
          {(step === 'email' || step === 'name') && (
            <p className="mt-3 text-[10px] text-[#999] dark:text-[#666] text-center">
              {zh
                ? '我们尊重您的隐私，绝不发送垃圾邮件。随时可取消订阅。'
                : 'No spam, ever. Unsubscribe at any time.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}