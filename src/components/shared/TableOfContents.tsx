'use client';

import { useEffect, useRef, useState } from 'react';

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  language: 'en' | 'zh';
  /** Selector for the rendered article body to scan for headings */
  containerSelector?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function TableOfContents({
  language,
  containerSelector = '.ck-body',
}: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState('');
  const [visible, setVisible] = useState(false);
  const [indicator, setIndicator] = useState<{ top: number; height: number }>({ top: 0, height: 0 });
  const listRef = useRef<HTMLDivElement>(null);

  // Scan the rendered rich-text body for h2/h3, assign anchor ids
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const elements = Array.from(container.querySelectorAll<HTMLElement>('h2, h3'));
      const used = new Set<string>();
      const collected: TocHeading[] = [];

      elements.forEach((el, index) => {
        const text = (el.textContent || '').trim();
        if (!text) return;

        const base = el.id || slugify(text) || `section-${index + 1}`;
        let id = base;
        let n = 2;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);

        el.id = id;
        el.style.scrollMarginTop = '30px'; // on top of the global 80px scroll-padding-top
        collected.push({ id, text, level: el.tagName === 'H3' ? 3 : 2 });
      });

      setHeadings(collected);
    });

    return () => cancelAnimationFrame(frame);
  }, [containerSelector]);

  // Track the section currently in view; hide the TOC once past the article
  useEffect(() => {
    if (headings.length < 2) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setVisible(rect.top < window.innerHeight * 0.75 && rect.bottom > 160);

      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 140) current = h.id;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [headings, containerSelector]);

  // Slide the rail indicator to the active item (re-measures on resize/reflow)
  useEffect(() => {
    const measure = () => {
      const wrap = listRef.current;
      if (!wrap) return;
      const idx = headings.findIndex((h) => h.id === activeId);
      const item = wrap.querySelectorAll<HTMLLIElement>('li')[idx];
      if (item) setIndicator({ top: item.offsetTop, height: item.offsetHeight });
    };
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [activeId, headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label={language === 'zh' ? '目录' : 'Table of contents'}
      inert={!visible}
      className={`hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 z-40 w-56 transition-all duration-300 ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 pointer-events-none'
      }`}
    >
      <p className="mb-3 pl-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
        {language === 'zh' ? '目录' : 'Contents'}
      </p>

      <div ref={listRef} className="relative max-h-[62vh] overflow-y-auto">
        {/* Sliding accent bar that glides to the active section on the rail */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 w-0.5 rounded-full bg-[#191970] dark:bg-white transition-[top,height,opacity] duration-300 ease-out motion-reduce:transition-none"
          style={{ top: indicator.top, height: indicator.height, opacity: indicator.height ? 1 : 0 }}
        />

        <ul className="space-y-0.5 border-l border-gray-200 dark:border-gray-700/70">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  title={h.text}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={() => setActiveId(h.id)}
                  className={`block py-1 pr-1 text-[13px] leading-snug line-clamp-2 break-words transition-colors duration-200 ${
                    h.level === 3 ? 'pl-7' : 'pl-4'
                  } ${
                    isActive
                      ? 'font-semibold text-[#191970] dark:text-white'
                      : 'text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
