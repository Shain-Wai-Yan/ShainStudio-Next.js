"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import "./cta.css";

interface GsapCtaProps {
  hp: { ctaTitle?: string; ctaHighlight?: string; ctaSub?: string; ctaButton?: string; ctaSecondary?: string; };
  locale: string;
}

export default function GsapCta({ hp, locale }: GsapCtaProps) {
  const container = useRef<HTMLElement>(null);
  const isZh = locale === "zh";

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // Load the scroll engine only when this below-fold section approaches.
      void import("@/lib/gsapSetup").then(({ gsap }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.timeline({ scrollTrigger: {
            id: "studio-collab-fill", trigger: root,
            start: "top 85%", end: "top 15%", scrub: 0.6,
          } })
            .fromTo(".studio-collab-fill-intro", { clipPath: "inset(0 100% 0 0)" },
              { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "none" })
            .fromTo(".studio-collab-fill-main", { clipPath: "inset(0 100% 0 0)" },
              { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "none" }, 0.15);
          gsap.from(".studio-collab-detail", {
            y: 18, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          });
        }, root);
        revert = () => media.revert();
      }).catch(() => { /* The complete gold headline stays readable without motion. */ });
    }, { rootMargin: "300px 0px" });
    observer.observe(root);
    return () => { cancelled = true; observer.disconnect(); revert?.(); };
  }, []);

  const title = hp.ctaTitle || "Let's Build Something";
  const highlight = hp.ctaHighlight || "Remarkable.";
  return (
    <section id="lets-build" ref={container} className="studio-collab" data-locale={locale} aria-labelledby="studio-collab-title">
      <div className="studio-collab-shell">
        <div className="studio-collab-top studio-collab-detail">
          <span className="studio-collab-eyebrow"><span aria-hidden="true" />{isZh ? "从这里开始" : "It starts here"}</span>
          <span className="studio-collab-ornament" aria-hidden="true">✳</span>
        </div>
        <h2 id="studio-collab-title" className="studio-collab-title">
          <span className="studio-collab-line studio-collab-intro"><span className="studio-collab-outline">{title}</span><span className="studio-collab-fill studio-collab-fill-intro" aria-hidden="true">{title}</span></span>
          <span className="studio-collab-line studio-collab-main"><span className="studio-collab-outline">{highlight}</span><span className="studio-collab-fill studio-collab-fill-main" aria-hidden="true">{highlight}</span></span>
        </h2>
        <div className="studio-collab-bottom">
          <p className="studio-collab-copy studio-collab-detail">{hp.ctaSub || "Whether you need a marketing strategy, a coded system, or both — I bridge the gap between vision and execution."}</p>
          <Link className="studio-collab-button studio-collab-detail" href={(isZh ? "/zh" : "") + "/contact"}>
            <span>{hp.ctaButton || "Get In Touch"}</span><span className="studio-collab-arrow"><ArrowRight size={21} strokeWidth={1.5} aria-hidden="true" /></span>
          </Link>
        </div>
        <div className="studio-collab-signoff studio-collab-detail"><span>Shain Studio</span><span>{isZh ? "让好想法，从一次对话开始。" : "Good things begin with a conversation."}</span></div>
      </div>
    </section>
  );
}
