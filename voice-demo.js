(() => {
  "use strict";

  const modal = document.getElementById("voiceDemoModal");
  if (!modal) return;

  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const tsc = document.getElementById("vdTranscript");

  const WS_URL = "wss://kaizen-demo-backend.vercel.app/api/browser/stream";
  const AGENT_ID = "kaizenai";

  let ws = null;
  let audioContext = null;
  let mediaStream = null;
  let sourceNode = null;
  let processorNode = null;
  let isConnecting = false;
  let isSessionOpen = false;
  let currentAssistantBubble = null;

  function appendBubble(who, label, text) {
    if (!tsc) return null;
    const row = document.createElement("div");
    row.className = `vd-bubble ${who} show`;
    row.innerHTML = `<span class="vd-who">${label}</span><span class="vd-text"></span>`;
    row.querySelector(".vd-text").textContent = text || "";
    tsc.appendChild(row);
    tsc.scrollTop = tsc.scrollHeight;
    return row;
  }

  function updateAssistantBubble(text) {
    if (!tsc) return;
    if (!currentAssistantBubble) {
      currentAssistantBubble = appendBubble("ai", "Kaizen AI", "");
    }
    const textEl = currentAssistantBubble.querySelector(".vd-text");
    textEl.textContent = text;
    tsc.scrollTop = tsc.scrollHeight;
  }

  function clearAssistantBubble() {
    currentAssistantBubble = null;
  }

  function showSystemMessage(text) {
    appendBubble("ai", "System", text);
  }

  function pcm16ToBase64(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);

    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
  }

  function base64ToPCM16(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Int16Array(bytes.buffer);
  }

  function playPCM16(base64Audio) {
    if (!audioContext) return;

    const pcm16 = base64ToPCM16(base64Audio);
    const audioBuffer = audioContext.createBuffer(1, pcm16.length, 24000);
    const channel = audioBuffer.getChannelData(0);

    for (let i = 0; i < pcm16.length; i++) {
      channel[i] = pcm16[i] / 0x8000;
    }

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(audioContext.destination);
    bufferSource.start();
  }

  async function startMic() {
    audioContext =
      audioContext ||
      new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });

    await audioContext.resume();

    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    sourceNode = audioContext.createMediaStreamSource(mediaStream);
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);

    processorNode.onaudioprocess = (event) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const input = event.inputBuffer.getChannelData(0);
      const audio = pcm16ToBase64(input);

      ws.send(
        JSON.stringify({
          type: "audio",
          audio,
          agentId: AGENT_ID,
        }),
      );
    };

    sourceNode.connect(processorNode);
    processorNode.connect(audioContext.destination);
  }

  function stopMic() {
    if (processorNode) {
      processorNode.disconnect();
      processorNode.onaudioprocess = null;
      processorNode = null;
    }

    if (sourceNode) {
      sourceNode.disconnect();
      sourceNode = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
  }

  function connectVoice() {
    if (isConnecting || isSessionOpen) return;
    isConnecting = true;

    showSystemMessage("Connecting voice agent...");

    ws = new WebSocket(`${WS_URL}?agentId=${encodeURIComponent(AGENT_ID)}`);

    ws.addEventListener("open", async () => {
      isConnecting = false;
      isSessionOpen = true;
      showSystemMessage("Voice agent connected.");

      try {
        await startMic();
      } catch (err) {
        showSystemMessage("Microphone access failed.");
        closeSession();
      }
    });

    ws.addEventListener("message", (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (msg.type) {
        case "conversation.item.input_audio_transcription.completed":
          if (msg.transcript) {
            appendBubble("user", "Caller", msg.transcript);
          }
          break;

        case "response.audio_transcript.delta": {
          const existing =
            currentAssistantBubble?.querySelector(".vd-text")?.textContent ||
            "";
          updateAssistantBubble(existing + (msg.delta || ""));
          break;
        }

        case "response.audio.done":
        case "response.done":
          clearAssistantBubble();
          break;

        case "response.audio.delta":
          if (msg.delta) {
            playPCM16(msg.delta);
          }
          break;

        case "input_audio_buffer.speech_started":
          clearAssistantBubble();
          break;

        case "session.ended":
          showSystemMessage("Session ended.");
          closeSession(false);
          break;

        case "error":
          showSystemMessage("Voice agent error.");
          break;
      }
    });

    ws.addEventListener("close", () => {
      isConnecting = false;
      isSessionOpen = false;
      stopMic();
      ws = null;
    });

    ws.addEventListener("error", () => {
      showSystemMessage("Connection failed.");
      closeSession(false);
    });
  }

  function closeSession(sendEnd = true) {
    stopMic();
    clearAssistantBubble();

    if (ws) {
      if (sendEnd && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "end" }));
      }
      ws.close();
      ws = null;
    }

    isConnecting = false;
    isSessionOpen = false;
  }

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    if (tsc) tsc.innerHTML = "";
    connectVoice();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    closeSession();
    if (tsc) tsc.innerHTML = "";
  }

  qsa(".demo-trigger").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    }),
  );

  qsa("[data-close-demo]").forEach((el) =>
    el.addEventListener("click", closeModal),
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
})();
