import React, { useState, useEffect } from "react";
import { LANGS, T, getText } from "./translations";
import { SpeakButton } from "./hooks/useElevenLabs.jsx";

/* ------------------ Design System ------------------ */
const designSystem = {
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      900: "#0c4a6e",
    },
    secondary: {
      50: "#f0fdf4",
      100: "#dcfce7",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      900: "#14532d",
    },
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
    accent: {
      teal: "#14b8a6",
      emerald: "#10b981",
      blue: "#3b82f6",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
};

/* ------------------ Styles ------------------ */
const searchStyles = {
  searchCard: {
    backgroundColor: "white",
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.md,
    padding: designSystem.spacing.xl,
    marginBottom: designSystem.spacing.xl,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
  },
  searchHeader: {
    fontSize: designSystem.typography.sizes["2xl"],
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.lg,
  },
  searchInput: {
    padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
    border: `2px solid ${designSystem.colors.neutral[300]}`,
    borderRadius: designSystem.borderRadius.lg,
    fontSize: designSystem.typography.sizes.base,
    fontFamily: designSystem.typography.fontFamily,
    transition: "all 0.2s ease",
    outline: "none",
    width: "100%",
    marginBottom: designSystem.spacing.lg,
  },
  searchButton: {
    padding: `${designSystem.spacing.md} ${designSystem.spacing.xl}`,
    backgroundColor: designSystem.colors.primary[600],
    color: "white",
    border: "none",
    borderRadius: designSystem.borderRadius.lg,
    fontSize: designSystem.typography.sizes.base,
    fontWeight: designSystem.typography.fontWeights.medium,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: designSystem.typography.fontFamily,
    width: "100%",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: designSystem.spacing.xl,
    marginTop: designSystem.spacing.xl,
  },
  resultsSection: {
    backgroundColor: "white",
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.sm,
    padding: designSystem.spacing.lg,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
  },
  sectionTitle: {
    fontSize: designSystem.typography.sizes.lg,
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.md,
    display: "flex",
    alignItems: "center",
    gap: designSystem.spacing.sm,
  },
  resultItem: {
    padding: designSystem.spacing.md,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
    borderRadius: designSystem.borderRadius.md,
    marginBottom: designSystem.spacing.sm,
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "white",
  },
  resultItemSelected: {
    borderColor: designSystem.colors.primary[500],
    backgroundColor: designSystem.colors.primary[50],
    boxShadow: designSystem.shadows.sm,
  },
  resultTitle: {
    fontSize: designSystem.typography.sizes.base,
    fontWeight: designSystem.typography.fontWeights.medium,
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.xs,
  },
  resultMeta: {
    fontSize: designSystem.typography.sizes.sm,
    color: designSystem.colors.neutral[500],
  },
  mappingCard: {
    backgroundColor: designSystem.colors.neutral[50],
    borderRadius: designSystem.borderRadius.md,
    padding: designSystem.spacing.lg,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
    marginBottom: designSystem.spacing.lg,
  },
  mappingTitle: {
    fontSize: designSystem.typography.sizes.lg,
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.md,
  },
  mappingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${designSystem.spacing.sm} 0`,
    borderBottom: `1px solid ${designSystem.colors.neutral[200]}`,
  },
  mappingLabel: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    color: designSystem.colors.neutral[600],
  },
  mappingValue: {
    fontSize: designSystem.typography.sizes.sm,
    color: designSystem.colors.neutral[800],
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
  },
  patientInput: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    border: `1px solid ${designSystem.colors.neutral[300]}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.sm,
    fontFamily: designSystem.typography.fontFamily,
    transition: "all 0.2s ease",
    outline: "none",
    width: "100%",
    marginBottom: designSystem.spacing.md,
  },
  saveButton: {
    padding: `${designSystem.spacing.md} ${designSystem.spacing.lg}`,
    backgroundColor: designSystem.colors.secondary[600],
    color: "white",
    border: "none",
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: designSystem.typography.fontFamily,
    width: "100%",
  },
  message: {
    padding: designSystem.spacing.md,
    borderRadius: designSystem.borderRadius.md,
    marginTop: designSystem.spacing.md,
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
  },
  messageSuccess: {
    backgroundColor: designSystem.colors.secondary[50],
    color: designSystem.colors.secondary[700],
    border: `1px solid ${designSystem.colors.secondary[200]}`,
  },
  messageError: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
  },
  savedConditionCard: {
    backgroundColor: "white",
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.md,
    padding: designSystem.spacing.xl,
    marginTop: designSystem.spacing.xl,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
  },
  savedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: designSystem.spacing.lg,
  },
  savedTitle: {
    fontSize: designSystem.typography.sizes.xl,
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
  },
  savedMeta: {
    fontSize: designSystem.typography.sizes.sm,
    color: designSystem.colors.neutral[500],
  },
  savedGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.lg,
  },
  savedField: {
    display: "flex",
    flexDirection: "column",
    gap: designSystem.spacing.xs,
  },
  savedLabel: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    color: designSystem.colors.neutral[600],
  },
  savedValue: {
    fontSize: designSystem.typography.sizes.base,
    color: designSystem.colors.neutral[800],
  },
  codingTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: designSystem.spacing.md,
  },
  tableHeader: {
    backgroundColor: designSystem.colors.neutral[100],
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    textAlign: "left",
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    color: designSystem.colors.neutral[700],
    border: `1px solid ${designSystem.colors.neutral[200]}`,
  },
  tableCell: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
    fontSize: designSystem.typography.sizes.sm,
    color: designSystem.colors.neutral[800],
  },
  actionButtons: {
    display: "flex",
    gap: designSystem.spacing.sm,
    justifyContent: "flex-end",
  },
  editButton: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    backgroundColor: designSystem.colors.neutral[100],
    color: designSystem.colors.neutral[700],
    border: `1px solid ${designSystem.colors.neutral[300]}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: designSystem.typography.fontFamily,
  },
  deleteButton: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: designSystem.typography.fontFamily,
  },
  editForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.lg,
  },
  editField: {
    display: "flex",
    flexDirection: "column",
    gap: designSystem.spacing.xs,
  },
  editInput: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    border: `1px solid ${designSystem.colors.neutral[300]}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.sm,
    fontFamily: designSystem.typography.fontFamily,
    transition: "all 0.2s ease",
    outline: "none",
  },
  aiOverviewCard: {
    backgroundColor: "white",
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.md,
    padding: designSystem.spacing.lg,
    marginTop: designSystem.spacing.lg,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
    borderLeft: `4px solid ${designSystem.colors.accent.teal}`,
  },
  aiOverviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: designSystem.spacing.sm,
    marginBottom: designSystem.spacing.md,
  },
  aiOverviewTitle: {
    fontSize: designSystem.typography.sizes.lg,
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
  },
  aiOverviewContent: {
    fontSize: designSystem.typography.sizes.base,
    color: designSystem.colors.neutral[700],
    lineHeight: "1.6",
  },
  aiOverviewLoading: {
    display: "flex",
    alignItems: "center",
    gap: designSystem.spacing.sm,
    color: designSystem.colors.neutral[500],
    fontStyle: "italic",
  },
  aiOverviewError: {
    color: "#dc2626",
    fontSize: designSystem.typography.sizes.sm,
    fontStyle: "italic",
  },

  /* small util styles used in earlier snippets */
  container: { padding: "20px", textAlign: "center" },
  row: { display: "flex", gap: "10px", justifyContent: "center" },
  button: {
    padding: "8px 12px",
    background: designSystem.colors.primary[600],
    color: "white",
    borderRadius: "6px",
    border: "none",
  },
  voiceBtn: { padding: "8px 12px", border: "none", borderRadius: "6px", cursor: "pointer" },
};

/* ------------------ AI Overview Formatted Component ------------------ */
const SECTION_CONFIG = [
  { key: "WHAT IS THIS",       icon: "🔬", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "WHY DOES IT HAPPEN", icon: "⚠️", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { key: "HOW TO CURE",        icon: "💊", color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" },
  { key: "TREAT",              icon: "💊", color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" },
  { key: "PREVENTION",         icon: "🛡️", color: "#8b5cf6", bg: "#faf5ff", border: "#ddd6fe" },
];

function AiOverviewFormatted({ summary, youtubeLink }) {
  // Split the raw text into sections based on numbered headings or keyword headings
  const sections = [];
  const lines = summary.split("\n").map(l => l.trim()).filter(Boolean);

  let current = null;
  for (const line of lines) {
    // Detect heading: "1. WHAT IS THIS?", "**WHAT IS THIS?**", "### WHAT IS THIS?" etc.
    const cleaned = line.replace(/\*\*/g, "").replace(/^#+\s*/, "").replace(/^[\d]+\.\s*/, "").replace(/[?:]/g, "").trim().toUpperCase();
    const matched = SECTION_CONFIG.find(s => cleaned.includes(s.key));
    if (matched) {
      if (current) sections.push(current);
      current = { ...matched, lines: [] };
    } else if (current) {
      // strip markdown bold/italic
      const plain = line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
      if (plain) current.lines.push(plain);
    } else {
      // text before any heading — put in a general section
      if (!sections.length && !current) {
        current = { key: "OVERVIEW", icon: "📋", color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd", lines: [] };
      }
      if (current) {
        const plain = line.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
        if (plain) current.lines.push(plain);
      }
    }
  }
  if (current) sections.push(current);

  // If no sections were parsed (different language / format), show as clean paragraphs
  if (sections.length === 0) {
    return (
      <div>
        {lines.map((l, i) => (
          <p key={i} style={{ margin: "0 0 10px", color: "#374151", lineHeight: 1.7, fontSize: "0.95rem" }}>
            {l.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")}
          </p>
        ))}
        {youtubeLink && <YtButton href={youtubeLink} />}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
        {sections.map((sec, i) => (
          <div key={i} style={{
            background: sec.bg,
            border: `1px solid ${sec.border}`,
            borderRadius: "12px",
            padding: "16px",
            borderLeft: `4px solid ${sec.color}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "18px" }}>{sec.icon}</span>
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: sec.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {sec.key}
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {sec.lines.map((l, j) => (
                <li key={j} style={{ color: "#374151", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: "4px" }}>
                  {l.replace(/^[-•]\s*/, "")}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {youtubeLink && <YtButton href={youtubeLink} />}
    </div>
  );
}

function YtButton({ href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      padding: "10px 20px", background: "linear-gradient(135deg, #ff0000, #cc0000)",
      color: "white", borderRadius: "8px", textDecoration: "none",
      fontSize: "0.875rem", fontWeight: 700,
      boxShadow: "0 2px 8px rgba(255,0,0,0.3)",
    }}>
      ▶ Watch on YouTube
    </a>
  );
}

/* ------------------ Component ------------------ */
export default function Search({ apiKey, savedConditions = [], setSavedConditions = null }) {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  // Voice input state
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // Search and mapping state
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [mapping, setMapping] = useState(null);

  // Save state
  const [patientId, setPatientId] = useState("example-patient");
  const [saveMessage, setSaveMessage] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Saved condition details
  const [savedCondition, setSavedCondition] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  // Inline edit
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    namaste: "",
    tm2: "",
    biomed: "",
    text: "",
  });

  // AI overview
  const [aiOverview, setAiOverview] = useState(null);
  const [loadingAiOverview, setLoadingAiOverview] = useState(false);

  // Apply language font to body & persist lang
  useEffect(() => {
    const info = LANGS[lang] || LANGS.en;
    if (info?.fontFamily) {
      document.body.style.fontFamily = info.fontFamily;
    }
    localStorage.setItem("lang", lang);
  }, [lang]);

function startListening() {
  setVoiceError("");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setVoiceError("Voice input is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setListening(true);
  recognition.start();

  recognition.onresult = (event) => {
    try {
      let transcript = event.results[0][0].transcript; // ✅ use let
      // Remove trailing punctuation (.,!?)
      transcript = transcript.replace(/[.,!?]$/, "");
      setQ(transcript);
    } catch (err) {
      console.error("Voice result error", err);
    } finally {
      setListening(false);
    }
  };

  recognition.onerror = (event) => {
    setVoiceError("Voice input error: " + (event?.error || "unknown"));
    setListening(false);
  };

  recognition.onend = () => setListening(false);
}

  /* ---------- Highlight match helper ---------- */
  function highlightMatch(text) {
    const query = (q || "").trim();
    if (!query) return text;
    const lowerText = String(text || "").toLowerCase();
    const lowerQuery = query.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (
      <span>
        {before}
        <mark>{match}</mark>
        {after}
      </span>
    );
  }

  /* ---------- Search (calls backend) ---------- */
  async function doSearch() {
    setSaveMessage("");
    setMapping(null);
    setSelectedCode(null);
    if (!q || !q.trim()) {
      setResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(q)}`, {
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
      setSaveMessage("Search error: " + err.message);
    } finally {
      setLoadingSearch(false);
    }
  }

  // Debounced auto-search as user types
  useEffect(() => {
    const trimmed = (q || "").trim();
    if (!trimmed) {
      setResults([]);
      setSelectedCode(null);
      setMapping(null);
      return;
    }
    const id = setTimeout(() => doSearch(), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]); // intentionally no doSearch in deps

  /* ---------- Translate NAMASTE → mapping ---------- */
  async function translate(code) {
    setSaveMessage("");
    setMapping(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/translate?namaste_code=${encodeURIComponent(code)}`,
        { method: "POST", headers: { "x-api-key": apiKey } }
      );
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMapping(data);
      setSelectedCode(code);
    } catch (err) {
      console.error("Translate error:", err);
      setMapping(null);
      setSaveMessage("Translate error: " + err.message);
    }
  }

  /* ---------- Save Condition (persist) ---------- */
  async function saveCondition() {
    if (!selectedCode) {
      setSaveMessage("Select a NAMASTE result and translate it first.");
      return;
    }
    setLoadingSave(true);
    setSaveMessage("");
    try {
      const url = `http://127.0.0.1:8000/problemlist/condition?namaste_code=${encodeURIComponent(
        selectedCode
      )}&patient_id=${encodeURIComponent(patientId)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // update parent's saved conditions list if provided
      const newEntry = {
        namaste: mapping?.namaste || selectedCode,
        tm2: mapping?.tm2?.code || mapping?.tm2 || "",
        biomed: mapping?.biomed?.code || mapping?.biomed || "",
      };
      if (typeof setSavedConditions === "function") {
        setSavedConditions([...savedConditions, newEntry]);
      }

      setSavedCondition(data);
      setSavedAt(new Date());
      setSaveMessage("✅ Condition saved and persisted.");
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("Save error: " + err.message);
    } finally {
      setLoadingSave(false);
    }
  }

  /* ---------- Pick codes from a FHIR Condition ---------- */
  function pickCodesFromCondition(cond) {
    const out = { namaste: "", tm2: "", biomed: "", text: "" };
    if (!cond || !cond.code) return out;

    out.text = cond.code.text || "";

    const coding = Array.isArray(cond.code.coding) ? cond.code.coding : [];
    for (const c of coding) {
      const sys = (c.system || "").toLowerCase();
      if (sys.includes("namaste") || sys.includes("ayush")) out.namaste = c.code || "";
      if (mapping?.tm2?.code && c.code === mapping.tm2.code) out.tm2 = c.code;
      if (mapping?.biomed?.code && c.code === mapping.biomed.code) out.biomed = c.code;

      if (!out.tm2 && (c.display || "").toLowerCase().includes("tm2")) out.tm2 = c.code || "";
      if (!out.biomed && (c.display || "").toLowerCase().includes("biomed")) out.biomed = c.code || "";
    }

    if (!out.tm2 && mapping?.tm2) out.tm2 = mapping.tm2.code || mapping.tm2 || "";
    if (!out.biomed && mapping?.biomed) out.biomed = mapping.biomed.code || mapping.biomed || "";
    return out;
  }

  /* ---------- Edit / update ---------- */
  function startEdit() {
    if (!savedCondition) return;
    const base = pickCodesFromCondition(savedCondition);
    setEditForm({
      namaste: base.namaste || (mapping?.namaste || selectedCode || ""),
      tm2: base.tm2 || "",
      biomed: base.biomed || "",
      text: base.text || (mapping?.namaste || ""),
    });
    setIsEditing(true);
  }

  async function saveEditsToBackend() {
    if (!savedCondition || !savedCondition.id) return;

    const current = { ...savedCondition };
    const nmDisplay = (mapping && mapping.namaste && mapping.namaste.display) || current.code?.text || "Ayush diagnosis";
    const newCoding = [];

    if (editForm.namaste) {
      newCoding.push({
        system: "urn:oid:1.2.356.10000.ayush.namaste",
        code: editForm.namaste,
        display: nmDisplay,
      });
    }
    if (editForm.tm2) {
      newCoding.push({
        system: "http://id.who.int/icd/release/11/mms",
        code: editForm.tm2,
        display: "TM2",
      });
    }
    if (editForm.biomed) {
      newCoding.push({
        system: "http://id.who.int/icd/release/11/mms",
        code: editForm.biomed,
        display: "Biomed",
      });
    }

    const updated = {
      ...current,
      code: {
        text: editForm.text || nmDisplay,
        coding: newCoding,
      },
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/saves/${encodeURIComponent(current.id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSavedCondition(data);
      setIsEditing(false);
      setSaveMessage("✅ Updated & persisted.");
    } catch (err) {
      console.error("Update error:", err);
      setSaveMessage("Update error: " + err.message);
    }
  }

  /* ---------- Delete ---------- */
  async function deleteSaved() {
    if (!savedCondition || !savedCondition.id) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/saves/${encodeURIComponent(savedCondition.id)}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      setSavedCondition(null);
      setIsEditing(false);
      setSaveMessage("🗑️ Deleted.");
    } catch (err) {
      console.error("Delete error:", err);
      setSaveMessage("Delete error: " + err.message);
    }
  }

  /* ---------- AI Overview fetch ---------- */
  useEffect(() => {
    const fetchAiOverview = async () => {
      if (!selectedCode) {
        setAiOverview(null);
        return;
      }

      const selectedResult = results.find((r) => r.code === selectedCode);
      if (!selectedResult) return;

      setLoadingAiOverview(true);
      try {
        const url = `http://127.0.0.1:8000/api/ai-overview?lang=${encodeURIComponent(
          lang
        )}&code=${encodeURIComponent(selectedCode)}&name=${encodeURIComponent(selectedResult.display)}`;
        const response = await fetch(url, { headers: { "x-api-key": apiKey } });
        if (!response.ok) throw new Error(`AI Overview failed: ${response.status}`);
        const data = await response.json();
        setAiOverview(data);
      } catch (err) {
        console.error("AI Overview error:", err);
        setAiOverview(null);
      } finally {
        setLoadingAiOverview(false);
      }
    };

    fetchAiOverview();
  }, [selectedCode, results, apiKey, lang]);

  /* ---------- Render ---------- */
  return (
    <div style={searchStyles.searchCard}>
      {/* Header + Lang selector */}
      <h2 style={searchStyles.searchHeader}>{getText(lang, "title")}</h2>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: designSystem.spacing.md }}>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px", border: `1px solid ${designSystem.colors.neutral[300]}` }}
        >
          {Object.entries(LANGS).map(([code, info]) => (
            <option key={code} value={code}>
              {info.label}
            </option>
          ))}
        </select>
      </div>

      {/* Voice & Search Row */}
      <div style={{ display: "flex", alignItems: "center", gap: designSystem.spacing.sm, marginBottom: designSystem.spacing.md }}>
        <button
          type="button"
          onClick={startListening}
          disabled={listening}
          style={{
            background: listening ? designSystem.colors.primary[100] : designSystem.colors.primary[600],
            color: "#fff",
            padding: "0.5rem 1rem",
            marginRight: "1rem",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            outline: "none",
          }}
          aria-label={listening ? "Listening..." : "Use voice"}
        >
          🎤 {listening ? "Listening..." : "Voice"}
        </button>
        <span style={{ color: "#dc2626", fontSize: 14 }}>{voiceError}</span>
      </div>

      {/* Search Input */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={getText(lang, "searchPlaceholder")}
        style={searchStyles.searchInput}
        onKeyPress={(e) => e.key === "Enter" && doSearch()}
        onFocus={(e) => {
          e.target.style.borderColor = designSystem.colors.primary[500];
          e.target.style.boxShadow = `0 0 0 3px ${designSystem.colors.primary[100]}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = designSystem.colors.neutral[300];
          e.target.style.boxShadow = "none";
        }}
        aria-label="Disease search"
      />

      <button
        onClick={doSearch}
        disabled={loadingSearch}
        style={{
          ...searchStyles.searchButton,
          opacity: loadingSearch ? 0.7 : 1,
          cursor: loadingSearch ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!loadingSearch) {
            e.currentTarget.style.backgroundColor = designSystem.colors.primary[700];
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!loadingSearch) {
            e.currentTarget.style.backgroundColor = designSystem.colors.primary[600];
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {getText(lang, "searchButton")}
      </button>

      {/* Results Grid */}
      <div style={searchStyles.resultsGrid}>
        {/* LEFT: Search Results */}
        <div style={searchStyles.resultsSection}>
          <h3 style={searchStyles.sectionTitle}>
            <span>🔍</span>
            {getText(lang, "searchResults")} {loadingSearch && " (loading...)"}
          </h3>

          {results.length === 0 && !loadingSearch && (
            <div
              style={{
                textAlign: "center",
                color: designSystem.colors.neutral[500],
                padding: designSystem.spacing.xl,
                fontStyle: "italic",
              }}
            >
              {lang === "en" ? "No results yet. Enter a search term above." : ""}
            </div>
          )}

          {results.map((r, i) => {
            const key = r.code || i;
            return (
              <div
                key={key}
                onClick={() => {
                  if (r.system === "NAMASTE") translate(r.code);
                  else {
                    setSelectedCode(r.code);
                    setMapping(null);
                  }
                }}
                style={{
                  ...searchStyles.resultItem,
                  ...(selectedCode === r.code ? searchStyles.resultItemSelected : {}),
                }}
                onMouseEnter={(e) => {
                  if (selectedCode !== r.code) {
                    e.currentTarget.style.borderColor = designSystem.colors.primary[300];
                    e.currentTarget.style.backgroundColor = designSystem.colors.primary[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCode !== r.code) {
                    e.currentTarget.style.borderColor = designSystem.colors.neutral[200];
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <div style={searchStyles.resultTitle}>{highlightMatch(r.display)}</div>
                <div style={searchStyles.resultMeta}>
                  {r.code} · {r.system}
                </div>
                {r.system === "NAMASTE" && (
                  <div
                    style={{
                      marginTop: designSystem.spacing.sm,
                      fontSize: designSystem.typography.sizes.xs,
                      color: designSystem.colors.primary[600],
                      fontWeight: designSystem.typography.fontWeights.medium,
                    }}
                  >
                    {getText(lang, "clickToTranslate")}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT: Mapping & Actions */}
        <div style={searchStyles.resultsSection}>
          <h3 style={searchStyles.sectionTitle}>
            <span>🔗</span>
            {getText(lang, "mappingActions")}
          </h3>

          <div style={searchStyles.mappingCard}>
            {!mapping && !selectedCode && (
              <div
                style={{
                  textAlign: "center",
                  color: designSystem.colors.neutral[500],
                  fontStyle: "italic",
                  padding: designSystem.spacing.lg,
                }}
              >
                {getText(lang, "selectPrompt")}
              </div>
            )}

            {mapping && (
              <div>
                <div style={searchStyles.mappingTitle}>{mapping.namaste || selectedCode}</div>

                <div style={searchStyles.mappingRow}>
                  <span style={searchStyles.mappingLabel}>{getText(lang, "tm2Code")}</span>
                  <span style={searchStyles.mappingValue}>{mapping.tm2?.code || mapping.tm2 || "—"}</span>
                </div>

                <div style={searchStyles.mappingRow}>
                  <span style={searchStyles.mappingLabel}>{getText(lang, "biomedCode")}</span>
                  <span style={searchStyles.mappingValue}>{mapping.biomed?.code || mapping.biomed || "—"}</span>
                </div>

                <div
                  style={{
                    marginTop: designSystem.spacing.md,
                    fontSize: designSystem.typography.sizes.xs,
                    color: designSystem.colors.neutral[500],
                    fontStyle: "italic",
                  }}
                >
                  {getText(lang, "mappingProvided")}
                </div>
              </div>
            )}
          </div>

          {/* Patient ID */}
          <div style={{ marginBottom: designSystem.spacing.md }}>
            <label
              style={{
                fontSize: designSystem.typography.sizes.sm,
                fontWeight: designSystem.typography.fontWeights.medium,
                color: designSystem.colors.neutral[700],
                marginBottom: designSystem.spacing.xs,
                display: "block",
              }}
            >
              {getText(lang, "patientId")}
            </label>
            <input value={patientId} onChange={(e) => setPatientId(e.target.value)} style={searchStyles.patientInput} placeholder={lang === "en" ? "Enter patient identifier" : ""} />
          </div>

          <button
            onClick={saveCondition}
            disabled={loadingSave || !selectedCode}
            style={{
              ...searchStyles.saveButton,
              opacity: loadingSave || !selectedCode ? 0.6 : 1,
              cursor: loadingSave || !selectedCode ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loadingSave && selectedCode) {
                e.currentTarget.style.backgroundColor = designSystem.colors.secondary[700];
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingSave && selectedCode) {
                e.currentTarget.style.backgroundColor = designSystem.colors.secondary[600];
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {getText(lang, "saveCondition")}
          </button>

          {saveMessage && (
            <div style={{ ...searchStyles.message, ...(saveMessage.startsWith("✅") ? searchStyles.messageSuccess : searchStyles.messageError) }}>{saveMessage}</div>
          )}
        </div>
      </div>

      {/* AI Overview */}
      {(selectedCode || loadingAiOverview) && (
        <div style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          borderRadius: "16px",
          padding: "28px",
          marginTop: "24px",
          border: "1px solid #bae6fd",
          boxShadow: "0 4px 24px rgba(14,165,233,0.08)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0c4a6e" }}>
                AI Medical Overview
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#0369a1" }}>
                Powered by Gemini · {aiOverview?.name || ""}
              </p>
            </div>
            {aiOverview?.summary && (
              <SpeakButton text={aiOverview.summary} size="sm" label="Listen" />
            )}
          </div>

          {loadingAiOverview ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 0" }}>
              <div style={{
                width: "20px", height: "20px", border: "3px solid #bae6fd",
                borderTopColor: "#0ea5e9", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ color: "#0369a1", fontStyle: "italic" }}>{getText(lang, "aiLoading")}</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : aiOverview ? (
            <AiOverviewFormatted summary={aiOverview.summary || ""} youtubeLink={aiOverview.youtube_link} />
          ) : selectedCode ? (
            <div style={{ color: "#dc2626", fontSize: "0.875rem", fontStyle: "italic" }}>
              {getText(lang, "aiError")}
            </div>
          ) : null}
        </div>
      )}

      {/* Saved Condition Card */}
      {savedCondition && (
        <div style={searchStyles.savedConditionCard}>
          <div style={searchStyles.savedHeader}>
            <div>
              <div style={searchStyles.savedTitle}>Saved Condition</div>
              <div style={searchStyles.savedMeta}>
                {savedCondition.resourceType || "Condition"} · ID: {savedCondition.id}
              </div>
            </div>
            <div style={searchStyles.savedMeta}>{savedAt ? `Saved: ${savedAt.toLocaleString()}` : ""}</div>
          </div>

          {!isEditing ? (
            <>
              <div style={searchStyles.savedGrid}>
                <div style={searchStyles.savedField}>
                  <div style={searchStyles.savedLabel}>Patient</div>
                  <div style={searchStyles.savedValue}>{savedCondition.subject?.reference}</div>
                </div>

                <div style={searchStyles.savedField}>
                  <div style={searchStyles.savedLabel}>Status</div>
                  <div style={searchStyles.savedValue}>
                    {savedCondition.clinicalStatus?.coding?.[0]?.code || "active"} · {savedCondition.verificationStatus?.coding?.[0]?.code || "confirmed"}
                  </div>
                </div>

                <div style={{ ...searchStyles.savedField, gridColumn: "1 / -1" }}>
                  <div style={searchStyles.savedLabel}>Condition Text</div>
                  <div style={searchStyles.savedValue}>{savedCondition.code?.text}</div>
                </div>

                <div style={{ ...searchStyles.savedField, gridColumn: "1 / -1" }}>
                  <div style={searchStyles.savedLabel}>Coding Systems</div>
                  <table style={searchStyles.codingTable}>
                    <thead>
                      <tr>
                        <th style={searchStyles.tableHeader}>System</th>
                        <th style={searchStyles.tableHeader}>Code</th>
                        <th style={searchStyles.tableHeader}>Display</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(savedCondition.code?.coding || []).map((c, idx) => (
                        <tr key={idx}>
                          <td style={searchStyles.tableCell}>{c.system}</td>
                          <td style={searchStyles.tableCell}>{c.code}</td>
                          <td style={searchStyles.tableCell}>{c.display || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={searchStyles.actionButtons}>
                <button
                  onClick={startEdit}
                  style={searchStyles.editButton}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = designSystem.colors.neutral[200])}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = designSystem.colors.neutral[100])}
                >
                  Edit
                </button>
                <button
                  onClick={deleteSaved}
                  style={searchStyles.deleteButton}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={searchStyles.editForm}>
                <div style={searchStyles.editField}>
                  <div style={searchStyles.savedLabel}>Condition Text</div>
                  <input value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} style={searchStyles.editInput} placeholder="Enter condition description" />
                </div>

                <div style={searchStyles.editField}>
                  <div style={searchStyles.savedLabel}>NAMASTE Code</div>
                  <input value={editForm.namaste} onChange={(e) => setEditForm({ ...editForm, namaste: e.target.value })} style={searchStyles.editInput} placeholder="NAMASTE code" />
                </div>

                <div style={searchStyles.editField}>
                  <div style={searchStyles.savedLabel}>TM2 Code</div>
                  <input value={editForm.tm2} onChange={(e) => setEditForm({ ...editForm, tm2: e.target.value })} style={searchStyles.editInput} placeholder="TM2 code" />
                </div>

                <div style={searchStyles.editField}>
                  <div style={searchStyles.savedLabel}>Biomed Code</div>
                  <input value={editForm.biomed} onChange={(e) => setEditForm({ ...editForm, biomed: e.target.value })} style={searchStyles.editInput} placeholder="Biomed code" />
                </div>
              </div>

              <div style={searchStyles.actionButtons}>
                <button
                  onClick={saveEditsToBackend}
                  style={searchStyles.saveButton}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = designSystem.colors.secondary[700])}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = designSystem.colors.secondary[600])}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={searchStyles.editButton}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = designSystem.colors.neutral[200])}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = designSystem.colors.neutral[100])}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
