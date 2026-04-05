import React, { useState } from "react";

const EL_API_KEY  = import.meta.env.VITE_ELEVENLABS_API_KEY  || "";
const EL_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

// Strip markdown before speaking
function stripMarkdown(text) {
  return (text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[-•]\s/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
}

let currentAudio  = null; // ElevenLabs audio
let currentUtter  = null; // Web Speech utterance

// ── Web Speech API (browser built-in, free, no key needed) ──
function speakWithBrowser(text, { onStart, onEnd, onError } = {}) {
  if (!window.speechSynthesis) {
    onError?.("Browser TTS not supported");
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel(); // stop any current speech
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate  = 0.92;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  // pick a good voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Female"))
  ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
  if (preferred) utter.voice = preferred;
  utter.onstart = () => onStart?.();
  utter.onend   = () => { currentUtter = null; onEnd?.(); };
  utter.onerror = (e) => { currentUtter = null; onEnd?.(); onError?.(e.error); };
  currentUtter = utter;
  onStart?.();
  window.speechSynthesis.speak(utter);
}

// ── ElevenLabs (premium, needs valid paid key) ──
async function speakWithElevenLabs(text, { onStart, onEnd, onError } = {}) {
  stopSpeaking();
  try {
    onStart?.();
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}/stream`,
      {
        method: "POST",
        headers: { "xi-api-key": EL_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
        }),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`ElevenLabs ${res.status}: ${errText}`);
    }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    currentAudio = new Audio(url);
    currentAudio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; onEnd?.(); };
    currentAudio.onerror = () => { onEnd?.(); onError?.("Playback failed"); };
    await currentAudio.play();
  } catch (err) {
    console.warn("ElevenLabs failed, falling back to browser TTS:", err.message);
    // fallback to browser TTS
    speakWithBrowser(text, { onStart: () => {}, onEnd, onError });
  }
}

// ── Main export: tries ElevenLabs if key is valid, else browser TTS ──
export async function speakText(text, callbacks = {}) {
  const clean = stripMarkdown(text);
  if (!clean) { callbacks.onEnd?.(); return; }

  const hasValidKey = EL_API_KEY &&
    EL_API_KEY !== "your_elevenlabs_api_key_here" &&
    EL_API_KEY.startsWith("sk_");

  if (hasValidKey) {
    await speakWithElevenLabs(clean, callbacks);
  } else {
    speakWithBrowser(clean, callbacks);
  }
}

export function stopSpeaking() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  currentUtter = null;
}

export function isSpeaking() {
  return (currentAudio !== null && !currentAudio.paused) ||
         (window.speechSynthesis?.speaking === true);
}

/* ── Reusable SpeakButton ── */
export function SpeakButton({ text, size = "sm", label = "", style = {} }) {
  const [state, setState] = useState("idle");

  async function toggle() {
    if (state === "playing") { stopSpeaking(); setState("idle"); return; }
    setState("loading");
    await speakText(text, {
      onStart: () => setState("playing"),
      onEnd:   () => setState("idle"),
      onError: () => setState("idle"),
    });
  }

  const isSmall = size === "sm";
  const icon  = state === "loading" ? "⏳" : state === "playing" ? "⏹" : "🔊";
  const title = state === "playing" ? "Stop" : "Listen";

  return (
    <button
      onClick={toggle}
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: isSmall ? "4px 10px" : "8px 16px",
        background: state === "playing" ? "#fef3c7" : "#f0fdf4",
        color:      state === "playing" ? "#92400e" : "#15803d",
        border:     state === "playing" ? "1px solid #fde68a" : "1px solid #bbf7d0",
        borderRadius: "20px",
        fontSize:   isSmall ? "0.75rem" : "0.875rem",
        fontWeight: 600,
        cursor:     state === "loading" ? "wait" : "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={e => { if (state !== "loading") e.currentTarget.style.opacity = "0.8"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
    >
      {icon} {label || title}
    </button>
  );
}
