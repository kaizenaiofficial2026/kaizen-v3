interface FAQProps {
  onBooking: () => void;
}

const faqs = [
  {
    q: "How long does setup take?",
    a: "Most chatbots are live within 3–5 days. Voice agents take 7–14 days. We handle everything — you simply approve the final setup before it goes live.",
    open: true,
  },
  {
    q: "What platforms do you integrate with?",
    a: "Google Calendar, Calendly, HubSpot, Salesforce, Pipedrive, Zoho, WhatsApp Business, Facebook Messenger, Instagram DMs, and most phone systems via Twilio. If you use it, we can connect to it.",
  },
  {
    q: "Is our data secure?",
    a: "Yes. All conversations are encrypted. We never sell or share your data. Our systems comply with GDPR, and we provide Data Processing Agreements for enterprise clients.",
  },
  {
    q: "Do we need a technical team?",
    a: "No. We handle design, build, deployment, and ongoing optimisation. You receive a monthly report showing exactly what your AI agent did — leads captured, calls answered, sales closed, appointments booked.",
  },
  {
    q: "What if the AI can't handle a question?",
    a: "It escalates to your team. The AI recognises when a conversation needs a human and transfers with full context. The customer never feels abandoned.",
  },
  {
    q: "What languages does it support?",
    a: "Our AI agents communicate fluently in 30+ languages — both text and voice. Your customers are served in their preferred language automatically.",
  },
];

export default function FAQ({ onBooking }: FAQProps) {
  return (
    <section id="faq" className="section sec-faq">
      <div className="wrap">
        <div className="faq-cols">
          <aside className="faq-aside" style={{ textAlign: "center" }}>
            <h2 className="sec-title">
              Frequently<br />asked <span className="italic gold">questions.</span>
            </h2>
            <p className="sec-lead">
              Can&apos;t find the answer? Book a call and we&apos;ll walk you through everything.
            </p>
            <button
              onClick={onBooking}
              className="faq-cta booking-trigger"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Talk to our team →
            </button>
          </aside>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="faq-item reveal-up"
                data-d={((i % 4) + 1).toString()}
                open={faq.open}
              >
                <summary>
                  <span className="faq-q">{faq.q}</span>
                  <span className="faq-ico">+</span>
                </summary>
                <div className="faq-a">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
