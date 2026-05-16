"use client";
import { useState, useEffect, useRef } from "react";
import { COUNTRIES } from "@/lib/countries";
import emailjs from "@emailjs/browser";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const EMAILJS_SERVICE_ID = "service_l45vbyb";
const EMAILJS_TEMPLATE_ID = "template_1vi7v91";
const EMAILJS_PUBLIC_KEY = "l0OAiRQ3h3Zpw1AMn";

const STEP_HEADINGS = [
  'Tell us a bit <span class="italic gold">about you.</span>',
  'Tell us about <span class="italic gold">your business.</span>',
  'What are you <span class="italic gold">looking for?</span>',
];
const STEP_DESCS = [
  "Your name and contact so we know who we're talking to.",
  "A few details about your company and team.",
  "Your budget and what you want to automate.",
];

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Country picker state
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Custom select (interest)
  const [interestOpen, setInterestOpen] = useState(false);
  const [interest, setInterest] = useState("");

  // Budget
  const [budget, setBudget] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }
  }, [open]);

  function reset() {
    setStep(1);
    setSuccess(false);
    setSending(false);
    setStatusMsg("");
    setErrors({});
    setInterest("");
    setBudget("");
    formRef.current?.reset();
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 400);
  }

  function getField(name: string): string {
    if (!formRef.current) return "";
    const el = formRef.current.elements.namedItem(name) as HTMLInputElement | null;
    return el?.value.trim() ?? "";
  }

  function validate(n: number): boolean {
    const errs: Record<string, string> = {};
    if (n === 1) {
      if (!getField("first_name")) errs.first_name = "Required";
      if (!getField("last_name")) errs.last_name = "Required";
      if (!getField("company")) errs.company = "Required";
      const email = getField("email");
      if (!email) errs.email = "Required";
      else if (!EMAIL_RE.test(email)) errs.email = "Please enter a valid email address";
    }
    if (n === 2) {
      const website = getField("website");
      if (website && !URL_RE.test(website)) errs.website = "Please enter a valid URL";
      const phone = getField("phone");
      if (phone) {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 6 || digits.length > 15) errs.phone = "Please enter a valid phone number";
      }
    }
    if (n === 3) {
      if (!budget) errs.budget = "Please select a budget range";
      if (!interest) errs.interest = "Please select an option";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validate(step)) setStep((s) => s + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(3)) return;
    setSending(true);
    setStatusMsg("Sending your request…");
    try {
      const form = formRef.current!;
      const params = Object.fromEntries(new FormData(form).entries());
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { ...params, budget, interest, source: "Kaizen AI Website" },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setSuccess(true);
      setStatusMsg("");
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSending(false);
    }
  }

  const filteredCountries = countrySearch
    ? COUNTRIES.filter((c) => c.n.toLowerCase().includes(countrySearch.toLowerCase()) || c.d.includes(countrySearch))
    : COUNTRIES;

  const interestOptions = [
    { val: "AI Chatbot", desc: "24/7 lead qualification & support automation" },
    { val: "AI Voice Agent", desc: "Human-sounding phone & call automation" },
    { val: "Both", desc: "Full AI stack — chatbot + voice bundle" },
    { val: "Not sure yet", desc: "Let us recommend the right fit for you" },
  ];

  if (!open) return null;

  return (
    <div className="modal open" id="bookingModal" aria-hidden="false">
      <div className="modal-bg" onClick={handleClose} />
      <div className="modal-card">
        <button className="modal-close" onClick={handleClose} aria-label="Close">×</button>

        <div className="modal-top">
          <span className="mono kicker">Book a strategy call</span>
          <div className="step-indicator" aria-label="Form progress">
            {[1, 2, 3].map((s, i) => (
              <>
                {i > 0 && <div key={`line-${i}`} className={`step-line${step > s - 1 ? " done" : ""}`} />}
                <div
                  key={s}
                  className={`step-dot${step === s ? " active" : ""}${step > s ? " done" : ""}`}
                  data-step={s}
                >
                  <span>{s}</span>
                </div>
              </>
            ))}
          </div>
          <h3
            className="step-heading"
            dangerouslySetInnerHTML={{ __html: STEP_HEADINGS[step - 1] }}
          />
          <p className="step-desc">{STEP_DESCS[step - 1]}</p>
        </div>

        <form className="modal-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          {!success && (
            <>
              {/* Step 1 */}
              <div className={`form-step${step === 1 ? " active" : ""}`} data-step="1">
                <div className="field">
                  <label>First Name</label>
                  <input name="first_name" type="text" placeholder="First Name" required className={errors.first_name ? "field-invalid" : ""} onChange={() => setErrors((e) => ({ ...e, first_name: "" }))} />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input name="last_name" type="text" placeholder="Last Name" required className={errors.last_name ? "field-invalid" : ""} onChange={() => setErrors((e) => ({ ...e, last_name: "" }))} />
                </div>
                <div className="field full">
                  <label>Work Email</label>
                  <input name="email" type="email" placeholder="you@company.com" required className={errors.email ? "field-invalid" : ""} onChange={() => setErrors((e) => ({ ...e, email: "" }))} />
                  {errors.email && <span className="field-error show">{errors.email}</span>}
                </div>
                <div className="field full">
                  <label>Company</label>
                  <input name="company" type="text" placeholder="Your company" required className={errors.company ? "field-invalid" : ""} onChange={() => setErrors((e) => ({ ...e, company: "" }))} />
                </div>
                <div className="step-nav">
                  <span className="mono dim">Step 1 of 3</span>
                  <button type="button" className="btn btn-primary step-next" onClick={nextStep}>Next <span>→</span></button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`form-step${step === 2 ? " active" : ""}`} data-step="2">
                <div className="field full">
                  <label>Company Website <span className="opt-tag">(optional)</span></label>
                  <input name="website" type="url" placeholder="https://yourcompany.com" className={errors.website ? "field-invalid" : ""} onChange={() => setErrors((e) => ({ ...e, website: "" }))} />
                  {errors.website && <span className="field-error show">{errors.website}</span>}
                </div>
                <div className="field full" id="phoneField">
                  <label>Phone Number <span className="opt-tag">(optional)</span></label>
                  <div className="phone-wrap">
                    <div className={`country-sel${countryOpen ? " open" : ""}`}>
                      <button type="button" className="country-trigger" aria-haspopup="listbox" aria-expanded={countryOpen} onClick={(e) => { e.stopPropagation(); setCountryOpen((o) => !o); }}>
                        <span className="country-flag">{selectedCountry.f}</span>
                        <span className="country-code-lbl">{selectedCountry.d}</span>
                        <svg className="country-chev" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                      {countryOpen && (
                        <div className="country-list" role="listbox">
                          <input className="country-search" type="text" placeholder="Search country…" autoComplete="off" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
                          <div className="country-items">
                            {filteredCountries.map((c) => (
                              <div key={c.n} className={`country-item${c.d === selectedCountry.d && c.n === selectedCountry.n ? " ci-active" : ""}`} role="option" onClick={() => { setSelectedCountry(c); setCountryOpen(false); setCountrySearch(""); }}>
                                <span className="country-item-flag">{c.f}</span>
                                <span className="country-item-name">{c.n}</span>
                                <span className="country-item-dial">{c.d}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input className={`phone-input${errors.phone ? " field-invalid" : ""}`} name="phone" type="tel" placeholder="Phone number" autoComplete="tel" onChange={() => setErrors((e) => ({ ...e, phone: "" }))} />
                  </div>
                  {errors.phone && <span className="field-error show">{errors.phone}</span>}
                </div>
                <div className="field">
                  <label>Your Role <span className="opt-tag">(optional)</span></label>
                  <select name="role">
                    <option value="" disabled>Select your role</option>
                    <option>Founder / CEO</option>
                    <option>Operations Manager</option>
                    <option>Marketing Manager</option>
                    <option>Sales Manager</option>
                    <option>IT / Tech Lead</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Company Size <span className="opt-tag">(optional)</span></label>
                  <select name="company_size">
                    <option value="" disabled>Number of employees</option>
                    <option>1 – 10</option>
                    <option>11 – 50</option>
                    <option>51 – 200</option>
                    <option>201 – 500</option>
                    <option>500+</option>
                  </select>
                </div>
                <div className="step-nav">
                  <button type="button" className="btn btn-ghost-sm step-back" onClick={() => setStep(1)}>← Back</button>
                  <button type="button" className="btn btn-primary step-next" onClick={nextStep}>Next <span>→</span></button>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`form-step${step === 3 ? " active" : ""}`} data-step="3">
                <div className="field full">
                  <label>Budget Range</label>
                  <div className="budget-btns">
                    {["$15K - $50K", "$50K - $150K", "$150K - $500K", "Not Sure Yet"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`budget-btn${budget === b ? " selected" : ""}`}
                        onClick={() => { setBudget(b); setErrors((e) => ({ ...e, budget: "" })); }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {errors.budget && <span className="field-error show">{errors.budget}</span>}
                </div>

                <div className="field full">
                  <label>What are you interested in?</label>
                  <div className={`cust-sel${interestOpen ? " open" : ""}${errors.interest ? " field-invalid" : ""}`} id="interestSel">
                    <button
                      type="button"
                      className="cust-sel-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={interestOpen}
                      onClick={() => setInterestOpen((o) => !o)}
                    >
                      <span className={`cust-sel-val${!interest ? " placeholder" : ""}`}>{interest || "Select an option…"}</span>
                      <svg className="cust-sel-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <ul className="cust-sel-list" role="listbox">
                      {interestOptions.map((opt) => (
                        <li
                          key={opt.val}
                          className={`cust-opt${interest === opt.val ? " selected" : ""}`}
                          role="option"
                          tabIndex={0}
                          onClick={() => { setInterest(opt.val); setInterestOpen(false); setErrors((e) => ({ ...e, interest: "" })); }}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setInterest(opt.val); setInterestOpen(false); } }}
                        >
                          <span className="cust-opt-body">
                            <span className="cust-opt-label">{opt.val}</span>
                            <span className="cust-opt-desc">{opt.desc}</span>
                          </span>
                          <svg className="cust-opt-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {errors.interest && <span className="field-error show">{errors.interest}</span>}
                </div>

                <div className="field full">
                  <label>Tell Us About Your Project <span className="opt-tag">(optional)</span></label>
                  <textarea name="notes" rows={3} placeholder="What challenges are you facing? What does success look like?" />
                </div>

                <div className="step-nav">
                  <button type="button" className="btn btn-ghost-sm step-back" onClick={() => setStep(2)}>← Back</button>
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? "Sending…" : "Request my call →"}
                  </button>
                </div>
                {statusMsg && <div className="modal-status" aria-live="polite" style={{ color: statusMsg.includes("wrong") || statusMsg.includes("Error") ? "#b44d2a" : undefined }}>{statusMsg}</div>}
              </div>
            </>
          )}
        </form>

        {success && (
          <div className="modal-success show">
            <div className="ms-icon">✓</div>
            <h3>We&apos;ll be in touch shortly.</h3>
            <p>Thanks for reaching out. We&apos;ll contact you within 1 business day to schedule your free strategy call.</p>
          </div>
        )}
      </div>
    </div>
  );
}
