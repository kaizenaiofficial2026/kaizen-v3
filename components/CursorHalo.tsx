"use client";
import { useEffect, useRef } from "react";

export default function CursorHalo() {
  const haloRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tx = -100, ty = -100, cx = -100, cy = -100;
    let rafId: number | null = null;

    function loop() {
      const dx = tx - cx, dy = ty - cy;
      cx += dx * 0.12;
      cy += dy * 0.12;
      if (haloRef.current)
        haloRef.current.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%))`;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        rafId = null;
      } else {
        rafId = requestAnimationFrame(loop);
      }
    }

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`;
      if (!rafId) rafId = requestAnimationFrame(loop);
    };

    const addHover = () => document.body.classList.add("halo-hover");
    const removeHover = () => document.body.classList.remove("halo-hover");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.querySelectorAll("a, button, .tilt, summary").forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div id="halo" ref={haloRef} aria-hidden="true" />
      <div id="halo-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
