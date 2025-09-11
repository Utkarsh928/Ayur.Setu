import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function formatDateTime(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function highlightMatch(text, query) {
  if (!query) return text;
  try {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (
      <>
        {before}
        <span style={{ backgroundColor: "#fde68a" }}>{match}</span>
        {after}
      </>
    );
  } catch {
    return text;
  }
}

function extractName(item) {
  const n = item?.name;
  if (typeof n === "string" && n.trim()) return n.trim();
  if (n && typeof n === "object") {
    if (typeof n.text === "string" && n.text.trim()) return n.text.trim();
    const values = Object.values(n).filter((v) => typeof v === "string");
    if (values.length > 0) return values.join(" ").trim();
  }
  if (typeof item?.subject?.display === "string" && item.subject.display.trim()) return item.subject.display.trim();
  if (typeof item?.code?.text === "string" && item.code.text.trim()) return item.code.text.trim();
  if (typeof item?.title === "string" && item.title.trim()) return item.title.trim();
  return "Patient";
}

export default function Patients({ apiKey = "dev-key" }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 200);
  const listRef = useRef(null);

  const fetchSaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/saves`, { headers: { "x-api-key": apiKey } });
      if (!res.ok) throw new Error(`Failed to fetch saves (${res.status})`);
      const data = await res.json();
      const records = Array.isArray(data) ? data : [];
      setPatients(records);
      setLastUpdated(Date.now());
    } catch (e) {
      setError(e.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchSaves();
    const id = setInterval(fetchSaves, 10000);
    return () => clearInterval(id);
  }, [fetchSaves]);

  const sortedPatients = useMemo(() => {
    const toTs = (item) => {
      const candidates = [
        item?.meta?.lastUpdated,
        item?.recordedDate,
        item?.date,
        item?._savedAt,
      ];
      for (const c of candidates) {
        if (c) {
          const d = new Date(c);
          if (!Number.isNaN(d.getTime())) return d.getTime();
        }
      }
      return 0;
    };
    return [...patients].sort((a, b) => toTs(b) - toTs(a));
  }, [patients]);

  const rows = useMemo(() => {
    return sortedPatients.map((item) => {
      const id = item?.id || item?.identifier?.[0]?.value || item?._id || "unknown";
      const name = extractName(item);
      const patientRef = item?.subject?.reference || item?.subject?.id || item?.patient?.reference || "Unknown";
      const ts = item?.meta?.lastUpdated || item?.recordedDate || item?.date || item?._savedAt || null;
      return { id, name, patientRef, ts, raw: item };
    });
  }, [sortedPatients]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return rows;
    const q = debouncedSearch.toLowerCase();
    return rows.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [rows, debouncedSearch]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => r.id === selectedId) || null;
  }, [rows, selectedId]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Enter" && !selected && filteredRows.length > 0) {
        setSelectedId(filteredRows[0].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filteredRows, selected]);

  function clearSearch() {
    setSearch("");
  }

  function renderList() {
    return (
      <div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
          <input
            ref={listRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name..."
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid #d4d4d4",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          />
          {search && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              style={{
                padding: "0.5rem 0.75rem",
                backgroundColor: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
          {`Showing ${filteredRows.length} of ${rows.length} patients`}
          {lastUpdated && (
            <span style={{ marginLeft: "0.75rem" }}>
              {`Updated ${formatDateTime(lastUpdated)}`}
            </span>
          )}
        </div>

        {loading && (
          <div style={{ padding: "1rem", color: "#6b7280" }}>Loading patients…</div>
        )}
        {error && (
          <div style={{ padding: "1rem", color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "0.5rem", marginBottom: "0.75rem" }}>{error}</div>
        )}

        {filteredRows.length === 0 && !loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
            No patients found
          </div>
        ) : (
          <div>
            {filteredRows.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.07)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>
                  {highlightMatch(r.name || "Patient", debouncedSearch)}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  <span style={{ marginRight: "0.75rem" }}>{`ID: ${r.id}`}</span>
                  <span style={{ marginRight: "0.75rem" }}>{r.patientRef}</span>
                  <span>{formatDateTime(r.ts)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderDetail() {
    if (!selected) return null;
    const { raw } = selected;

    function entriesOf(obj, prefix = "") {
      const rows = [];
      if (!obj || typeof obj !== "object") return rows;
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
          rows.push(...entriesOf(v, key));
        } else {
          rows.push([key, Array.isArray(v) ? JSON.stringify(v) : String(v)]);
        }
      }
      return rows;
    }

    const allEntries = entriesOf(raw);

    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 0.75rem",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          ← Back to List
        </button>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.75rem" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>Patient Details</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "0.75rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", width: "30%" }}>Field</th>
                  <th style={{ textAlign: "left", padding: "0.75rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>Name</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{extractName(raw)}</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>Patient ID</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{selected.id}</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>Namaste code</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{raw?.code?.coding?.find?.((c) => c.system?.toLowerCase?.().includes("namaste"))?.code || ""}</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>TM2 code</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{raw?.code?.coding?.find?.((c) => (c.system || "").toLowerCase().includes("tm2"))?.code || ""}</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>BioMedical code</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{raw?.code?.coding?.find?.((c) => (c.system || "").toLowerCase().includes("biomed"))?.code || ""}</td>
                </tr>
                <tr>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>Saved At</td>
                  <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6" }}>{formatDateTime(selected.ts)}</td>
                </tr>
                {allEntries.map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6", color: "#374151" }}>{k}</td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #f3f4f6", color: "#111827" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {selected ? renderDetail() : renderList()}
    </div>
  );
}
