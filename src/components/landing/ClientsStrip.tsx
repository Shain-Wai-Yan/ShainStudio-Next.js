"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import CImage from "@/components/ui/CImage";

import type { ClientLogo } from '@/types/client';

export default function ClientsStrip({ label, logos, locale = "en", className = "" }: {
  label: string;
  logos: ClientLogo[];
  locale?: string;
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const wakeRef = useRef<(stop?: boolean) => void>(() => {});
  const [paused, setPaused] = useState(false);
  const isZh = locale === "zh";

  useEffect(() => {
    pausedRef.current = paused;
    wakeRef.current(paused);
  }, [paused]);

  useEffect(() => {
    const element = root.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const copy = track?.firstElementChild;
    if (!element || !viewport || !track || !copy || !logos.length) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let visible = false;
    let hovered = false;
    let focused = false;
    let dragging = false;
    let pointerId = -1;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let half = 0;
    let position = 0;
    let velocity = 0;
    let autoSpeed = 0;
    let resumeAt = 0;
    let lastTick = 0;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Take over the CSS loop at its current position, without snapping.
    const transform = getComputedStyle(track).transform;
    if (transform !== "none") position = new DOMMatrixReadOnly(transform).m41;
    element.dataset.driven = "true";

    const paint = () => {
      if (half > 0) position = ((position % half) + half) % half - half;
      track.style.transform = "translate3d(" + position + "px,0,0)";
    };
    const active = () => !disposed && visible && !document.hidden;
    const canAuto = () => active() && !dragging && !hovered && !focused && !pausedRef.current && !motion.matches;
    const tick = (now: number) => {
      frame = 0;
      if (!active() || dragging) return;
      const dt = Math.max(0, Math.min((now - lastTick) / 1000, .05));
      lastTick = now;
      const coasting = !motion.matches && Math.abs(velocity) > .7;
      if (coasting) {
        position += velocity * dt;
        velocity *= Math.exp(-5.5 * dt);
      } else velocity = 0;
      const autoplay = canAuto() && now >= resumeAt && !coasting;
      element.dataset.running = String(autoplay);
      if (autoplay) {
        autoSpeed += (22 - autoSpeed) * (1 - Math.exp(-3.5 * dt));
        position -= autoSpeed * dt;
      } else autoSpeed = 0;
      paint();
      if (coasting || autoplay) frame = requestAnimationFrame(tick);
      else if (canAuto()) timer = setTimeout(wake, Math.max(0, resumeAt - now));
    };
    function wake(stop = false) {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      if (stop) velocity = 0;
      element!.dataset.running = "false";
      if (!active() || dragging) { autoSpeed = 0; return; }
      lastTick = performance.now();
      if (!motion.matches && Math.abs(velocity) > .7) frame = requestAnimationFrame(tick);
      else if (canAuto()) {
        if (lastTick < resumeAt) timer = setTimeout(wake, resumeAt - lastTick);
        else frame = requestAnimationFrame(tick);
      } else autoSpeed = 0;
    }
    wakeRef.current = wake;
    const measure = () => {
      const next = copy.getBoundingClientRect().width;
      if (half && next !== half) position *= next / half;
      half = next;
      paint();
      wake();
    };
    measure();

    const down = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      if (event.pointerType === "mouse") event.preventDefault();
      dragging = true;
      pointerId = event.pointerId;
      lastPointerX = event.clientX;
      lastPointerTime = performance.now();
      velocity = autoSpeed = 0;
      element.dataset.dragging = "true";
      viewport.setPointerCapture(pointerId);
      wake();
    };
    const move = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      const now = performance.now();
      const delta = event.clientX - lastPointerX;
      const speed = Math.max(-1800, Math.min(1800, delta / (Math.max(8, now - lastPointerTime) / 1000)));
      velocity = speed * .65 + velocity * .35;
      position += delta;
      lastPointerX = event.clientX;
      lastPointerTime = now;
      paint();
    };
    const up = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      element.dataset.dragging = "false";
      if (event.type === "pointercancel" || event.type === "lostpointercapture" || performance.now() - lastPointerTime > 100 || motion.matches) velocity = 0;
      resumeAt = performance.now() + 1400;
      if (viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
      pointerId = -1;
      wake();
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") { hovered = true; wake(); }
    };
    const leave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") { hovered = false; wake(); }
    };
    const focus = () => { focused = viewport.matches(":focus-visible"); wake(); };
    const blur = (event: FocusEvent) => {
      if (!viewport.contains(event.relatedTarget as Node | null)) { focused = false; wake(); }
    };
    const key = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      focused = true;
      velocity = 0;
      position += event.key === "ArrowRight" ? -160 : 160;
      resumeAt = performance.now() + 1400;
      paint();
      wake();
    };
    const wheel = (event: WheelEvent) => {
      const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (!delta || (!event.shiftKey && Math.abs(event.deltaY) > Math.abs(delta))) return;
      event.preventDefault();
      velocity = 0;
      position -= delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
      resumeAt = performance.now() + 1400;
      paint();
      wake();
    };
    const dragStart = (event: DragEvent) => event.preventDefault();
    const visibility = () => { if (document.hidden) velocity = 0; wake(); };
    const preference = () => { velocity = 0; paint(); wake(); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) velocity = 0;
      wake();
    });
    const resize = new ResizeObserver(measure);
    observer.observe(element);
    resize.observe(viewport);
    resize.observe(copy);
    viewport.addEventListener("pointerdown", down);
    viewport.addEventListener("pointermove", move);
    viewport.addEventListener("pointerup", up);
    viewport.addEventListener("pointercancel", up);
    viewport.addEventListener("lostpointercapture", up);
    viewport.addEventListener("pointerenter", enter);
    viewport.addEventListener("pointerleave", leave);
    viewport.addEventListener("focusin", focus);
    viewport.addEventListener("focusout", blur);
    viewport.addEventListener("keydown", key);
    viewport.addEventListener("wheel", wheel, { passive: false });
    viewport.addEventListener("dragstart", dragStart);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
      resize.disconnect();
      wakeRef.current = () => {};
      viewport.removeEventListener("pointerdown", down);
      viewport.removeEventListener("pointermove", move);
      viewport.removeEventListener("pointerup", up);
      viewport.removeEventListener("pointercancel", up);
      viewport.removeEventListener("lostpointercapture", up);
      viewport.removeEventListener("pointerenter", enter);
      viewport.removeEventListener("pointerleave", leave);
      viewport.removeEventListener("focusin", focus);
      viewport.removeEventListener("focusout", blur);
      viewport.removeEventListener("keydown", key);
      viewport.removeEventListener("wheel", wheel);
      viewport.removeEventListener("dragstart", dragStart);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
      track.style.removeProperty("transform");
      delete element.dataset.driven;
      delete element.dataset.dragging;
    };
  }, [logos.length]);

  if (!logos.length) return null;
  return (
    <section id="collaborations" ref={root} className={"studio-partners " + className} data-running="false" data-paused={paused} aria-labelledby="studio-partners-title">
      <div className="studio-partners-header">
        <h2 id="studio-partners-title">{label}</h2>
        <div className="studio-partners-controls">
          <button type="button" className="studio-partners-toggle" aria-pressed={paused} aria-label={paused ? (isZh ? "继续客户标识滚动" : "Resume client marquee") : (isZh ? "暂停客户标识滚动" : "Pause client marquee")} onClick={() => setPaused(value => !value)}>
            {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div ref={viewportRef} className="studio-partners-viewport" tabIndex={0} role="group" aria-label={isZh ? "合作客户，可左右拖动" : "Client logos, drag left or right"}>
        <div ref={trackRef} className="studio-partners-track">
          {[0, 1].map(copy => <ul key={copy} className="studio-partner-logos" role="list" aria-hidden={copy === 1}>
            {logos.map(logo => {
              return <li key={logo.id} className="studio-partner-logo">
                <div><CImage src={logo.src} alt={copy === 0 ? logo.alt : ""} fill sizes="(max-width: 767px) 96px, 112px" loading="lazy" draggable={false} className="object-contain" /></div>
              </li>;
            })}
          </ul>)}
        </div>
      </div>
    </section>
  );
}
