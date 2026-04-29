(() => {
  "use strict";

  const modal = document.getElementById("voiceDemoModal");
  if (!modal) return;

  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const tsc = document.getElementById("vdTranscript");
  const callBtn = document.getElementById("voiceDemoCallBtn");
  const callLbl = callBtn?.querySelector(".vd-btn-label");

  const WS_URL = "wss://demobackend-ljfsvw.fly.dev/api/browser/stream";
  const AGENT_ID = "kaizenai";

  let ws = null;
  let audioContext = null;
  let mediaStream = null;
  let sourceNode = null;
  let processorNode = null;
  let isConnecting = false;
  let isSessionOpen = false;
  let currentAssistantBubble = null;

  // Sequentially scheduled audio chunks so replies play without overlap.
  let playbackTime = 0;

  function setBtnState(state) {
    if (!callBtn) return;
    callBtn.dataset.state = state;
    if (!callLbl) return;
    callLbl.textContent =
      state === "connecting"
        ? "Connecting…"
        : state === "live"
          ? "End call"
          : "Call now";
  }

  function appendBubble(who, label, text) {
    if (!tsc) return null;
    const row = document.createElement("div");
    row.className = `vd-bubble ${who} show`;
    row.innerHTML = `<span class="vd-who"></span><span class="vd-text"></span>`;
    row.querySelector(".vd-who").textContent = label;
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
    currentAssistantBubble.querySelector(".vd-text").textContent = text;
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
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToPCM16(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Int16Array(bytes.buffer);
  }

  function playPCM16(base64Audio) {
    if (!audioContext) return;
    const pcm16 = base64ToPCM16(base64Audio);
    if (!pcm16.length) return;

    const audioBuffer = audioContext.createBuffer(1, pcm16.length, 24000);
    const channel = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcm16.length; i++) channel[i] = pcm16[i] / 0x8000;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    const now = audioContext.currentTime;
    const startAt = Math.max(now, playbackTime);
    source.start(startAt);
    playbackTime = startAt + audioBuffer.duration;
  }

  function resetPlaybackQueue() {
    playbackTime = audioContext ? audioContext.currentTime : 0;
  }

  async function startMic() {
    audioContext =
      audioContext ||
      new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000,
      });
    await audioContext.resume();
    playbackTime = audioContext.currentTime;

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
      ws.send(
        JSON.stringify({
          type: "audio",
          audio: pcm16ToBase64(input),
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
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
  }

  function connectVoice() {
    if (isConnecting || isSessionOpen) return;
    isConnecting = true;
    setBtnState("connecting");
    showSystemMessage("Connecting voice agent…");

    ws = new WebSocket(`${WS_URL}?agentId=${encodeURIComponent(AGENT_ID)}`);

    ws.addEventListener("open", async () => {
      isConnecting = false;
      isSessionOpen = true;
      setBtnState("live");
      showSystemMessage("Voice agent connected. Start speaking.");
      try {
        await startMic();
      } catch (err) {
        showSystemMessage("Microphone access denied. Please allow mic and retry.");
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
          if (msg.transcript) appendBubble("user", "Caller", msg.transcript);
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
          if (msg.delta) playPCM16(msg.delta);
          break;

        case "input_audio_buffer.speech_started":
          // User started talking — cut assistant playback so barge-in feels natural.
          clearAssistantBubble();
          resetPlaybackQueue();
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
      const wasOpen = isSessionOpen;
      isConnecting = false;
      isSessionOpen = false;
      stopMic();
      ws = null;
      setBtnState("idle");
      if (wasOpen) showSystemMessage("Call ended.");
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
        try {
          ws.send(JSON.stringify({ type: "end" }));
        } catch {}
      }
      ws.close();
      ws = null;
    }
    isConnecting = false;
    isSessionOpen = false;
    setBtnState("idle");
  }

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    if (tsc) tsc.innerHTML = "";
    setBtnState("idle");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    closeSession();
    if (tsc) tsc.innerHTML = "";
  }

  callBtn?.addEventListener("click", () => {
    if (isSessionOpen || isConnecting) {
      closeSession();
    } else {
      connectVoice();
    }
  });

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
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
})();
