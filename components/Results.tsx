export default function Results() {
  return (
    <section id="results" className="section sec-test">
      <div className="wrap">
        <header className="sec-head center reveal-up" data-d="4">
          <h2 className="sec-title">
            Real results, <span className="italic gold">real numbers.</span>
          </h2>
        </header>

        <div className="quote-main reveal-up" data-d="1">
          <div className="q-mark" aria-hidden="true">&ldquo;</div>
          <blockquote>
            We were missing around <span className="hl">15 calls a week.</span> Now
            every call is answered instantly. We booked{" "}
            <span className="hl">23 extra appointments last month</span> — without
            hiring anyone.
          </blockquote>
          <div className="q-attr">
            <div className="q-av">A</div>
            <div>
              <div className="q-name">Dr. Amara Silva</div>
              <div className="q-role mono">Clinic Director · Lotus Dental, Colombo</div>
            </div>
            <div className="q-metric">
              <div className="q-m-n">+23</div>
              <div className="q-m-l mono">extra bookings / mo</div>
            </div>
          </div>
        </div>

        <div className="quote-pair">
          <div className="q-small reveal-up" data-d="2">
            <div className="q-small-rule"></div>
            <p>
              &ldquo;I used to lose leads while showing properties. The voice agent
              handles my calls, answers enquiries, and books viewings. It paid
              for itself in the first week.&rdquo;
            </p>
            <div className="q-attr small">
              <div className="q-av">R</div>
              <div>
                <div className="q-name">Ravi Mendis</div>
                <div className="q-role mono">Principal · Mendis Properties</div>
              </div>
            </div>
          </div>
          <div className="q-small reveal-up" data-d="3">
            <div className="q-small-rule"></div>
            <p>
              &ldquo;Our chatbot captures leads at 11pm that we never would have
              gotten. 30% of last quarter&apos;s new patients came through the bot —
              in three different languages.&rdquo;
            </p>
            <div className="q-attr small">
              <div className="q-av">N</div>
              <div>
                <div className="q-name">Nisha Perera</div>
                <div className="q-role mono">Operations · Glow Aesthetics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
