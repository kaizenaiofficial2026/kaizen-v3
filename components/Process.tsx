"use client";
import { useEffect, useRef } from "react";

export default function Process() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const steps = document.querySelectorAll<HTMLElement>(".pr-step");
    const labels = document.querySelectorAll<HTMLElement>(".pp-lbl");
    if (!steps.length || !fillRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Array.from(steps).indexOf(e.target as HTMLElement);
            labels.forEach((l, i) => l.classList.toggle("active", i <= idx));
            if (fillRef.current)
              fillRef.current.style.width = ((idx + 1) / steps.length) * 100 + "%";
          }
        });
      },
      { threshold: 0.5 }
    );
    steps.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="process" className="section sec-process">
      <div className="process-sticky">
        <div className="wrap process-head">
          <h2 className="sec-title light">
            Live in <span className="italic gold">3 steps.</span>
          </h2>
          <p className="sec-lead light">
            Talk on Monday. Live by the end of the week. We do the heavy lifting
            — you approve before launch.
          </p>

          <div className="process-progress" aria-hidden="true">
            <div className="pp-bar">
              <div className="pp-fill" ref={fillRef} style={{ width: "100%" }} />
            </div>
            <div className="pp-labels">
              <span className="pp-lbl active" data-i="0">01 · Discovery</span>
              <span className="pp-lbl active" data-i="1">02 · Build</span>
              <span className="pp-lbl active" data-i="2">03 · Go live</span>
            </div>
          </div>
        </div>

        <div className="process-track">
          <article className="pr-step reveal-up" data-d="1">
            <div className="pr-step-body">
              <div className="pr-n">01</div>
              <div className="pr-days mono">Day 01 · 30 min</div>
              <h3>Discovery call</h3>
              <p>A 30-minute call to understand your business and map where leads slip. We sketch the agent&apos;s knowledge base together.</p>
              <ul className="pr-list">
                <li>Audit current flow (calls, chats, DMs)</li>
                <li>Identify your top revenue-leaking moments</li>
                <li>Draft a scope &amp; fixed quote</li>
              </ul>
            </div>
          </article>

          <article className="pr-step reveal-up" data-d="2">
            <div className="pr-step-body">
              <div className="pr-n">02</div>
              <div className="pr-days mono">Day 02 – 10</div>
              <h3>We build your AI agent</h3>
              <p>We train the agent on your business, connect it to your stack, and run real-scenario testing. You approve before it goes live.</p>
              <ul className="pr-list">
                <li>Custom voice &amp; tone, trained on your FAQs</li>
                <li>Integrations: Calendar, CRM, WhatsApp, phone</li>
                <li>End-to-end test calls with your team</li>
              </ul>
            </div>
          </article>

          <article className="pr-step reveal-up" data-d="3">
            <div className="pr-step-body">
              <div className="pr-n">03</div>
              <div className="pr-days mono">Day 10 → ∞</div>
              <h3>Go live &amp; optimise</h3>
              <p>Your agent goes live. We monitor, refine, and deliver a monthly performance report — leads, calls, bookings, ROI.</p>
              <ul className="pr-list">
                <li>Ongoing tuning from live transcripts</li>
                <li>Monthly report: leads, calls, revenue</li>
                <li>Add channels / languages anytime</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
