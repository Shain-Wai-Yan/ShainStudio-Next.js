/**
 * Centralised GSAP plugin registration.
 * Import gsap & ScrollTrigger from here — never call gsap.registerPlugin()
 * directly in individual components, so plugin configuration stays consistent.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Mobile browsers fire resize when the URL bar shows/hides — skip the full
  // (expensive) pin recalc in that case.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Pinned sections are measured while below-fold dynamic chunks and images
  // are still loading; re-measure once everything has settled.
  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener("load", () => ScrollTrigger.refresh(), {
      once: true,
    });
  }
}

export { gsap, ScrollTrigger };
