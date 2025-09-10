import React, { useState, useEffect } from "react";
// import Search from "./Search";

// Premium Healthcare Design System
const designSystem = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      900: '#0c4a6e'
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      900: '#14532d'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    accent: {
      teal: '#14b8a6',
      emerald: '#10b981',
      blue: '#3b82f6'
    }
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  }
};

const styles = {
  app: {
    fontFamily: designSystem.typography.fontFamily,
    backgroundColor: designSystem.colors.neutral[50],
    minHeight: '100vh',
    color: designSystem.colors.neutral[800]
  },
  header: {
    background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.primary[700]} 100%)`,
    color: 'white',
    padding: `${designSystem.spacing.xl} ${designSystem.spacing['2xl']}`,
    boxShadow: designSystem.shadows.lg
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: designSystem.typography.sizes['3xl'],
    fontWeight: designSystem.typography.fontWeights.bold,
    margin: 0,
    marginBottom: designSystem.spacing.sm
  },
  subtitle: {
    fontSize: designSystem.typography.sizes.lg,
    fontWeight: designSystem.typography.fontWeights.normal,
    opacity: 0.9,
    margin: 0
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: designSystem.spacing['2xl']
  },
  card: {
    backgroundColor: 'white',
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.md,
    padding: designSystem.spacing.xl,
    marginBottom: designSystem.spacing.xl,
    border: `1px solid ${designSystem.colors.neutral[200]}`
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.lg
  },
  label: {
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    color: designSystem.colors.neutral[700],
    minWidth: '80px'
  },
  input: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    border: `1px solid ${designSystem.colors.neutral[300]}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.base,
    fontFamily: designSystem.typography.fontFamily,
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '300px'
  },
  button: {
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    backgroundColor: designSystem.colors.primary[600],
    color: 'white',
    border: 'none',
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.sm,
    fontWeight: designSystem.typography.fontWeights.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: designSystem.typography.fontFamily
  },
  buttonSecondary: {
    ...this.button,
    backgroundColor: designSystem.colors.neutral[100],
    color: designSystem.colors.neutral[700],
    border: `1px solid ${designSystem.colors.neutral[300]}`
  },
  sectionTitle: {
    fontSize: designSystem.typography.sizes['2xl'],
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.lg,
    marginTop: designSystem.spacing['2xl']
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.sm,
    padding: designSystem.spacing.xl,
    textAlign: 'center',
    color: designSystem.colors.neutral[500]
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.sm,
    padding: designSystem.spacing['2xl'],
    textAlign: 'center',
    color: designSystem.colors.neutral[500]
  },
  conditionCard: {
    backgroundColor: 'white',
    borderRadius: designSystem.borderRadius.lg,
    boxShadow: designSystem.shadows.sm,
    padding: designSystem.spacing.lg,
    marginBottom: designSystem.spacing.md,
    border: `1px solid ${designSystem.colors.neutral[200]}`,
    transition: 'all 0.2s ease'
  },
  conditionTitle: {
    fontSize: designSystem.typography.sizes.lg,
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: designSystem.colors.neutral[800],
    marginBottom: designSystem.spacing.sm
  },
  conditionMeta: {
    fontSize: designSystem.typography.sizes.sm,
    color: designSystem.colors.neutral[500],
    marginBottom: designSystem.spacing.md
  },
  actionButtons: {
    display: 'flex',
    gap: designSystem.spacing.sm
  },
  editInput: {
    width: '100%',
    padding: designSystem.spacing.sm,
    border: `1px solid ${designSystem.colors.neutral[300]}`,
    borderRadius: designSystem.borderRadius.md,
    fontSize: designSystem.typography.sizes.base,
    fontFamily: designSystem.typography.fontFamily,
    marginBottom: designSystem.spacing.md
  }
};

export default function App() {
  const [apiKey, setApiKey] = useState("dev-key");
  const [savedMappings, setSavedMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editCondition, setEditCondition] = useState(null);

  // Load saved conditions from backend
  async function loadSaved() {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/saves", {
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) throw new Error("Failed to fetch saves");
      const data = await res.json();
      setSavedMappings(data);
    } catch (err) {
      console.error("Error loading saves:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSaved();
  }, []);

  // Delete condition
  async function handleDelete(index) {
    const condition = savedMappings[index];
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/saves/${condition.id}`,
        { method: "DELETE", headers: { "x-api-key": apiKey } }
        );
      if (!res.ok) throw new Error("Delete failed");
      const updated = [...savedMappings];
      updated.splice(index, 1);
      setSavedMappings(updated);
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  }

  // Start editing
  function handleEdit(index) {
    setEditIndex(index);
    setEditCondition({ ...savedMappings[index] });
  }

  // Save edited condition
  async function saveEdit() {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/saves/${editCondition.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify(editCondition),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = [...savedMappings];
      updated[editIndex] = editCondition;
      setSavedMappings(updated);
      setEditIndex(null);
      setEditCondition(null);
    } catch (err) {
      alert("Edit error: " + err.message);
    }
  }

  return (
    <div style={styles.app}>
      {/* Premium Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>AYUSH Dual Coding Platform</h1>
          <p style={styles.subtitle}>Professional Healthcare Terminology Management System</p>
        </div>
      </header>

      <div style={styles.container}>
        {/* API Configuration Card */}
        <div style={styles.card}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>API Key:</label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={styles.input}
              placeholder="Enter your API key"
            />
            <button 
              onClick={loadSaved} 
              style={styles.button}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = designSystem.colors.primary[700];
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = designSystem.colors.primary[600];
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Search Component - Temporarily disabled */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>🔍 Search Component</h2>
          <p>Search functionality will be enabled once the basic app is working.</p>
        </div>

        {/* Saved Conditions Section */}
        <h2 style={styles.sectionTitle}>Saved Conditions</h2>
        
        {loading && (
          <div style={styles.loadingCard}>
            <div>Loading saved conditions...</div>
          </div>
        )}
        
        {savedMappings.length === 0 && !loading && (
          <div style={styles.emptyState}>
            <div>No saved conditions yet.</div>
            <div style={{ fontSize: designSystem.typography.sizes.sm, marginTop: designSystem.spacing.sm }}>
              Use the search above to find and save conditions.
            </div>
          </div>
        )}
        
        <div>
          {savedMappings.map((cond, index) => (
            <div
              key={cond.id || index}
              style={styles.conditionCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = designSystem.shadows.md;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = designSystem.shadows.sm;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {editIndex === index ? (
                <div>
                  <input
                    value={editCondition.code?.text || ""}
                    onChange={(e) =>
                      setEditCondition({
                        ...editCondition,
                        code: { ...editCondition.code, text: e.target.value },
                      })
                    }
                    style={styles.editInput}
                    placeholder="Enter condition description"
                  />
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={saveEdit} 
                      style={styles.button}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = designSystem.colors.secondary[600];
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = designSystem.colors.primary[600];
                      }}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setEditIndex(null)}
                      style={styles.buttonSecondary}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.conditionTitle}>
                    {cond.code?.text || "Unnamed Condition"}
                  </div>
                  <div style={styles.conditionMeta}>
                    Patient: {cond.subject?.reference}
                  </div>
                  <div style={styles.actionButtons}>
                    <button 
                      onClick={() => handleEdit(index)}
                      style={styles.buttonSecondary}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(index)}
                      style={{
                        ...styles.button,
                        backgroundColor: '#dc2626'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
