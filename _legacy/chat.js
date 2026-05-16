(() => {
  "use strict";

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];

  const BACKEND_URL = "https://kaizen-demo-backend.vercel.app";
  const AGENT_ID = "kaizenai";

  const chatBubble = qs("#chatBubble");
  const chatPanel = qs("#chatPanel");
  const chatLog = qs("#chatLog");
  const chatForm = qs("#chatForm");
  const chatInput = qs("#chatInput");
  let chatOpened = false;
  const sessionId = crypto.randomUUID();

  function addMsg(role, text) {
    const el = document.createElement("div");
    el.className = "c-msg " + role;
    el.textContent = text;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function addTyping() {
    const el = document.createElement("div");
    el.className = "c-msg bot typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
    return el;
  }

  function openChat() {
    chatPanel.classList.add("open");
    chatBubble.classList.add("open");
    chatPanel.setAttribute("aria-hidden", "false");

    if (!chatOpened) {
      chatOpened = true;
      setTimeout(() => {
        addMsg(
          "bot",
          "Hi! I'm Kaizen — your AI agent. Ask me anything about our chatbots, voice agents, pricing, or how fast we can get you live.",
        );
      }, 220);
    }

    setTimeout(() => chatInput.focus(), 300);
  }

  function closeChat() {
    chatPanel.classList.remove("open");
    chatBubble.classList.remove("open");
    chatPanel.setAttribute("aria-hidden", "true");
  }

  async function readSSEStream(response, onChunk) {
    if (!response.body) throw new Error("Missing response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        const lines = event.split("\n");
        const dataLines = lines
          .filter((line) => line.startsWith("data: "))
          .map((line) => line.slice(6));

        if (!dataLines.length) continue;

        const payload = JSON.parse(dataLines.join("\n"));

        if (payload.error) {
          throw new Error(payload.error);
        }

        if (payload.chunk) {
          fullText += payload.chunk;
          onChunk(fullText, payload.chunk);
        }

        if (payload.done) {
          return fullText;
        }
      }
    }

    return fullText;
  }

  async function sendChat(text) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return;

    addMsg("user", cleanText);
    chatInput.value = "";
    chatInput.disabled = true;

    const typingEl = addTyping();

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message: cleanText,
          sessionId,
          agentId: AGENT_ID,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const botEl = document.createElement("div");
      botEl.className = "c-msg bot";
      botEl.textContent = "";
      typingEl.replaceWith(botEl);
      chatLog.scrollTop = chatLog.scrollHeight;

      const reply = await readSSEStream(res, (fullText) => {
        botEl.textContent = fullText;
        chatLog.scrollTop = chatLog.scrollHeight;
      });

      if (!reply.trim()) {
        botEl.textContent =
          "Sorry — I couldn't generate a reply just now. Please try again.";
      }
    } catch (err) {
      typingEl.remove();
      addMsg(
        "bot",
        "Sorry — I'm having trouble connecting right now. Try clicking 'Book a call' at the top and we'll get back to you within 1 business day",
      );
      console.error("Chat error:", err);
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  chatBubble?.addEventListener("click", () => {
    if (chatPanel.classList.contains("open")) closeChat();
    else openChat();
  });

  qs("#chatClose")?.addEventListener("click", closeChat);

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendChat(chatInput.value);
  });

  qsa("#chatQuick button").forEach((b) => {
    b.addEventListener("click", () => sendChat(b.dataset.q || ""));
  });
})();
