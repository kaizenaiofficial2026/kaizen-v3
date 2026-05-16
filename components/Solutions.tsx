"use client";
import { useEffect } from "react";

export default function Solutions() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".tilt");
    const handlers: Array<{ el: HTMLElement; mm: (e: MouseEvent) => void; ml: () => void }> = [];

    cards.forEach((el) => {
      let raf: number;
      const mm = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        const rx = ((my - 50) / 50) * -3;
        const ry = ((mx - 50) / 50) * 3;
        el.style.setProperty("--mx", mx + "%");
        el.style.setProperty("--my", my + "%");
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
      };
      const ml = () => {
        cancelAnimationFrame(raf);
        el.style.transform = "";
      };
      el.addEventListener("mousemove", mm);
      el.addEventListener("mouseleave", ml);
      handlers.push({ el, mm, ml });
    });

    return () => {
      handlers.forEach(({ el, mm, ml }) => {
        el.removeEventListener("mousemove", mm);
        el.removeEventListener("mouseleave", ml);
      });
    };
  }, []);

  return (
    <section id="solutions" className="section sec-solutions">
      <div className="wrap">
        <header className="sec-head center reveal-up" data-d="4">
          <h2 className="sec-title">
            Every customer who reaches out —<br />
            <span className="italic gold">gets heard, helped, and booked.</span>
          </h2>
          <p className="sec-lead">
            Dental clinic, retail, real estate, law firm — doesn&apos;t matter. Your
            Kaizen AI agent is trained on your products, pricing, availability,
            and FAQs. From day one, it performs like your best employee.
          </p>
        </header>

        <div className="sol-grid">
          <article className="sol-card tilt sol-big reveal-up" data-d="1">
            <div className="sol-n mono">01</div>
            <div className="sol-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h8M8 14h5" />
              </svg>
            </div>
            <h3 className="sol-t">AI <em>Chatbots</em></h3>
            <p className="sol-d">
              Intelligent conversations on your website and messaging channels —
              answering enquiries, qualifying leads, and booking appointments
              with full knowledge of your business.
            </p>
            <div className="sol-foot">
              <span className="chip">Website</span>
              <span className="chip">WhatsApp</span>
              <span className="chip">Instagram</span>
              <span className="chip">Messenger</span>
            </div>
            <div className="tilt-spot"></div>
          </article>

          <article className="sol-card tilt sol-feat reveal-up" data-d="2">
            <div className="sol-flag mono">Most popular</div>
            <div className="sol-n mono">02</div>
            <div className="sol-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7A2 2 0 0 1 22 16.9z" />
              </svg>
            </div>
            <h3 className="sol-t">AI <em>Voice</em> Agents</h3>
            <p className="sol-d">
              Callers won&apos;t know it&apos;s AI. A natural-sounding agent answers your
              phone, handles enquiries, books appointments, and transfers urgent
              calls — in the caller&apos;s preferred language.
            </p>
            <div className="sol-foot">
              <span className="chip">Inbound</span>
              <span className="chip">Outbound</span>
              <span className="chip">Transfer-to-human</span>
            </div>
            <div className="tilt-spot"></div>
          </article>

          <article className="sol-card tilt reveal-up" data-d="3">
            <div className="sol-n mono">03</div>
            <div className="sol-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M15 5a5 5 0 0 1 4 4M15 1a9 9 0 0 1 8 8" />
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7A2 2 0 0 1 22 16.9z" />
              </svg>
            </div>
            <h3 className="sol-t">Missed-call <em>recovery</em></h3>
            <p className="sol-d">
              If a call slips through, your AI agent calls or texts back within
              minutes — automatically. No lead is ever lost.
            </p>
            <div className="sol-foot"><span className="chip">Add-on</span></div>
            <div className="tilt-spot"></div>
          </article>

          <article className="sol-card tilt reveal-up" data-d="4">
            <div className="sol-n mono">04</div>
            <div className="sol-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4M10 8h8M10 12h5" />
              </svg>
            </div>
            <h3 className="sol-t">Command <em>centre</em></h3>
            <p className="sol-d">
              Every call, conversation, booking — tracked in a live dashboard on
              your phone. Instant WhatsApp pings for new leads and appointments.
            </p>
            <div className="sol-foot"><span className="chip">Dashboard</span></div>
            <div className="tilt-spot"></div>
          </article>
        </div>
      </div>
    </section>
  );
}
