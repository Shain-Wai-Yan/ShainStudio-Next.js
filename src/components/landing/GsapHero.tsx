"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import CImage from "@/components/ui/CImage";
import ClientsStrip from "./ClientsStrip";
import HeroTypewriter from "../HeroTypewriter";
import type { ClientLogo } from '@/types/client';

const StatueHoverReveal = dynamic(() => import("./StatueHoverReveal"), { ssr: false });

interface GsapHeroProps {
  hp: { badge?: string; title?: string; titleHighlight?: string; description?: string;
    viewPortfolio?: string; getInTouch?: string; clientsLabel?: string; };
  locale: string;
  clientLogos?: ClientLogo[];
}

export default function GsapHero({ hp, locale, clientLogos = [] }: GsapHeroProps) {
  const container = useRef<HTMLElement>(null);
  const artwork = useRef<HTMLDivElement>(null);
  const isZh = locale === "zh";
  const base = isZh ? "/zh" : "";

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      // The composition is visible at first paint; motion only settles its layers.
      gsap.from(".gallery-title > span", { y: 18, duration: 1, stagger: 0.08, ease: "power3.out", clearProps: "transform" });
    }, container);
    return () => media.revert();
  }, { scope: container });

  return (
    <>
      <section ref={container} className="gallery-hero" aria-labelledby="studio-title">
        <div className="studio-shell gallery-shell">
          <div className="gallery-masthead">
            <p>{isZh ? "Shain Studio / 数字品牌与创意技术" : "Shain Studio / Creative digital & branding"}</p>
            <span className="gallery-availability"><i aria-hidden="true" />{hp.badge}</span>
          </div>
          <h1 id="studio-title" className="gallery-title"><span>{hp.title || "Architecting"}</span><span><em>{hp.titleHighlight || "Digital Identities."}</em></span></h1>
          <div className="gallery-composition">
            <div className="gallery-introduction">
              <span className="gallery-small-rule" aria-hidden="true" />
              <h2>{isZh ? "理性思考。" : "A strategic mind."}<br /><em>{isZh ? "感性创造。" : "A creative soul."}</em></h2>
              <div className="gallery-role"><HeroTypewriter /></div>
              <p>{hp.description}</p>
              <Link className="gallery-contact-link" href={base + "/contact"}>{hp.getInTouch}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="gallery-sculpture-wrap">
              <figure className="gallery-sculpture" ref={artwork}>
                <div className="gallery-disc gallery-disc-blue" aria-hidden="true" />
                <div className="gallery-disc gallery-disc-gold" aria-hidden="true" />
                <div className="gallery-sculpture-light"><CImage src="/images/hero-statue-clean.webp" alt={isZh ? "交织金色几何线条的古典雕像" : "Classical sculpture interwoven with golden geometry"} fill sizes="(min-width: 1024px) 540px, (min-width: 768px) 48vw, 85vw" loading="eager" fetchPriority="high" className="object-contain" /></div>
                <div className="gallery-sculpture-dark"><CImage src="/images/statues-dark/medusa-dark-hair-v7.webp" alt="" fill sizes="(min-width: 1024px) 540px, (min-width: 768px) 48vw, 85vw" loading="eager" fetchPriority="high" className="object-contain" /></div>
                <svg className="gallery-rings" viewBox="0 0 700 460" fill="none" aria-hidden="true">
                  <path d="M36 338C-25 231 559 85 656 146C765 216 161 444 36 338Z" stroke="currentColor" strokeWidth=".65" />
                </svg>
                <div className="gallery-portal"><StatueHoverReveal /></div>
              </figure>
              <span className="gallery-sculpture-caption">{isZh ? "古典之形，当代之思。" : "Classical form. Contemporary thinking."}</span>
            </div>
            <div className="gallery-discover">
              <Link className="gallery-work-link" href="#selected-work"><ArrowUpRight size={35} strokeWidth={1} aria-hidden="true" /><span>{hp.viewPortfolio || "View my work"}</span></Link>
              <p>{isZh ? "想法，成为体验。" : "From an idea\nto an experience."}</p>
            </div>
          </div>
          <div className="gallery-bottom"><span>{isZh ? "策略 / 身份 / 体验" : "Strategy / Identity / Experience"}</span><a href="#selected-work">{isZh ? "探索作品" : "Discover what comes next"}<ArrowDown size={14} aria-hidden="true" /></a></div>
        </div>
      </section>
      {clientLogos.length > 0 && <div className="atelier-company studio-shell"><ClientsStrip label={hp.clientsLabel || "In good company"} logos={clientLogos} locale={locale} /></div>}
    </>
  );
}
