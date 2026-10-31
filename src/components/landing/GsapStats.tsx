"use client";

import { useEffect, useRef } from "react";
import { useStudioReveal } from "./useStudioReveal";

interface StatDef { value: number; suffix: string; label: string; }
export default function GsapStats({ stats, locale = "en" }: { stats: StatDef[]; locale?: string }) {
  const container = useRef<HTMLElement>(null);
  useStudioReveal(container);
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(root.querySelectorAll<HTMLElement>("[data-studio-number]"));
    let frame = 0;
    const finish = () => { cancelAnimationFrame(frame); elements.forEach(element => { element.textContent = element.dataset.studioNumber || ""; }); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (motion.matches) return;
      const started = performance.now();
      const count = (now: number) => {
        const progress = Math.min(1, (now - started) / 1400);
        const eased = 1 - Math.pow(1 - progress, 3);
        elements.forEach(element => { element.textContent = String(Math.round(Number(element.dataset.studioNumber) * eased)); });
        if (progress < 1) frame = requestAnimationFrame(count);
      };
      frame = requestAnimationFrame(count);
    });
    observer.observe(root);
    const reduce = () => { if (motion.matches) finish(); };
    motion.addEventListener("change", reduce);
    return () => { finish(); observer.disconnect(); motion.removeEventListener("change", reduce); };
  }, []);
  if (!stats?.length) return null;
  return (
    <section ref={container} className="studio-stats" aria-label={locale === "zh" ? "实践成果" : "A little perspective"}>
      <div className="studio-shell studio-proof-layout">
        <div className="studio-proof-intro" data-studio-reveal="">
          <span className="studio-eyebrow">{locale === "zh" ? "想法之外" : "Beyond the idea"}</span>
          <h2>{locale === "zh" ? "创意有形。" : "Creative thinking."}<br /><em>{locale === "zh" ? "影响可见。" : "Tangible impact."}</em></h2>
          <p>{locale === "zh" ? "策略、构建与探索，让想法真正落地。" : "A practice shaped by strategy, building, and the curiosity to keep going further."}</p>
        </div>
        <dl className="studio-stats-grid">
          {stats.map((stat, index) => <div key={stat.label} className="studio-stat" data-studio-reveal={String(index * 0.05)}>
            <dt className="studio-stat-label"><span aria-hidden="true">0{index + 1}</span>{stat.label}</dt>
            <dd aria-label={stat.value + stat.suffix} className="studio-stat-value"><span aria-hidden="true" data-studio-number={stat.value}>{stat.value}</span><span aria-hidden="true" className="studio-stat-suffix">{stat.suffix}</span></dd>
          </div>)}
        </dl>
      </div>
    </section>
  );
}
