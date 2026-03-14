'use client';

import { useState, useEffect } from 'react';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

export function ContactFormZh() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    message: '',
  });
  const [charCount, setCharCount] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Scroll-triggered fade-up animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.15 }
    );
    const els = document.querySelectorAll('.animate-on-scroll');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'message') {
      setCharCount(Math.max(0, 500 - value.length));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get HubSpot tracking token from cookies
      const hutkMatch = document.cookie.match(/(?:^|; )hubspotutk=([^;]*)/);
      const hutk = hutkMatch ? hutkMatch[1] : null;

      // Prepare form data in the format expected by your Cloudflare Worker
      const fields = [
        { name: 'email', value: formData.email },
        { name: 'firstname', value: formData.firstName },
        { name: 'lastname', value: formData.lastName },
        { name: 'message', value: formData.message },
      ];

      const payload = {
        portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
        formId: process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID,
        fields: fields,
        context: {
          hutk: hutk,
          pageUri: typeof window !== 'undefined' ? window.location.href : '',
          pageName: '联系我页面',
        },
      };

      console.log('[v0] Form submission payload:', payload);

      // Send to your Cloudflare Worker
      const response = await fetch(
        process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://form-collector.shainwaiyan.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('[v0] Response status:', response.status);
      const responseData = await response.json();
      console.log('[v0] Response data:', responseData);

      if (response.ok) {
        setSubmitMessage('谢谢！您的消息已成功发送。我会尽快回复您！');
        setSubmitStatus('success');
        setFormData({ email: '', firstName: '', lastName: '', message: '' });
        setCharCount(500);
      } else {
        throw new Error(responseData.error || '表单提交失败');
      }
    } catch (error) {
      console.error('[v0] Form submission error:', error);
      setSubmitMessage('哎呀！出现了问题。请再试一次。');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <main className="bg-white dark:bg-slate-950 min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative py-32 md:py-40 text-center overflow-hidden bg-gradient-to-b from-[#191970] to-[#2a2a9a] dark:from-[#a67c00] dark:to-[#704700]">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            联系<span className="text-[#ffd700] dark:text-[#f9df85]">我</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100">
            我对营销、故事叙述和技术充满热情。让我们合作创造有意义的数字体验。
          </p>
        </div>
      </section>

      {/* ── Contact Form Section ── */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background relative">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {/* Form Header */}
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-4 font-secondary">
              保持联系
            </h2>
            <p className="text-lg text-text-light dark:text-text-inverse-light">
              我总是很高兴听到新的项目、合作机会，或者讨论关于营销和技术的话题。欢迎随时与我联系！
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-background-alt dark:bg-slate-900 rounded-2xl shadow-lg p-8 md:p-12 animate-on-scroll
            transition-all duration-500 hover:shadow-2xl border border-gray-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="block text-sm font-bold text-primary dark:text-white mb-3">
                  电子邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-700
                    bg-white dark:bg-slate-800 text-text dark:text-white
                    focus:border-[#ffd700] focus:outline-none focus:ring-2 focus:ring-[#ffd700]/20
                    transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="firstName" className="block text-sm font-bold text-primary dark:text-white mb-3">
                    名字
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    placeholder="您的名字"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-700
                      bg-white dark:bg-slate-800 text-text dark:text-white
                      focus:border-[#ffd700] focus:outline-none focus:ring-2 focus:ring-[#ffd700]/20
                      transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="block text-sm font-bold text-primary dark:text-white mb-3">
                    姓氏
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    placeholder="您的姓氏"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-700
                      bg-white dark:bg-slate-800 text-text dark:text-white
                      focus:border-[#ffd700] focus:outline-none focus:ring-2 focus:ring-[#ffd700]/20
                      transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="form-group">
                <label htmlFor="message" className="block text-sm font-bold text-primary dark:text-white mb-3">
                  留言内容
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  rows={6}
                  placeholder="我可以如何帮助您？"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-slate-700
                    bg-white dark:bg-slate-800 text-text dark:text-white
                    focus:border-[#ffd700] focus:outline-none focus:ring-2 focus:ring-[#ffd700]/20
                    transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-text-light dark:text-text-inverse-light">
                    剩余字符数：{charCount}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 rounded-lg font-bold text-white
                  bg-gradient-to-r from-[#191970] to-[#2a2a9a] dark:from-[#a67c00] dark:to-[#d4af37]
                  hover:shadow-lg hover:shadow-[#ffd700]/30 dark:hover:shadow-[#d4af37]/30
                  transform hover:scale-105 active:scale-95
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin">✓</span>
                    发送中...
                  </>
                ) : (
                  <>
                    <FaEnvelope className="text-lg" />
                    发送留言
                  </>
                )}
              </button>

              {/* Submit Message */}
              {submitStatus !== 'idle' && (
                <div className={`p-4 rounded-lg text-center font-semibold animate-fade-in
                  ${submitStatus === 'success'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border border-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border border-red-400'
                  }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── Social Links Section ── */}
      <section className="py-12 md:py-20 px-4 md:px-0 bg-background-alt dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white mb-8 font-secondary animate-on-scroll">
            社交媒体与专业平台
          </h2>

          <div className="flex justify-center gap-8 md:gap-12 animate-on-scroll">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/shainwaiyan/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="访问明元易的 LinkedIn 主页"
              className="flex flex-col items-center gap-3 group transition-transform duration-300 hover:scale-110"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#0077B5] to-[#0050A3]
                flex items-center justify-center text-white shadow-lg
                transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <FaLinkedin className="text-3xl md:text-4xl" />
              </div>
              <span className="text-sm font-bold text-primary dark:text-white transition-colors duration-300 group-hover:text-[#0077B5]">
                LinkedIn
              </span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/Shain-Wai-Yan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="访问明元易的 GitHub 主页"
              className="flex flex-col items-center gap-3 group transition-transform duration-300 hover:scale-110"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900
                flex items-center justify-center text-white shadow-lg
                transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <FaGithub className="text-3xl md:text-4xl" />
              </div>
              <span className="text-sm font-bold text-primary dark:text-white transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-300">
                GitHub
              </span>
            </a>

            {/* Email */}
            <a
              href="mailto:contact@shainwaiyan.com"
              aria-label="发送电子邮件给明元易"
              className="flex flex-col items-center gap-3 group transition-transform duration-300 hover:scale-110"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#ffd700] to-[#e6c200]
                flex items-center justify-center text-[#191970] shadow-lg
                transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <FaEnvelope className="text-3xl md:text-4xl" />
              </div>
              <span className="text-sm font-bold text-primary dark:text-white transition-colors duration-300 group-hover:text-[#ffd700]">
                电子邮件
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
