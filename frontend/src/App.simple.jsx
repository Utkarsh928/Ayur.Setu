import React, { useState } from "react";
import Search from "./Search";

// Simple working App component
export default function App() {
  const [apiKey, setApiKey] = useState("dev-key");
  const [savedMappings, setSavedMappings] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      color: '#262626'
    }}>
      {/* Premium Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        color: 'white',
        padding: '2rem 3rem',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            margin: 0,
            marginBottom: '0.5rem'
          }}>
            AYUSH Dual Coding Platform
          </h1>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: '400',
            opacity: 0.9,
            margin: 0
          }}>
            Professional Healthcare Terminology Management System
          </p>
        </div>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem'
      }}>
        {/* API Configuration Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#404040',
              minWidth: '80px'
            }}>
              API Key:
            </label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d4d4d4',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                outline: 'none',
                width: '300px'
              }}
              placeholder="Enter your API key"
            />
            <button 
              onClick={loadSaved}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#0284c7',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0369a1';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#0284c7';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Search Component */}
        <Search apiKey={apiKey} />

        {/* Saved Conditions Section */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#262626',
          marginBottom: '1.5rem',
          marginTop: '3rem'
        }}>
          Saved Conditions
        </h2>
        
        {loading && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            padding: '2rem',
            textAlign: 'center',
            color: '#737373',
            border: '1px solid #e5e5e5'
          }}>
            Loading saved conditions...
          </div>
        )}
        
        {savedMappings.length === 0 && !loading && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            padding: '3rem',
            textAlign: 'center',
            color: '#737373',
            border: '1px solid #e5e5e5'
          }}>
            <div>No saved conditions yet.</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Use the search above to find and save conditions.
            </div>
          </div>
        )}
        
        {savedMappings.length > 0 && (
          <div>
            {savedMappings.map((cond, index) => (
              <div
                key={cond.id || index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e5e5e5',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#262626',
                  marginBottom: '0.5rem'
                }}>
                  {cond.code?.text || "Unnamed Condition"}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#737373',
                  marginBottom: '1rem'
                }}>
                  Patient: {cond.subject?.reference}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#f5f5f5',
                      color: '#404040',
                      border: '1px solid #d4d4d4',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
