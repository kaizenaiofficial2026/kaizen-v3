"use client";
import { useState, useRef, useCallback } from "react";

const BACKEND_URL = "https://kaizen-demo-backend.vercel.app";
const AGENT_ID = "kaizenai";

interface Message {
  role: "user" | "bot";
  text: string;
  typing?: boolean;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(crypto.randomUUID());

  function scrollBottom() {
    requestAnimationFrame(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }

  function openChat() {
    setOpen(true);
    if (!opened) {
      setOpened(true);
      setTimeout(() => {
        setMessages([{ role: "bot", text: "Hi! I'm Kaizen — your AI agent. Ask me anything about our chatbots, voice agents, pricing, or how fast we can get you live." }]);
        scrollBottom();
      }, 220);
    }
  }

  const sendChat = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    setMessages((m) => [...m, { role: "user", text: clean }, { role: "bot", text: "", typing: true }]);
    setInput("");
    setLoading(true);
    scrollBottom();

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message: clean, sessionId: sessionId.current, agentId: AGENT_ID }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, typing: false } : msg));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          const lines = event.split("\n").filter((l) => l.startsWith("data: "));
          if (!lines.length) continue;
          const payload = JSON.parse(lines.map((l) => l.slice(6)).join("\n"));
          if (payload.error) throw new Error(payload.error);
          if (payload.chunk) {
            fullText += payload.chunk;
            setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, text: fullText } : msg));
            scrollBottom();
          }
          if (payload.done) break;
        }
      }

      if (!fullText.trim()) {
        setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, text: "Sorry — I couldn't generate a reply just now. Please try again." } : msg));
      }
    } catch {
      setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, typing: false, text: "Sorry — I'm having trouble connecting right now. Try clicking 'Book a call' at the top and we'll get back to you within 1 business day" } : msg));
    } finally {
      setLoading(false);
      scrollBottom();
    }
  }, [loading]);

  return (
    <>
      <button
        id="chatBubble"
        className={`chat-bubble${open ? " open" : ""}`}
        aria-label="Chat with Kaizen AI"
        onClick={() => open ? setOpen(false) : openChat()}
      >
        <span className="cb-pulse" aria-hidden="true" />
        <svg className="cb-icon cb-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <svg className="cb-icon cb-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
        <span className="cb-label">Chat</span>
        <span className="cb-dot" aria-hidden="true" />
      </button>

      <div id="chatPanel" className={`chat-panel${open ? " open" : ""}`} aria-hidden={!open}>
        <header className="chat-head">
          <div className="chat-id">
            <div className="chat-name">Kaizen<em>AI</em></div>
            <div className="chat-status">
              <span className="live-dot"></span>
              <span className="mono">online · replies instantly</span>
            </div>
          </div>
          <button className="chat-x" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        </header>

        <div id="chatLog" className="chat-log" ref={logRef} aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`c-msg ${msg.role}${msg.typing ? " typing" : ""}`}>
              {msg.typing ? <><span /><span /><span /></> : msg.text}
            </div>
          ))}
        </div>

        <div id="chatQuick" className="chat-quick">
          <button onClick={() => sendChat("What does Kaizen AI do?")}>What do you do?</button>
          <button onClick={() => sendChat("How long does setup take?")}>Setup time</button>
          <button onClick={() => sendChat("I'd like to book a call.")}>Book a call</button>
        </div>

        <form
          className="chat-form"
          autoComplete="off"
          onSubmit={(e) => { e.preventDefault(); sendChat(input); }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Kaizen AI…"
            disabled={loading}
            required
          />
          <button type="submit" aria-label="Send" disabled={loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <div className="chat-foot mono">Powered by KAIZEN AI</div>
      </div>
    </>
  );
}
