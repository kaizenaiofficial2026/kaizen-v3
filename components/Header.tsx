"use client";
import { useState, useEffect } from "react";

interface HeaderProps {
  onBooking: () => void;
  onThemeToggle: () => void;
}

export default function Header({ onBooking, onThemeToggle }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("work");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const navSections = ["work", "solutions", "process", "faq"];
    const elements = navSections
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header id="nav" className={scrolled ? "scrolled" : ""}>
        <div className="nav-in">
          <a className="logo" href="#top">
            <span className="logo-text">
              Kaizen<em>AI</em>
            </span>
          </a>

          <nav className="nav-ul">
            {["work", "solutions", "process", "faq"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                data-s={s}
                className={activeSection === s ? "active" : ""}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </a>
            ))}
          </nav>

          <div className="nav-right">
            <button
              className="theme-toggle"
              id="themeToggle"
              aria-label="Toggle theme"
              onClick={onThemeToggle}
            >
              <svg
                className="icon-sun"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <svg
                className="icon-moon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <button
              onClick={onBooking}
              className="nav-cta booking-trigger"
              style={{ background: "none", border: "none", padding: 0 }}
            >
              <span>Book a call</span>
            </button>
            <button
              className={`ham${drawerOpen ? " open" : ""}`}
              id="ham"
              aria-label="Menu"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div id="drawer" className={drawerOpen ? "open" : ""} aria-hidden={!drawerOpen}>
        <div className="drawer-inner">
          <a href="#work" onClick={closeDrawer}>Work</a>
          <a href="#solutions" onClick={closeDrawer}>Solutions</a>
          <a href="#process" onClick={closeDrawer}>Process</a>
          <a href="#faq" onClick={closeDrawer}>FAQ</a>
          <button
            className="booking-trigger drawer-cta"
            onClick={() => { closeDrawer(); onBooking(); }}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
          >
            Book a call
          </button>
        </div>
      </div>
    </>
  );
}
