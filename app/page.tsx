"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LogoBar from "@/components/LogoBar";
import Work from "@/components/Work";
import Solutions from "@/components/Solutions";
import Benefits from "@/components/Benefits";
import Process from "@/components/Process";
import BookCTA from "@/components/BookCTA";
import Results from "@/components/Results";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import LegalModal from "@/components/LegalModal";
import VoiceDemo from "@/components/VoiceDemo";
import ChatWidget from "@/components/ChatWidget";
import ScrollProgress from "@/components/ScrollProgress";
import CursorHalo from "@/components/CursorHalo";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"privacy" | "terms">("privacy");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Page zoom: lock layout to 1728px reference width on desktop
    const REF = 1728, MOBILE = 760;
    function applyZoom() {
      const w = window.innerWidth;
      if (w > MOBILE) {
        document.body.style.setProperty("--page-zoom", String(w / REF));
      } else {
        document.body.style.removeProperty("--page-zoom");
      }
    }
    applyZoom();
    window.addEventListener("resize", applyZoom);
    return () => window.removeEventListener("resize", applyZoom);
  }, []);

  useEffect(() => {
    // Apply saved theme from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("kaizen_tweaks_v1") || "{}");
      const t = saved.theme || "dark";
      setTheme(t);
      if (t === "auto") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.dataset.theme = dark ? "dark" : "light";
      } else {
        document.documentElement.dataset.theme = t;
      }
      if (saved.accentHue != null)
        document.documentElement.style.setProperty("--accent-h", String(saved.accentHue));
      if (saved.animationLevel != null)
        document.documentElement.style.setProperty("--anim-level", String(saved.animationLevel / 10));
      document.body.classList.toggle("grain-on", saved.grain !== false);
      const isTouch = window.matchMedia("(hover: none)").matches;
      document.body.classList.toggle("halo-on", saved.cursorHalo !== false && !isTouch);
    } catch {}

    // Reveal-up animations via Intersection Observer
    const els = document.querySelectorAll<HTMLElement>(".reveal-up");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      const saved = JSON.parse(localStorage.getItem("kaizen_tweaks_v1") || "{}");
      saved.theme = next;
      localStorage.setItem("kaizen_tweaks_v1", JSON.stringify(saved));
    } catch {}
  }

  function openLegal(tab: "privacy" | "terms") {
    setLegalTab(tab);
    setLegalOpen(true);
  }

  return (
    <>
      <CursorHalo />
      <div id="grain" aria-hidden="true" />
      <ScrollProgress />

      <Header
        onBooking={() => setBookingOpen(true)}
        onThemeToggle={toggleTheme}
      />

      <main>
        <Hero
          onBooking={() => setBookingOpen(true)}
          onDemo={() => setVoiceOpen(true)}
        />
        <LogoBar />
        <Work />
        <Solutions />
        <Benefits />
        <Process />
        <BookCTA
          onBooking={() => setBookingOpen(true)}
          onDemo={() => setVoiceOpen(true)}
        />
        <Results />
        <FAQ onBooking={() => setBookingOpen(true)} />
      </main>

      <Footer
        onBooking={() => setBookingOpen(true)}
        onLegal={openLegal}
      />

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <LegalModal
        open={legalOpen}
        tab={legalTab}
        onClose={() => setLegalOpen(false)}
        onTabChange={setLegalTab}
      />
      <VoiceDemo open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <ChatWidget />
    </>
  );
}
