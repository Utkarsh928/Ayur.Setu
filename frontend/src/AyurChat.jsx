import React, { useState, useRef, useEffect } from "react";
import { speakText, stopSpeaking, SpeakButton } from "./hooks/useElevenLabs.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const API_KEY  = "ihZJQ51x8Z2bP9GFrSDs9rM28OrtrIQIiaUM1ZXvV5w";

/* ── simple markdown-lite renderer ── */
function RenderText({ text }) {
  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.65 }}>
      {lines.map((line, i) => {
        // bold **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        const rendered = parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j}>{p}</strong> : p
        );
        // bullet
        if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
          return (
            <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"4px" }}>
              <span style={{ color:"#16a34a", flexShrink:0 }}>•</span>
              <span>{rendered}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height:"8px" }} />;
        return <div key={i} style={{ marginBottom:"2px" }}>{rendered}</div>;
      })}
    </div>
  );
}

export default function AyurChat({ apiKey = API_KEY }) {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState([
    { role: "model", text: "Namaste! 🙏 I'm **Ayur**, your Ayurvedic health assistant.\n\nI can help you with:\n- Understanding disease codes (NAMASTE / ICD-11)\n- Ayurvedic symptoms, causes & treatments\n- Using the Ayur Setu platform\n- General Ayurvedic health tips\n\nHow can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  async function sendMessageText(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    const history = newMessages.slice(1).slice(0, -1).map(m => ({ role: m.role, text: m.text }));
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ message: text.trim(), history }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: "Sorry, I couldn't connect right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    await sendMessageText(input);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function clearChat() {
    setMessages([{ role: "model", text: "Namaste! 🙏 I'm **Ayur**, your Ayurvedic health assistant.\n\nI can help you with:\n- Understanding disease codes (NAMASTE / ICD-11)\n- Ayurvedic symptoms, causes & treatments\n- Using the Ayur Setu platform\n- General Ayurvedic health tips\n\nHow can I help you today?" }]);
  }

  const quickReplies = [
    "What is Shwasa disease?",
    "Explain NAMASTE codes",
    "What is Jwara?",
    "How to use this platform?",
  ];

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => { setOpen(o => !o); stopSpeaking(); }}
        title="Chat with Ayur"
        style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 1000,
          width: "62px", height: "62px", borderRadius: "50%",
          background: "linear-gradient(135deg, #0f4c35, #16a34a)",
          border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(15,76,53,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "26px",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(15,76,53,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)";   e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,76,53,0.45)"; }}
      >
        {open ? "✕" : "🌿"}
        {/* unread dot when closed */}
        {!open && (
          <span style={{
            position:"absolute", top:"4px", right:"4px",
            width:"14px", height:"14px", borderRadius:"50%",
            background:"#f59e0b", border:"2px solid #fff",
            fontSize:"8px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700,
          }}>A</span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: "104px", right: "28px", zIndex: 999,
          width: "clamp(320px, 90vw, 400px)",
          height: "clamp(480px, 70vh, 580px)",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "chatSlideIn 0.25s ease",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0f4c35, #16a34a)",
            padding: "16px 18px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", flexShrink: 0,
            }}>🌿</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Ayur</div>
              <div style={{ fontSize: "0.75rem", color: "#a7f3d0", display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                Ayurvedic Health Assistant
              </div>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:"8px", padding:"5px 10px", cursor:"pointer", fontSize:"0.75rem" }}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px",
            display: "flex", flexDirection: "column", gap: "12px",
            background: "#f8faf8",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end", gap: "8px",
              }}>
                {msg.role === "model" && (
                  <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#0f4c35,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>🌿</div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:"4px", maxWidth:"82%" }}>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #0f4c35, #16a34a)"
                      : "#ffffff",
                    color: msg.role === "user" ? "#ffffff" : "#1c1917",
                    fontSize: "0.875rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    border: msg.role === "model" ? "1px solid #e7e5e4" : "none",
                  }}>
                    <RenderText text={msg.text} />
                  </div>
                  {/* 🔊 speak button only on Ayur replies */}
                  {msg.role === "model" && i > 0 && (
                    <SpeakButton text={msg.text} size="sm" label="Listen" style={{ alignSelf:"flex-start", marginLeft:"4px" }} />
                  )}
                </div>
              </div>
            ))}

            {/* typing indicator */}
            {loading && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:"8px" }}>
                <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#0f4c35,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>🌿</div>
                <div style={{ padding:"10px 16px", background:"#fff", borderRadius:"18px 18px 18px 4px", border:"1px solid #e7e5e4", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                  <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{
                        width:"7px", height:"7px", borderRadius:"50%", background:"#16a34a",
                        animation:`bounce 1.2s ease-in-out ${j*0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies — only show when no user message yet */}
          {messages.length === 1 && (
            <div style={{ padding:"8px 12px", display:"flex", gap:"6px", flexWrap:"wrap", background:"#f8faf8", borderTop:"1px solid #e7e5e4" }}>
              {quickReplies.map((q, i) => (
                <button key={i} onClick={() => sendMessageText(q)}
                  style={{
                    padding:"5px 10px", background:"#dcfce7", color:"#15803d",
                    border:"1px solid #bbf7d0", borderRadius:"20px",
                    fontSize:"0.75rem", fontWeight:600, cursor:"pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="#bbf7d0"}
                  onMouseLeave={e => e.currentTarget.style.background="#dcfce7"}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "12px 14px",
            borderTop: "1px solid #e7e5e4",
            display: "flex", gap: "8px", alignItems: "flex-end",
            background: "#ffffff",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Ayur anything about Ayurveda..."
              rows={1}
              style={{
                flex: 1, padding: "10px 14px",
                border: "1px solid #d6d3d1", borderRadius: "12px",
                fontSize: "0.875rem", resize: "none", outline: "none",
                fontFamily: "inherit", lineHeight: 1.5,
                maxHeight: "100px", overflowY: "auto",
                background: "#fafaf9",
              }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
              onFocus={e => e.target.style.borderColor = "#16a34a"}
              onBlur={e => e.target.style.borderColor = "#d6d3d1"}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: loading || !input.trim() ? "#d6d3d1" : "linear-gradient(135deg,#0f4c35,#16a34a)",
                border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                color: "#fff", fontSize: "16px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
