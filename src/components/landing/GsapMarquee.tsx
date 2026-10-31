"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function StudioMarquee({ locale, items }: { locale: string; items?: string[] }) {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const isZh = locale === "zh";
  const disciplines = isZh
    ? ["品牌策略", "数字体验", "创意技术", "品牌身份"]
    : ["Brand strategy", "Digital experiences", "Creative technology", "Brand identity"];
  const tools = items?.length ? items : ["Next.js", "SEO", "AI orchestration", "System architecture"];

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let visible = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      element.dataset.running = String(visible && !paused && !document.hidden && !motion.matches);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [paused]);

  return (
    <section id="studio-disciplines" ref={root} className="studio-motion" data-running="false" aria-labelledby="studio-motion-title">
      <div className="studio-shell studio-motion-layout">
        <div className="studio-motion-intro">
          <span className="studio-motion-eyebrow">{isZh ? "思考与创造之间" : "Where thinking meets making"}</span>
          <h2 id="studio-motion-title">{isZh ? "不同领域。" : "Different disciplines."}<br /><em>{isZh ? "同一方向。" : "One direction."}</em></h2>
          <button type="button" className="studio-motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
            {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
            <span>{paused ? (isZh ? "继续滚动" : "Resume motion") : (isZh ? "暂停滚动" : "Pause motion")}</span>
          </button>
        </div>
        <div className="studio-motion-lanes">
          <div className="studio-motion-lane studio-motion-lane-main" tabIndex={0} role="group" aria-label={isZh ? "工作领域" : "Creative disciplines"}>
            <div className="studio-motion-track">
              {[0, 1].map(copy => <ul key={copy} className="studio-motion-copy" role="list" aria-hidden={copy === 1}>
                {[...disciplines, ...disciplines].map((item, index) => <li key={index} aria-hidden={index >= disciplines.length}>{item}<span aria-hidden="true">/</span></li>)}
              </ul>)}
            </div>
          </div>
          <div className="studio-motion-lane studio-motion-lane-tools" tabIndex={0} role="group" aria-label={isZh ? "技术与专长" : "Tools and expertise"}>
            <div className="studio-motion-track">
              {[0, 1].map(copy => <ul key={copy} className="studio-motion-copy" role="list" aria-hidden={copy === 1}>
                {[...tools, ...tools].map((item, index) => <li key={index} aria-hidden={index >= tools.length}>{item}<span aria-hidden="true">·</span></li>)}
              </ul>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
