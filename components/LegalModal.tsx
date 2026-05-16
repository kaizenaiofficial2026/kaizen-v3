"use client";
import { useEffect } from "react";

interface LegalModalProps {
  open: boolean;
  tab: "privacy" | "terms";
  onClose: () => void;
  onTabChange: (tab: "privacy" | "terms") => void;
}

export default function LegalModal({ open, tab, onClose, onTabChange }: LegalModalProps) {
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

  if (!open) return null;

  return (
    <div className="modal open" id="legalModal" aria-hidden="false" role="dialog" aria-modal="true">
      <div className="modal-bg" onClick={onClose} />
      <div className="modal-card legal-modal-card">
        <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        <div className="legal-tabs">
          <button className={`legal-tab${tab === "privacy" ? " active" : ""}`} onClick={() => onTabChange("privacy")}>Privacy Policy</button>
          <button className={`legal-tab${tab === "terms" ? " active" : ""}`} onClick={() => onTabChange("terms")}>Terms of Service</button>
        </div>
        <div className="legal-body">
          <div className={`legal-pane${tab === "privacy" ? " active" : ""}`} id="legalPane-privacy">
            <span className="legal-updated">Last updated: April 2026</span>
            <h3>1. Who We Are</h3>
            <p>Kaizen AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates kaizenai.dev and provides AI chatbot and voice agent services. By using our website you agree to this policy.</p>
            <h3>2. Information We Collect</h3>
            <p>We collect information you voluntarily provide through our contact form:</p>
            <ul>
              <li>Full name and company name</li>
              <li>Work email address and phone number</li>
              <li>Details about your business needs and timeline</li>
            </ul>
            <p>We also collect usage data automatically via Google Analytics 4 (page views, session duration, device type). No personally identifiable information is included in analytics data.</p>
            <h3>3. How We Use Your Information</h3>
            <ul>
              <li>To respond to your enquiry and schedule a strategy call</li>
              <li>To prepare a more relevant first conversation</li>
              <li>To improve our website and services via aggregated analytics</li>
              <li>We do not sell, rent, or share your personal data with third parties for marketing purposes</li>
            </ul>
            <h3>4. Third-Party Services</h3>
            <p>We use the following services which may process your data:</p>
            <ul>
              <li><strong>EmailJS</strong> — transmits form submissions to our inbox.</li>
              <li><strong>Google Analytics 4</strong> — anonymised website analytics.</li>
              <li><strong>Google Fonts / jsDelivr</strong> — font and script delivery CDNs.</li>
            </ul>
            <h3>5. Data Security</h3>
            <p>All data transmitted through our website is encrypted via HTTPS/TLS. We do not store form submissions on our servers.</p>
            <h3>6. Your Rights (GDPR)</h3>
            <p>If you are located in the EU/EEA or UK, you have the right to access, rectify, or erase your personal data. Contact us via WhatsApp or the contact form.</p>
            <h3>7. Cookies</h3>
            <p>We use cookies only for Google Analytics (performance/analytics cookies). No advertising or tracking cookies are used.</p>
            <h3>8. Changes to This Policy</h3>
            <p>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top will reflect any changes.</p>
          </div>

          <div className={`legal-pane${tab === "terms" ? " active" : ""}`} id="legalPane-terms">
            <span className="legal-updated">Last updated: April 2026</span>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing kaizenai.dev you agree to be bound by these Terms of Service.</p>
            <h3>2. Services</h3>
            <p>Kaizen AI provides AI chatbot and voice agent solutions for businesses. The website itself is informational only.</p>
            <h3>3. Intellectual Property</h3>
            <p>All content on this website is the property of Kaizen AI and is protected by copyright law.</p>
            <h3>4. Use of the Website</h3>
            <p>You agree not to:</p>
            <ul>
              <li>Use the site for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the site</li>
              <li>Submit false or misleading information through our contact form</li>
              <li>Use automated tools to scrape or copy site content</li>
            </ul>
            <h3>5. Disclaimer of Warranties</h3>
            <p>The website is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
            <h3>6. Limitation of Liability</h3>
            <p>To the fullest extent permitted by law, Kaizen AI shall not be liable for any indirect, incidental, or consequential damages.</p>
            <h3>7. Governing Law</h3>
            <p>These terms are governed by the laws of Sri Lanka.</p>
            <h3>8. Changes to These Terms</h3>
            <p>We may update these terms at any time.</p>
            <h3>9. Contact</h3>
            <p>For any questions, reach out via our contact form or WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
