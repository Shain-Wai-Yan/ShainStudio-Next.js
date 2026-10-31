"use client";

import { useEffect, useId, useRef } from "react";

type Candle = { open: number; close: number; high: number; low: number; volume: number };
const STEP = 18;
const LEFT = 12;
const WIDTH = 560;
const DELTAS = [1.8, -.8, 2.4, -2.7, -.6, 1.2, 3.5, -1.8, 1.7, -.9, 2.4, -3.2, -1.2, 1.6, 2.8, .4, -.8, -2.1, 1.3, 3.1, 1.4, -.6, -2.2, 1.1, -1.4, 2.2, 3.4, -1.8, 1.3, -.7, .45];
let price = 100;
const INITIAL: Candle[] = DELTAS.map((delta, index) => {
  const open = price;
  price += delta;
  return { open, close: price, high: Math.max(open, price) + .6 + (index % 4) * .4,
    low: Math.min(open, price) - .5 - (index % 3) * .5, volume: 10 + Math.abs(delta) * 8 + (index % 5) * 3 };
});
const LOW = Math.min(...INITIAL.map(c => c.low)) - 4;
const HIGH = Math.max(...INITIAL.map(c => c.high)) + 4;
const project = (value: number) => 16 + (HIGH - value) / (HIGH - LOW) * 171;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const body = (candle: Candle) => ({ y: Math.min(project(candle.open), project(candle.close)), height: Math.max(2, Math.abs(project(candle.open) - project(candle.close))) });

/** Decorative market study: deterministic OHLC artwork, animated only on intent. */
export default function TerminalCandles() {
  const ref = useRef<SVGSVGElement>(null);
  const id = `terminal-candles-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const svg = ref.current;
    const card = svg?.closest<HTMLElement>(".studio-project");
    if (!svg || !card) return;
    const track = svg.querySelector<SVGGElement>(".studio-candle-track")!;
    const nodes = Array.from(svg.querySelectorAll<SVGGElement>(".studio-candle"));
    const crosshair = svg.querySelector<SVGGElement>(".studio-chart-crosshair")!;
    const crossLine = crosshair.querySelector("line")!;
    const crossDot = crosshair.querySelector("circle")!;
    const guide = svg.querySelector<SVGLineElement>(".studio-chart-price")!;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const candles = INITIAL.map(c => ({ ...c }));
    let bounds = svg.getBoundingClientRect();
    let frame = 0;
    let previous = 0;
    let phase = 0;
    let bar = 0;
    let hover = false;
    let focus = false;
    let visible = false;
    let pointerX = WIDTH;
    let cursorX = WIDTH;

    const draw = (index: number) => {
      const candle = candles[index];
      const node = nodes[index];
      const wick = node.children[0];
      const rect = node.children[1];
      const volume = node.children[2];
      const geometry = body(candle);
      node.dataset.direction = candle.close >= candle.open ? "up" : "down";
      wick.setAttribute("y1", String(project(candle.high)));
      wick.setAttribute("y2", String(project(candle.low)));
      rect.setAttribute("y", String(geometry.y));
      rect.setAttribute("height", String(geometry.height));
      volume.setAttribute("y", String(253 - candle.volume * .5));
      volume.setAttribute("height", String(candle.volume * .5));
    };
    const render = (now: number) => {
      const dt = Math.min((now - (previous || now - 16.67)) / 1000, .04);
      previous = now;
      phase += dt / 1.85;
      if (phase >= 1) {
        phase -= 1;
        bar += 1;
        const open = candles[candles.length - 1].close;
        candles.shift();
        candles.push({ open, close: open, high: open, low: open, volume: 14 });
        candles.forEach((_, index) => draw(index));
      }
      const latest = candles[candles.length - 1];
      const change = Math.sin(phase * 2.5 + bar * 1.7) * phase * 1.65 + Math.sin(phase * 12 + bar) * phase * .35;
      latest.close = clamp(latest.open + change, LOW + 2, HIGH - 2);
      latest.high = Math.max(latest.high, latest.close);
      latest.low = Math.min(latest.low, latest.close);
      latest.volume = 14 + phase * 22;
      draw(candles.length - 1);
      const offset = phase * STEP;
      track.setAttribute("transform", `translate(${-offset} 0)`);
      guide.setAttribute("y1", String(project(latest.close)));
      guide.setAttribute("y2", String(project(latest.close)));
      cursorX += (pointerX - cursorX) * (1 - Math.exp(-dt / .07));
      const selected = clamp(Math.round((cursorX + offset - LEFT) / STEP), 0, candles.length - 1);
      const x = LEFT + selected * STEP - offset;
      crossLine.setAttribute("x1", String(x));
      crossLine.setAttribute("x2", String(x));
      crossDot.setAttribute("cx", String(x));
      crossDot.setAttribute("cy", String(project(candles[selected].close)));
      frame = requestAnimationFrame(render);
    };
    const sync = () => {
      const playing = (hover || focus) && visible && !document.hidden && !motion.matches;
      svg.dataset.playing = String(playing);
      crosshair.style.opacity = playing && hover ? "1" : "0";
      if (playing && !frame) { previous = 0; frame = requestAnimationFrame(render); }
      else if (!playing) { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    };
    const move = (event: PointerEvent) => {
      pointerX = clamp((event.clientX - bounds.left) / bounds.width * 600, LEFT, WIDTH - 6);
    };
    const enter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      bounds = svg.getBoundingClientRect();
      hover = true;
      move(event);
      cursorX = pointerX;
      sync();
    };
    const leave = () => { hover = false; sync(); };
    const onFocus = () => { focus = true; sync(); };
    const onBlur = () => { focus = false; sync(); };
    const blurWindow = () => { hover = focus = false; sync(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(card);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointermove", move, { passive: true });
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focusin", onFocus);
    card.addEventListener("focusout", onBlur);
    window.addEventListener("blur", blurWindow);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focusin", onFocus);
      card.removeEventListener("focusout", onBlur);
      window.removeEventListener("blur", blurWindow);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <svg ref={ref} className="studio-market-chart" viewBox="0 0 600 280" fill="none" aria-hidden="true" data-playing="false">
      <defs><clipPath id={id}><rect width={WIDTH} height="256" /></clipPath></defs>
      <g className="studio-chart-guides">{[30, 85, 140, 204].map(y => <line key={y} x1="0" x2="588" y1={y} y2={y} />)}</g>
      <g clipPath={`url(#${id})`}>
        <g className="studio-candle-track">
          {INITIAL.map((candle, index) => <g key={index} className="studio-candle" data-direction={candle.close >= candle.open ? "up" : "down"} transform={`translate(${LEFT + index * STEP} 0)`}>
            <line y1={project(candle.high)} y2={project(candle.low)} />
            <rect x="-4" width="8" y={body(candle).y} height={body(candle).height} rx=".7" />
            <rect className="studio-candle-volume" x="-4" width="8" y={253 - candle.volume * .5} height={candle.volume * .5} rx=".5" />
          </g>)}
        </g>
        <g className="studio-chart-crosshair"><line y1="5" y2="254" /><circle r="3" /></g>
      </g>
      <line className="studio-chart-price" x1="0" x2="588" y1={project(INITIAL[30].close)} y2={project(INITIAL[30].close)} />
      <g className="studio-chart-times"><text x="8" y="274">09:30</text><text x="182" y="274">11:00</text><text x="356" y="274">12:30</text><text x="530" y="274">14:00</text></g>
    </svg>
  );
}
