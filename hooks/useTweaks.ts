"use client";
import { useState, useEffect, useCallback } from "react";

export interface Tweaks {
  accentHue: number;
  animationLevel: number;
  grain: boolean;
  heroVariant: "transcript" | "wave" | "minimal";
  cursorHalo: boolean;
  theme: "light" | "dark" | "auto";
}

const DEFAULTS: Tweaks = {
  accentHue: 80,
  animationLevel: 10,
  grain: true,
  heroVariant: "transcript",
  cursorHalo: true,
  theme: "dark",
};

const LS_KEY = "kaizen_tweaks_v1";

export function useTweaks() {
  const [tweaks, setTweaksState] = useState<Tweaks>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      setTweaksState((prev) => ({ ...prev, ...saved }));
    } catch {}
  }, []);

  const setTweaks = useCallback((updates: Partial<Tweaks>) => {
    setTweaksState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isTouch = window.matchMedia("(hover: none)").matches;

    if (tweaks.theme === "auto") {
      const d = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = d ? "dark" : "light";
    } else {
      root.dataset.theme = tweaks.theme;
    }

    root.style.setProperty("--accent-h", String(tweaks.accentHue));
    root.style.setProperty("--anim-level", String(tweaks.animationLevel / 10));
    document.body.classList.toggle("grain-on", tweaks.grain);
    document.body.classList.toggle(
      "halo-on",
      tweaks.cursorHalo && !isTouch
    );
    document.body.dataset.heroVariant = tweaks.heroVariant;
  }, [tweaks]);

  return { tweaks, setTweaks };
}
