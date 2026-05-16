export default function Work() {
  return (
    <section id="work" className="section sec-comparison">
      <div className="wrap">
        <header className="sec-head center reveal-up" data-d="1">
          <h2 className="sec-title">
            The old way <span className="italic gold">vs.</span>
            <br />
            the Kaizen way.
          </h2>
          <p className="sec-lead">
            A missed call at 9:47 pm is a booked appointment at your competitor
            by 9:48. Here&apos;s the math hiring has been hiding from you.
          </p>
        </header>

        <div className="cmp">
          <div className="cmp-col cmp-old reveal-up" data-d="2">
            <div className="cmp-col-head">
              <span className="mono dim">01 · status quo</span>
              <h3>Without Kaizen AI</h3>
              <span className="cmp-tag old-tag">Staff &amp; manual</span>
            </div>
            <ul className="cmp-list">
              <li>Staff cost <b>$2,000–4,000/mo</b> — 9 to 5 only</li>
              <li>Leads call after hours. No one picks up. They call your competitor</li>
              <li>Employees tire, err, take sick days, and lose focus</li>
              <li>New hires need weeks of training</li>
              <li>WhatsApp, site chat, DMs sit unread for hours</li>
              <li>Follow-ups slip. Warm leads go cold</li>
              <li>Scaling means more hires, more salaries, more risk</li>
            </ul>
          </div>

          <div className="cmp-vs" aria-hidden="true">
            <span className="vs-line"></span>
            <span className="vs-circle"><em>vs</em></span>
            <span className="vs-line"></span>
          </div>

          <div className="cmp-col cmp-new reveal-up" data-d="3">
            <div className="cmp-corner corner-tl"></div>
            <div className="cmp-corner corner-br"></div>
            <div className="cmp-col-head">
              <span className="mono gold">02 · kaizen</span>
              <h3>With Kaizen AI</h3>
              <span className="cmp-tag new-tag">One AI, infinite reach</span>
            </div>
            <ul className="cmp-list cmp-list-new">
              <li>One AI agent. No salary, no insurance, no turnover</li>
              <li>Every call, chat, message answered in seconds — at 2am, on weekends, on holidays</li>
              <li>Real, natural conversations — indistinguishable from a trained human</li>
              <li>Knows your business from day one. Zero ramp-up</li>
              <li>Books appointments, guides buyers, answers in <b>30+ languages</b></li>
              <li>Scale from 10 to 10,000 conversations at the same cost</li>
              <li>Live phone dashboard + WhatsApp alerts for every lead</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
