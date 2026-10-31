"use client";

import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CImage from "@/components/ui/CImage";
import { useStudioReveal } from "./useStudioReveal";
import TerminalCandles from "./TerminalCandles";

interface ProjectDef { tag: string; award?: string; title: string; desc: string; href: string; }
interface GsapBentoProps { projects: ProjectDef[]; locale: string; }

function ProjectVisual({ index, title }: { index: number; title: string }) {
  if (index % 4 === 0) return (
    <div className="studio-cover-health">
      <div className="studio-health-orbits" />
      <div className="studio-health-symbol"><span /><span /><span /><span /></div>
      <span className="studio-cover-wordmark">{title}</span>
      <span className="studio-cover-footnote">HUMAN-CENTERED INTELLIGENCE</span>
    </div>
  );
  if (index % 4 === 1) return (
    <div className="studio-cover-finance">
      <div className="studio-market-grid" />
      <span className="studio-terminal-label">MARKET INTELLIGENCE / LIVE IDEAS</span>
      <TerminalCandles />
      <span className="studio-cover-wordmark">{title}</span>
      <span className="studio-cover-footnote">DATA INTO PERSPECTIVE.</span>
    </div>
  );
  if (index % 4 === 2) return (
    <div className="studio-cover-identity">
      <span className="studio-cover-monogram">S.</span>
      <div className="studio-cover-statue studio-cover-statue--medusa"><CImage src="/images/statues-dark/medusa-dark-hair-v7.webp" alt="" fill sizes="(min-width: 768px) 40vw, 90vw" className="object-contain" /></div>
      <div className="studio-cover-statue studio-cover-statue--classic"><CImage src="/images/hero-statue-clean.webp" alt="" fill sizes="(min-width: 768px) 40vw, 90vw" className="object-contain" /></div>
      <span className="studio-cover-footnote">CLASSICAL FORM / DIGITAL THINKING</span>
    </div>
  );
  return (
    <div className="studio-cover-syntax">
      <span className="studio-syntax-star">✳</span>
      <span className="studio-cover-wordmark">{title}</span>
      <span className="studio-cover-footnote">AN INTELLIGENT CONVERSATION.</span>
      <span className="studio-syntax-prompt">Hello, possibility.<span>_</span></span>
    </div>
  );
}

export default function GsapBento({ projects, locale }: GsapBentoProps) {
  const container = useRef<HTMLElement>(null);
  useStudioReveal(container);
  if (!projects?.length) return null;
  const isZh = locale === "zh";
  const base = isZh ? "/zh" : "";
  return (
    <section ref={container} id="selected-work" className="studio-work studio-section" aria-labelledby="studio-work-title">
      <div className="studio-shell">
        <div className="studio-section-heading" data-studio-reveal="">
          <div>
            <p className="studio-eyebrow"><span className="studio-section-index">01 /</span> {isZh ? "精选作品" : "Selected works"}</p>
            <h2 id="studio-work-title" className="studio-section-title">{isZh ? "为创意赋形。" : "Ideas, made"}<br /><em>{isZh ? "让作品有分量。" : "meaningful."}</em></h2>
          </div>
          <div className="studio-section-aside"><p>{isZh ? "策略、设计与技术的交汇。每件作品，都是一次全新的探索。" : "A meeting of strategy, design, and technology. Each project, a different kind of possibility."}</p><Link href={base + "/portfolio"} className="studio-text-link">{isZh ? "全部作品" : "Explore the portfolio"}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </div>

        <div className="studio-project-grid">
          {projects.map((project, index) => {
            const external = project.href.startsWith("http");
            return (
              <Link key={project.href} href={external ? project.href : base + project.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="studio-project" data-studio-reveal={String((index % 2) * 0.08)}>
                <div className={"studio-project-cover studio-project-cover-" + (index % 4)}>
                  <div className="studio-project-cover-inner" aria-hidden="true"><ProjectVisual index={index} title={project.title} /></div>
                  <span className="studio-project-index" aria-hidden="true">0{index + 1} / SS</span>
                  <span className="studio-project-open" aria-hidden="true"><ArrowUpRight size={23} /></span>
                </div>
                <div className="studio-project-meta"><span className="studio-eyebrow">{project.tag}</span>{project.award && <span className="studio-project-award">{project.award}</span>}</div>
                <div className="studio-project-title-row"><h3>{project.title}</h3><ArrowUpRight size={22} aria-hidden="true" /></div>
                <p className="studio-project-description">{project.desc}</p>
                {external && <span className="sr-only">{isZh ? "在新标签页打开" : "Opens in a new tab"}</span>}
              </Link>
            );
          })}
        </div>
        <div className="studio-work-end" data-studio-reveal=""><span className="studio-eyebrow">{isZh ? "每个想法，都值得认真对待。" : "Different disciplines. The same attention to detail."}</span><Link href={base + "/portfolio"} className="studio-text-link">{isZh ? "更多作品与探索" : "More work, more possibilities"}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
