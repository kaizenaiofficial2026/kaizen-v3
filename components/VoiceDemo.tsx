"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const WS_URL = "wss://demobackend-ljfsvw.fly.dev/api/browser/stream";
const AGENT_ID = "kaizenai";

interface Bubble {
  who: "user" | "ai" | "system";
  label: string;
  text: string;
}

interface VoiceDemoProps {
  open: boolean;
  onClose: () => void;
}

type CallState = "idle" | "connecting" | "live";

export default function VoiceDemo({ open, onClose }: VoiceDemoProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [assistantText, setAssistantText] = useState("");
  const tscRef = useRef<HTMLDivElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackTimeRef = useRef(0);

  function scrollBottom() {
    requestAnimationFrame(() => {
      if (tscRef.current) tscRef.current.scrollTop = tscRef.current.scrollHeight;
    });
  }

  function addBubble(who: Bubble["who"], label: string, text: string) {
    setBubbles((b) => [...b, { who, label, text }]);
    scrollBottom();
  }

  function appendAssistant(delta: string) {
    setAssistantText((t) => t + delta);
    scrollBottom();
  }

  function commitAssistant() {
    setAssistantText((t) => {
      if (t) addBubble("ai", "Kaizen AI", t);
      return "";
    });
  }

  function pcm16ToBase64(float32: Float32Array): string {
    const buf = new ArrayBuffer(float32.length * 2);
    const view = new DataView(buf);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let bin = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000)
      bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  function base64ToPCM16(b64: string): Int16Array {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Int16Array(bytes.buffer);
  }

  function playPCM16(b64: string) {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const pcm = base64ToPCM16(b64);
    if (!pcm.length) return;
    const audioBuf = ctx.createBuffer(1, pcm.length, 24000);
    const ch = audioBuf.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) ch[i] = pcm[i] / 0x8000;
    const src = ctx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(ctx.destination);
    const now = ctx.currentTime;
    const start = Math.max(now, playbackTimeRef.current);
    src.start(start);
    playbackTimeRef.current = start + audioBuf.duration;
  }

  async function startMic() {
    const ctx = audioCtxRef.current!;
    await ctx.resume();
    playbackTimeRef.current = ctx.currentTime;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    mediaStreamRef.current = stream;
    sourceRef.current = ctx.createMediaStreamSource(stream);
    processorRef.current = ctx.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(JSON.stringify({
        type: "audio",
        audio: pcm16ToBase64(e.inputBuffer.getChannelData(0)),
        agentId: AGENT_ID,
      }));
    };

    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(ctx.destination);
  }

  function stopMic() {
    processorRef.current?.disconnect();
    if (processorRef.current) processorRef.current.onaudioprocess = null;
    processorRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  }

  const closeSession = useCallback((sendEnd = true) => {
    stopMic();
    if (wsRef.current) {
      if (sendEnd && wsRef.current.readyState === WebSocket.OPEN) {
        try { wsRef.current.send(JSON.stringify({ type: "end" })); } catch {}
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    setCallState("idle");
    setAssistantText("");
  }, []);

  function connectVoice() {
    if (callState !== "idle") return;
    setCallState("connecting");
    setBubbles([]);
    addBubble("system", "System", "Connecting voice agent…");

    audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 24000 });

    const ws = new WebSocket(`${WS_URL}?agentId=${encodeURIComponent(AGENT_ID)}`);
    wsRef.current = ws;

    ws.addEventListener("open", async () => {
      setCallState("live");
      addBubble("system", "System", "Voice agent connected. Start speaking.");
      try {
        await startMic();
      } catch {
        addBubble("system", "System", "Microphone access denied. Please allow mic and retry.");
        closeSession(false);
      }
    });

    ws.addEventListener("message", (event) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(event.data as string); } catch { return; }

      switch (msg.type) {
        case "conversation.item.input_audio_transcription.completed":
          if (msg.transcript) addBubble("user", "Caller", msg.transcript as string);
          break;
        case "response.audio_transcript.delta":
          appendAssistant((msg.delta as string) || "");
          break;
        case "response.audio.done":
        case "response.done":
          commitAssistant();
          break;
        case "response.audio.delta":
          if (msg.delta) playPCM16(msg.delta as string);
          break;
        case "input_audio_buffer.speech_started":
          setAssistantText("");
          if (audioCtxRef.current)
            playbackTimeRef.current = audioCtxRef.current.currentTime;
          break;
        case "session.ended":
          addBubble("system", "System", "Session ended.");
          closeSession(false);
          break;
        case "error":
          addBubble("system", "System", "Voice agent error.");
          break;
      }
    });

    ws.addEventListener("close", () => {
      setCallState("idle");
      stopMic();
      wsRef.current = null;
      addBubble("system", "System", "Call ended.");
    });

    ws.addEventListener("error", () => {
      addBubble("system", "System", "Connection failed.");
      closeSession(false);
    });
  }

  useEffect(() => {
    if (!open) {
      closeSession();
      setBubbles([]);
    }
  }, [open, closeSession]);

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

  const btnLabel = callState === "connecting" ? "Connecting…" : callState === "live" ? "End call" : "Call now";

  return (
    <div className="modal open" id="voiceDemoModal" aria-hidden="false">
      <div className="modal-bg" onClick={onClose} />
      <div className="modal-card vd-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="vd-modal-head">
          <span className="mono kicker">AI Voice Agent · Live Demo</span>
          <h3>Hear it for <span className="italic gold">yourself.</span></h3>
          <p>Call our live AI agent right now — ask anything. It answers like a real rep, trained on a real business.</p>
        </div>

        <div className="vd-voice-wrap">
          <div className="voice-card vd-voice-card">
            <div className="vc-top">
              <div className="vc-top-l">
                <span className="live-dot pulse"></span>
                <span className="mono">LIVE · CH 04</span>
              </div>
              <div className="vc-top-r mono">00:00:42</div>
            </div>
            <div className="vc-body">
              <div className="vc-label mono">&#47;&#47; INCOMING CALL</div>
              <div className="vc-from">
                <div className="vc-avatar">M</div>
                <div>
                  <div className="vc-name">Maya · new caller</div>
                  <div className="vc-meta mono">+94 · English → Sinhala</div>
                </div>
              </div>
              <div className="vc-actions">
                <div className="vc-stat"><div className="vc-stat-n">&lt; 5s</div><div className="vc-stat-l mono">pick‑up</div></div>
                <div className="vc-stat"><div className="vc-stat-n">30+</div><div className="vc-stat-l mono">languages</div></div>
                <div className="vc-stat"><div className="vc-stat-n">24/7</div><div className="vc-stat-l mono">on‑duty</div></div>
              </div>
            </div>
          </div>

          <div className="sat sat-a" aria-hidden="true">
            <div className="sat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
            <div className="sat-lbl mono">CHAT</div>
          </div>
          <div className="sat sat-b" aria-hidden="true">
            <div className="sat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7A2 2 0 0 1 22 16.9z" /></svg></div>
            <div className="sat-lbl mono">VOICE</div>
          </div>
          <div className="sat sat-c" aria-hidden="true">
            <div className="sat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg></div>
            <div className="sat-lbl mono">BOOK</div>
          </div>
        </div>

        <div className="vd-footer">
          <div className="vd-meta mono">
            <span className="vd-dot"></span>
            Live · Answering 24/7
          </div>
          <button
            type="button"
            className="btn btn-primary vd-submit"
            data-state={callState}
            onClick={() => callState !== "idle" ? closeSession() : connectVoice()}
          >
            <span className="vd-phone-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="vd-btn-label">{btnLabel}</span>
          </button>

          {(bubbles.length > 0 || assistantText) && (
            <aside className="vd-right" aria-label="Live transcript">
              <div className="vd-right-head">
                <span className="vd-live-dot" aria-hidden="true"></span>
                <span className="mono">Live transcript</span>
              </div>
              <div className="vd-tsc" ref={tscRef} aria-live="polite">
                {bubbles.map((b, i) => (
                  <div key={i} className={`vd-bubble ${b.who} show`}>
                    <span className="vd-who">{b.label}</span>
                    <span className="vd-text">{b.text}</span>
                  </div>
                ))}
                {assistantText && (
                  <div className="vd-bubble ai show">
                    <span className="vd-who">Kaizen AI</span>
                    <span className="vd-text">{assistantText}</span>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
