import React, { useState, useEffect } from "react";
import Search from "./Search";
import Patients, { MongoDashboard, FHIRDashboard } from "./Patients";
import AyurChat from "./AyurChat";
import "./App.css";

/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
function HomePage({ onNavigate }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <section style={{
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "url('/bg2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        {/* dark overlay so text stays readable */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,40,25,0.62) 0%, rgba(15,76,53,0.52) 50%, rgba(8,50,30,0.65) 100%)",
          backdropFilter: "blur(1px)",
        }} />

        {/* portrait botanical image — right side accent */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: "clamp(180px, 28vw, 380px)",
          backgroundImage: "url('/bg1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.18,
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.6), transparent)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.6), transparent)",
        }} />

        {/* content — sits above overlay */}
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ fontSize:"64px", marginBottom:"16px", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>🌿</div>

          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 800,
            color: "#ffffff",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            textShadow: "0 2px 16px rgba(0,0,0,0.4)",
          }}>
            Ayur Setu
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
            color: "#a7f3d0",
            margin: "0 0 8px",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
          }}>
            आयुर्वेद का डिजिटल सेतु
          </p>

          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            color: "#d1fae5",
            maxWidth: "620px",
            lineHeight: 1.7,
            margin: "0 auto 40px",
            textShadow: "0 1px 6px rgba(0,0,0,0.3)",
          }}>
            Bridging traditional Ayurvedic wisdom with modern international medical
            coding standards — NAMASTE, ICD-11 TM2 &amp; Biomed — for AYUSH doctors
            across India.
          </p>

          <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", justifyContent:"center" }}>
            <button
              onClick={() => onNavigate("search")}
              style={{
                padding: "14px 36px",
                background: "#ffffff",
                color: "#0f4c35",
                border: "none",
                borderRadius: "50px",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              🔍 Search Terminology
            </button>
            <button
              onClick={() => onNavigate("mongo")}
              style={{
                padding: "14px 36px",
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                border: "2px solid rgba(255,255,255,0.6)",
                borderRadius: "50px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            >
              👤 Manage Patients
            </button>
          </div>

          {/* stats strip */}
          <div style={{
            display: "flex", gap: "40px", flexWrap: "wrap", justifyContent: "center",
            marginTop: "60px", paddingTop: "40px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}>
            {[
              { n: "500+",   label: "NAMASTE Codes" },
              { n: "ICD-11", label: "TM2 & Biomed" },
              { n: "5",      label: "Indian Languages" },
              { n: "FHIR R4",label: "Compliant" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{s.n}</div>
                <div style={{ fontSize: "0.8rem", color: "#a7f3d0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Importance of Ayurveda ── */}
      <section style={{
        padding: "80px 24px",
        background: "#fafaf9",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* subtle bg1 watermark */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/bg1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ color: "#16a34a", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "12px" }}>
          Why Ayurveda Matters
        </p>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#1c1917", margin: "0 0 16px" }}>
          5000 Years of Healing Wisdom
        </h2>
        <p style={{ maxWidth: "640px", margin: "0 auto 60px", color: "#57534e", lineHeight: 1.8, fontSize: "1.05rem" }}>
          Ayurveda is not just medicine — it is a complete science of life. Rooted in
          nature, it treats the whole person: body, mind, and spirit. Today, over
          <strong> 800 million people</strong> in India rely on AYUSH systems for
          primary healthcare.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          {[
            { icon: "🌱", title: "Natural Healing",    desc: "Uses herbs, minerals and natural therapies with minimal side effects." },
            { icon: "⚖️", title: "Holistic Balance",   desc: "Balances Vata, Pitta and Kapha doshas for complete wellbeing." },
            { icon: "🔬", title: "Modern Integration", desc: "Now mapped to ICD-11 for global recognition and interoperability." },
            { icon: "🏥", title: "Preventive Care",    desc: "Focuses on prevention through diet, lifestyle and seasonal routines." },
            { icon: "🌍", title: "Global Recognition", desc: "WHO recognises traditional medicine as essential to universal health." },
            { icon: "📋", title: "Digital Records",    desc: "FHIR-compliant records ensure AYUSH data integrates with ABDM." },
          ].map((c, i) => (
            <div key={i} style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px 20px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid #e7e5e4",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"; }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>{c.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1c1917", margin: "0 0 8px" }}>{c.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "#78716c", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>{/* end grid */}
        </div>{/* end zIndex wrapper */}
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "80px 24px", background: "#ffffff", textAlign: "center" }}>
        <p style={{ color: "#16a34a", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "12px" }}>
          Platform Features
        </p>
        <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#1c1917", margin: "0 0 48px" }}>
          Everything a Doctor Needs
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", maxWidth: "1100px", margin: "0 auto" }}>
          {[
            { icon: "🔍", title: "Smart Search",       desc: "Search NAMASTE, ICD-11 TM2 and Biomed codes instantly with voice support.", tab: "search",  btn: "Open Search" },
            { icon: "🤖", title: "AI Overview",        desc: "Gemini AI explains any disease — causes, symptoms, treatment in your language.", tab: "search",  btn: "Try AI" },
            { icon: "👥", title: "Patient Management", desc: "Add patients, record diagnosis, treatment advice and full medical history.", tab: "mongo",   btn: "View Patients" },
            { icon: "📄", title: "FHIR Records",       desc: "Generate FHIR R4 Condition resources for ABDM-compliant digital health records.", tab: "fhir",    btn: "FHIR Dashboard" },
            { icon: "💾", title: "Saved Conditions",   desc: "Save, edit and manage all your coded conditions in one place.", tab: "saved",   btn: "View Saved" },
            { icon: "🌐", title: "Multilingual",       desc: "Full support for Hindi, Bengali, Telugu, Marathi and English.", tab: "search",  btn: "Try Now" },
          ].map((f, i) => (
            <div key={i} style={{
              background: "linear-gradient(135deg, #f0fdf4, #ffffff)",
              borderRadius: "16px",
              padding: "28px 22px",
              border: "1px solid #dcfce7",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}>
              <div style={{ fontSize: "2rem" }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1c1917", margin: 0 }}>{f.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "#57534e", lineHeight: 1.6, margin: 0, flex: 1 }}>{f.desc}</p>
              <button
                onClick={() => onNavigate(f.tab)}
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 18px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: "4px",
                }}
              >
                {f.btn} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: "linear-gradient(135deg, #0f4c35, #1a7a52)",
        padding: "70px 24px",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, color: "#ffffff", margin: "0 0 16px" }}>
          Ready to Bridge Ayurveda with Modern Medicine?
        </h2>
        <p style={{ color: "#a7f3d0", fontSize: "1.05rem", margin: "0 0 32px" }}>
          Start searching, coding and managing patients today.
        </p>
        <button
          onClick={() => onNavigate("search")}
          style={{
            padding: "14px 40px",
            background: "#ffffff",
            color: "#0f4c35",
            border: "none",
            borderRadius: "50px",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          Get Started Free →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1c1917", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ color: "#a8a29e", fontSize: "0.875rem", margin: 0 }}>
          © 2024 Ayur Setu · Bridging Ayurveda &amp; Modern Medicine · Built for AYUSH Doctors
        </p>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
export default function App() {
  const [apiKey, setApiKey] = useState("ihZJQ51x8Z2bP9GFrSDs9rM28OrtrIQIiaUM1ZXvV5w");
  const [savedMappings, setSavedMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editCondition, setEditCondition] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToastNotification = (message, variant = "success") => {
    setToastMessage(message); setToastVariant(variant); setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  async function loadSaved() {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/saves", { headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error("Failed to fetch saves");
      const data = await res.json();
      setSavedMappings(data);
    } catch (err) {
      showToastNotification("Error loading data: " + err.message, "danger");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadSaved(); }, []);

  async function handleDelete(index) {
    const condition = savedMappings[index];
    try {
      const res = await fetch(`http://127.0.0.1:8000/saves/${condition.id}`, { method: "DELETE", headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error("Delete failed");
      const updated = [...savedMappings];
      updated.splice(index, 1);
      setSavedMappings(updated);
      showToastNotification("Condition deleted successfully!");
    } catch (err) { showToastNotification("Delete error: " + err.message, "danger"); }
  }

  function handleEdit(index) { setEditIndex(index); setEditCondition({ ...savedMappings[index] }); }

  async function saveEdit() {
    try {
      const res = await fetch(`http://127.0.0.1:8000/saves/${editCondition.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(editCondition),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = [...savedMappings];
      updated[editIndex] = editCondition;
      setSavedMappings(updated);
      setEditIndex(null); setEditCondition(null);
      showToastNotification("Changes saved successfully!");
    } catch (err) { showToastNotification("Edit error: " + err.message, "danger"); }
  }

  const navItems = [
    { id: "home",   label: "Home",    icon: "🏠" },
    { id: "search", label: "Search",  icon: "🔍" },
    { id: "mongo",  label: "Patients",icon: "👥" },
    { id: "fhir",   label: "FHIR",    icon: "📄" },
    { id: "saved",  label: `Saved (${savedMappings.length})`, icon: "💾" },
  ];

  const isHome = activeTab === "home";

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#1c1917" : "#f5f5f4", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: isHome
          ? "rgba(15,76,53,0.97)"
          : darkMode ? "rgba(28,25,23,0.97)" : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: isHome ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e7e5e4",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

          {/* Brand */}
          <button onClick={() => setActiveTab("home")} style={{ display:"flex", alignItems:"center", gap:"10px", background:"none", border:"none", cursor:"pointer", padding:0 }}>
            <span style={{ fontSize: "1.6rem" }}>🌿</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, color: isHome ? "#ffffff" : (darkMode ? "#ffffff" : "#0f4c35"), letterSpacing: "-0.01em" }}>
              Ayur Setu
            </span>
          </button>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: activeTab === item.id ? 700 : 500,
                  background: activeTab === item.id
                    ? (isHome ? "rgba(255,255,255,0.2)" : "#dcfce7")
                    : "transparent",
                  color: activeTab === item.id
                    ? (isHome ? "#ffffff" : "#0f4c35")
                    : (isHome ? "rgba(255,255,255,0.75)" : (darkMode ? "#d6d3d1" : "#57534e")),
                  transition: "all 0.15s",
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                marginLeft: "8px", padding: "8px 12px", borderRadius: "8px",
                border: "none", cursor: "pointer", fontSize: "1rem",
                background: isHome ? "rgba(255,255,255,0.15)" : (darkMode ? "#292524" : "#f5f5f4"),
                color: isHome ? "#fff" : (darkMode ? "#fff" : "#57534e"),
              }}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      {activeTab === "home" && <HomePage onNavigate={setActiveTab} />}

      {activeTab !== "home" && (
        <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

          {/* API config bar — compact */}
          <div style={{
            background: darkMode ? "#292524" : "#ffffff",
            border: darkMode ? "1px solid #44403c" : "1px solid #e7e5e4",
            borderRadius: "12px",
            padding: "14px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: darkMode ? "#a8a29e" : "#78716c", whiteSpace: "nowrap" }}>API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter API key"
              style={{
                flex: 1, minWidth: "200px", padding: "7px 12px",
                border: darkMode ? "1px solid #44403c" : "1px solid #d6d3d1",
                borderRadius: "8px", fontSize: "0.875rem",
                background: darkMode ? "#1c1917" : "#fafaf9",
                color: darkMode ? "#ffffff" : "#1c1917",
                outline: "none",
              }}
            />
            <button
              onClick={loadSaved}
              disabled={loading}
              style={{
                padding: "7px 18px", background: "#16a34a", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "0.875rem",
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "..." : "↻ Refresh"}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "search" && <Search apiKey={apiKey} />}
          {activeTab === "mongo"  && <MongoDashboard apiKey={apiKey} />}
          {activeTab === "fhir"   && <FHIRDashboard apiKey={apiKey} />}

          {activeTab === "saved" && (
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: darkMode ? "#fff" : "#1c1917", marginBottom: "20px" }}>
                💾 Saved Conditions
              </h2>

              {loading && (
                <div style={{ textAlign: "center", padding: "40px", color: "#78716c" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏳</div>
                  Loading saved conditions...
                </div>
              )}

              {savedMappings.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#78716c" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📋</div>
                  <h3 style={{ margin: "0 0 8px", color: darkMode ? "#d6d3d1" : "#44403c" }}>No saved conditions yet</h3>
                  <p style={{ margin: 0 }}>Use the Search tab to find and save medical conditions.</p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {savedMappings.map((cond, index) => (
                  <div key={cond.id || index} style={{
                    background: darkMode ? "#292524" : "#ffffff",
                    border: darkMode ? "1px solid #44403c" : "1px solid #e7e5e4",
                    borderRadius: "12px", padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}>
                    {editIndex === index ? (
                      <div>
                        <textarea
                          value={editCondition.code?.text || ""}
                          onChange={e => setEditCondition({ ...editCondition, code: { ...editCondition.code, text: e.target.value } })}
                          placeholder="Enter condition description"
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d6d3d1", fontSize: "0.875rem", minHeight: "80px", resize: "vertical", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <button onClick={saveEdit} style={{ flex: 1, padding: "8px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Save</button>
                          <button onClick={() => setEditIndex(null)} style={{ flex: 1, padding: "8px", background: "#f5f5f4", color: "#57534e", border: "1px solid #d6d3d1", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: darkMode ? "#fff" : "#1c1917" }}>{cond.code?.text || "Unnamed Condition"}</h4>
                          <span style={{ fontSize: "0.72rem", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "20px", fontWeight: 600 }}>{cond.resourceType || "Condition"}</span>
                        </div>
                        <p style={{ margin: "0 0 4px", fontSize: "0.82rem", color: "#78716c" }}>
                          <strong>Patient:</strong> {cond.subject?.reference}
                        </p>
                        {cond.meta?.lastUpdated && (
                          <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#78716c" }}>
                            <strong>Updated:</strong> {new Date(cond.meta.lastUpdated).toLocaleDateString()}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleEdit(index)} style={{ flex: 1, padding: "7px", background: "#f5f5f4", color: "#57534e", border: "1px solid #d6d3d1", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDelete(index)} style={{ flex: 1, padding: "7px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── Toast ── */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
          background: toastVariant === "success" ? "#16a34a" : "#dc2626",
          color: "#fff", padding: "12px 20px", borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: "0.875rem", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "10px",
          animation: "slideIn 0.3s ease",
        }}>
          <span>{toastVariant === "success" ? "✓" : "!"}</span>
          <span>{toastMessage}</span>
          <button onClick={() => setShowToast(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem", padding: 0, marginLeft: "4px" }}>×</button>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Ayur Chatbot ── */}
      <AyurChat apiKey={apiKey} />
    </div>
  );
}
