"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ArrowUpRight, Asterisk } from "lucide-react";
import { useStudioReveal } from "./useStudioReveal";

interface MarketingPillarData { index: string; eyebrow: string; title: string; body: string; }
export interface GsapMarketingProps {
  data: {
    header: { eyebrow: string; line1: string; line2: string; line3: string; description: string; };
    pillars: MarketingPillarData[];
    intersection: { line1: string; line2: string; line3: string; };
    verdict: { eyebrow: string; text1: string; highlight1: string; highlight2: string; text2: string; items: string[]; };
  };
}

/** Keep the original reversible, word-by-word Verdict entrance near its viewport. */
function useVerdictMotion(scope: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void import("@/lib/gsapSetup").then(({ gsap }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          const timeline = gsap.timeline({ scrollTrigger: {
            id: "studio-verdict", trigger: root, start: "top 75%",
            toggleActions: "play none none reverse",
          } });
          timeline
            .fromTo(".verdict-eyebrow", { opacity: 0, letterSpacing: "0.5em" },
              { opacity: 1, letterSpacing: "0.25em", duration: 1, ease: "power3.out" })
            .fromTo(".verdict-word", { opacity: 0, y: 30, rotateX: 45 },
              { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 0.8, ease: "back.out(1.5)" }, "-=0.6")
            .fromTo(".verdict-item-line", { scaleX: 0, opacity: 0 },
              { scaleX: 1, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }, "-=0.2")
            .fromTo(".verdict-item-text", { opacity: 0, x: -20 },
              { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "<+0.2");
        }, root);
        revert = () => media.revert();
      }).catch(() => { /* The server-rendered Verdict stays readable without motion. */ });
    }, { rootMargin: "300px 0px" });
    observer.observe(root);
    return () => { cancelled = true; observer.disconnect(); revert?.(); };
  }, [scope]);
}

function VerdictWords({ text }: { text: string }) {
  return text.split(/(\s+)/).map((part, index) => /\s/.test(part)
    ? part : <span className="verdict-word" key={index}>{part}</span>);
}

function StatementWords({ text }: { text: string }) {
  // Chinese has no spaces: short character groups keep the same reading rhythm.
  const parts = /\s/.test(text) ? text.split(/(\s+)/) : Array.from(text);
  return <><span className="sr-only">{text}</span><span aria-hidden="true">{parts.map((part, index) => /\s/.test(part)
    ? part : <span className="studio-type-word" key={index}>{part}</span>)}</span></>;
}

function useApproachTypography(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void import("@/lib/gsapSetup").then(({ gsap }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(".studio-title-line > *", { yPercent: 110 }, {
            yPercent: 0, duration: 1.1, stagger: .12, ease: "power3.out", clearProps: "transform",
            scrollTrigger: { trigger: root.querySelector(".studio-approach-intro"), start: "top 82%", once: true },
          });
          const statement = root.querySelector(".studio-intersection");
          const words = gsap.utils.toArray<HTMLElement>(".studio-intersection .studio-type-word");
          gsap.fromTo(words, { opacity: .18, y: 12 }, {
            opacity: 1, y: 0, stagger: .08, ease: "none",
            scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 72%", scrub: .6 },
          });
          gsap.fromTo(".studio-intersection-mark", { rotate: -60, scale: .75 }, {
            rotate: 0, scale: 1, ease: "none",
            scrollTrigger: { trigger: statement, start: "top 82%", end: "center 65%", scrub: .8 },
          });
        }, root);
        revert = () => media.revert();
      }).catch(() => { /* Typography remains readable when motion cannot load. */ });
    }, { rootMargin: "250px 0px" });
    observer.observe(root);
    return () => { cancelled = true; observer.disconnect(); revert?.(); };
  }, [scope]);
}

export default function GsapMarketing({ data }: GsapMarketingProps) {
  const container = useRef<HTMLElement>(null);
  useStudioReveal(container);
  useApproachTypography(container);
  const verdictRef = useRef<HTMLDivElement>(null);
  useVerdictMotion(verdictRef);
  const { header, pillars, intersection, verdict } = data;
  return (
    <section ref={container} className="studio-approach studio-section" aria-labelledby="studio-approach-title">
      <div className="studio-shell">
        <div className="studio-approach-grid">
          <div className="studio-approach-intro">
            <p className="studio-eyebrow"><span className="studio-section-index">02 /</span> {header.eyebrow}</p>
            <h2 id="studio-approach-title" className="studio-section-title"><span className="studio-title-line"><span>{header.line1}</span></span><span className="studio-title-line"><em>{header.line2}</em></span><span className="studio-title-line"><span>{header.line3}</span></span></h2>
            <p className="studio-approach-description">{header.description}</p>
            <div className="studio-approach-mark" aria-hidden="true"><Asterisk size={48} strokeWidth={1} /><span>THOUGHTFULLY<br />CONNECTED.</span></div>
          </div>
          <div className="studio-services">
            {pillars.map((pillar) => (
              <article key={pillar.index} className="studio-service" data-studio-reveal="">
                <div className="studio-service-top"><span className="studio-eyebrow">/ {pillar.index}</span><ArrowUpRight size={21} aria-hidden="true" /></div>
                <h3>{pillar.title}</h3>
                <p className="studio-service-eyebrow">{pillar.eyebrow}</p>
                <p className="studio-service-body">{pillar.body}</p>
                <span className="studio-service-rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>

        <div className="studio-intersection">
          <p><StatementWords text={intersection.line1} /></p>
          <p><StatementWords text={intersection.line2} /></p>
          <h3><Asterisk className="studio-intersection-mark" aria-hidden="true" size={34} strokeWidth={1} /><StatementWords text={intersection.line3} /></h3>
        </div>

        <div ref={verdictRef} className="studio-verdict">
          <div>
            <p className="studio-eyebrow verdict-eyebrow">{verdict.eyebrow}</p>
            <blockquote>
              <span className="sr-only">{verdict.text1} {verdict.highlight1} {verdict.highlight2} {verdict.text2}</span>
              <span aria-hidden="true"><VerdictWords text={verdict.text1} /> <em className="verdict-word">{verdict.highlight1}</em>{" "}<em className="verdict-word">{verdict.highlight2}</em>{" "}<VerdictWords text={verdict.text2} /></span>
            </blockquote>
          </div>
          <ul>{verdict.items.map((item) => <li key={item}><span className="verdict-item-line" aria-hidden="true" /><span className="verdict-item-text">{item}</span></li>)}</ul>
        </div>
      </div>
    </section>
  );
}
