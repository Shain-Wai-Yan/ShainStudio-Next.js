/**
 * Centralised GSAP plugin registration.
 * Import gsap & ScrollTrigger from here — never call gsap.registerPlugin()
 * directly in individual components.  Calling registerPlugin multiple times
 * forces GSAP to re-process its internal map on every import, wasting ~200 ms
 * of main-thread time at startup.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
