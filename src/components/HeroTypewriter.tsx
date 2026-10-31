"use client";

import { useEffect, useRef } from "react";

const ROLES = ["SEO Engineer", "Vibe Coder", "Digital Marketer", "Systems Architect", "Creative Storyteller"];

export default function HeroTypewriter() {
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let index = 0;
    let displayed = ROLES[0];
    let deleting = true;
    const stop = () => {
      clearTimeout(timer);
      timer = undefined;
      root.dataset.playing = "false";
    };
    const schedule = (delay: number) => {
      if (!visible || document.hidden || motion.matches) return;
      root.dataset.playing = "true";
      timer = setTimeout(step, delay);
    };
    const step = () => {
      timer = undefined;
      if (deleting) {
        displayed = displayed.slice(0, -1);
        text.textContent = displayed;
        if (!displayed.length) {
          deleting = false;
          index = (index + 1) % ROLES.length;
          schedule(300);
        } else schedule(34);
      } else {
        displayed = ROLES[index].slice(0, displayed.length + 1);
        text.textContent = displayed;
        if (displayed === ROLES[index]) { deleting = true; schedule(1800); }
        else schedule(65);
      }
    };
    const update = () => {
      stop();
      if (motion.matches) {
        index = 0;
        displayed = ROLES[0];
        deleting = true;
        text.textContent = displayed;
      } else schedule(1600);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(root);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  return (
    <span ref={rootRef} className="hero-typewriter" data-playing="false">
      <span className="sr-only">{ROLES.join(". ")}.</span>
      <span aria-hidden="true"><span ref={textRef} className="hero-typewriter__text">{ROLES[0]}</span><span className="hero-typewriter__cursor">|</span></span>
    </span>
  );
}
