export default function Benefits() {
  return (
    <section id="benefits" className="section sec-benefits">
      <div className="wrap">
        <header className="sec-head center reveal-up" data-d="1">
          <h2 className="sec-title">
            Three reasons operators <span className="italic gold">switch.</span>
          </h2>
        </header>

        <div className="ben-grid">
          <article className="ben tilt reveal-up" data-d="2">
            <div className="ben-head">
              <span className="ben-k mono">01</span>
              <span className="ben-metric">0<span className="ben-metric-sm">&nbsp;missed</span></span>
            </div>
            <h3>Always on, <em>24/7/365</em></h3>
            <p>Never sleeps, never calls in sick. Every call answered, every message replied — every day of the year.</p>
            <div className="ben-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="mono">zero missed leads</span>
            </div>
            <div className="tilt-spot"></div>
          </article>

          <article className="ben tilt reveal-up" data-d="3">
            <div className="ben-head">
              <span className="ben-k mono">02</span>
              <span className="ben-metric">30<span className="ben-metric-sm">+ langs</span></span>
            </div>
            <h3>Any language, <em>any channel</em></h3>
            <p>Text or voice, any language — your AI agent communicates fluently across every channel. No customer turned away.</p>
            <div className="ben-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
              </svg>
              <span className="mono">text · voice · any locale</span>
            </div>
            <div className="tilt-spot"></div>
          </article>

          <article className="ben tilt reveal-up" data-d="4">
            <div className="ben-head">
              <span className="ben-k mono">03</span>
              <span className="ben-metric">−80<span className="ben-metric-sm">% cost</span></span>
            </div>
            <h3>Pays for <em>itself</em></h3>
            <p>Salary, insurance, sick days, turnover — or one AI agent at a fraction of the cost handling 10× the volume. Zero errors. Zero days off.</p>
            <div className="ben-foot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              <span className="mono">80% cost vs. hiring</span>
            </div>
            <div className="tilt-spot"></div>
          </article>
        </div>
      </div>
    </section>
  );
}
