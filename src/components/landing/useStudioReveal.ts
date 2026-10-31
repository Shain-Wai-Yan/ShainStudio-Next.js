"use client";

import { useEffect, type RefObject } from "react";

/** Defer the scroll engine until a section is nearby; keep all HTML readable. */
export function useStudioReveal(scope: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let initialized = false;
    let revert: (() => void) | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || motion.matches || initialized) return;
      initialized = true;
      observer.disconnect();
      void import("@/lib/gsapSetup").then(({ gsap }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.utils.toArray<HTMLElement>("[data-studio-reveal]").forEach(element => {
            gsap.from(element, {
              y: 28, opacity: 0, duration: 0.8, ease: "power3.out",
              delay: Number(element.dataset.studioReveal) || 0,
              clearProps: "transform,opacity",
              scrollTrigger: { trigger: element, start: "top 93%", once: true },
            });
          });
        }, root);
        revert = () => media.revert();
      }).catch(() => { /* Motion is optional; the rendered content stays usable. */ });
    }, { rootMargin: "120px 0px" });
    const watch = () => { if (!motion.matches && !initialized) observer.observe(root); };
    watch();
    motion.addEventListener("change", watch);
    return () => { cancelled = true; observer.disconnect(); motion.removeEventListener("change", watch); revert?.(); };
  }, [scope]);
}
