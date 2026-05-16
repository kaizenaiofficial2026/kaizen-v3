interface BookCTAProps {
  onBooking: () => void;
  onDemo: () => void;
}

export default function BookCTA({ onBooking, onDemo }: BookCTAProps) {
  return (
    <section id="book" className="section sec-cta">
      <div className="cta-orbs" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div className="wrap cta-wrap">
        <h2 className="cta-h">
          <span className="line">Stop missing</span>
          <span className="line italic gold">leads.</span>
          <span className="line">Start <span className="italic gold">growing.</span></span>
        </h2>
        <p className="cta-sub">
          Book a free 20-minute call. We&apos;ll show you exactly where you&apos;re losing
          customers — and how to fix it by next Friday.
        </p>
        <div className="cta-btns">
          <button onClick={onBooking} className="btn btn-primary xl booking-trigger">
            <span className="btn-label">Book a free call</span>
            <span className="btn-arrow">→</span>
          </button>
          <button onClick={onDemo} className="btn btn-ghost-dark demo-trigger">
            Live demo
          </button>
        </div>
        <p className="cta-note mono">No credit card · 20 minutes · no pressure</p>
      </div>
    </section>
  );
}
