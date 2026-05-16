"use client";
import { useEffect, useRef } from "react";

interface HeroProps {
  onBooking: () => void;
  onDemo: () => void;
}

export default function Hero({ onBooking, onDemo }: HeroProps) {
  const waveBarsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = waveBarsRef.current;
    if (!el) return;

    el.innerHTML = "";
    const barW = 3, barGap = 4;
    const barCount = Math.max(20, Math.floor((el.offsetWidth || 320) / (barW + barGap)));
    for (let i = 0; i < barCount; i++) el.appendChild(document.createElement("span"));

    const bars = el.children as HTMLCollectionOf<HTMLElement>;
    let t = 0, rafId: number, frame = 0;

    function tick() {
      rafId = requestAnimationFrame(tick);
      if (++frame % 2 !== 0) return;
      t += 0.08;
      for (let i = 0; i < bars.length; i++) {
        const p = i / bars.length;
        const v = Math.sin(t + p * 6.28 * 2) * 0.5 + 0.5;
        const v2 = Math.sin(t * 0.7 + p * 6.28) * 0.5 + 0.5;
        bars[i].style.transform = `scaleY(${(8 + v * v2 * 72) / 40})`;
        bars[i].style.opacity = String(0.35 + v * 0.65);
      }
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) tick();
        else cancelAnimationFrame(rafId);
      });
    });
    if (heroRef.current) io.observe(heroRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const h1 = document.querySelector(".hero-h");
    const timer = setTimeout(() => h1?.classList.add("in"), 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="top" className="hero" ref={heroRef}>
      <div className="hero-grid hero-grid--centered">
        <div className="hero-left hero-left--centered">
          <h1 className="hero-h in">
            <span className="line">
              <span className="reveal">Never miss a</span>
            </span>
            <span className="line">
              <span className="reveal italic gold">lead.</span>
            </span>
            <span className="line alt">
              <span className="reveal">Never lose a</span>
            </span>
            <span className="line">
              <span className="reveal italic gold">customer.</span>
            </span>
          </h1>
          <p className="hero-sub hero-sub--centered">
            AI agents that answer every call, reply to every message, and book
            appointments — in any language, 24/7/365. Not a clumsy auto-reply.{" "}
            <em>Real conversations,</em> trained on your business.
          </p>

          <div className="hero-ctas hero-ctas--centered">
            <button
              onClick={onBooking}
              className="btn btn-primary booking-trigger"
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <span className="btn-label">Book a strategy call</span>
              <span className="btn-arrow">→</span>
            </button>
            <button
              onClick={onDemo}
              className="btn btn-ghost demo-trigger"
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <span className="play-tri"></span>
              <span>Live demo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hero-ticker">
        <div className="ht-track">
          {[0, 1].map((setIdx) => (
            <div className="ht-set" key={setIdx} aria-hidden={setIdx === 1}>
              <div className="ht-item"><span className="ht-n">148</span><span className="ht-l">calls answered today</span></div>
              <div className="ht-item"><span className="ht-n">0</span><span className="ht-l">missed leads</span></div>
              <div className="ht-item"><span className="ht-n">&lt; 5s</span><span className="ht-l">avg response</span></div>
              <div className="ht-item"><span className="ht-n">30+</span><span className="ht-l">languages handled</span></div>
              <div className="ht-item"><span className="ht-n">24/7/365</span><span className="ht-l">always on duty</span></div>
              <div className="ht-item"><span className="ht-n">2am</span><span className="ht-l">appointments booked</span></div>
              <div className="ht-item"><span className="ht-n">&lt; 5s</span><span className="ht-l">avg response</span></div>
              {setIdx === 1 && <div className="ht-item"><span className="ht-n">148</span><span className="ht-l">calls answered today</span></div>}
            </div>
          ))}
        </div>
      </div>

      <a href="#work" className="scroll-hint">
        <span className="mono">scroll</span>
        <span className="sh-line"></span>
      </a>
    </section>
  );
}
