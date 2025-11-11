import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_AI_BACKEND_URL || "http://localhost:5000";

function AIAnalysisModal({ incident, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/ai-analysis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ incident }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch AI analysis");
        }

        if (data.status === "success" && data.analysis) {
          setAnalysis(data.analysis);
        } else {
          throw new Error("Invalid response format from AI service");
        }
      } catch (err) {
        console.error("AI Analysis error:", err);
        setError(err.message || "Unable to connect to AI service");
      } finally {
        setLoading(false);
      }
    };

    if (incident) {
      fetchAnalysis();
    }
  }, [incident]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ai-analysis-loading">
          <p>Analyzing incident report...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="ai-analysis-error">
          <p style={{ color: "#e53e3e" }}>Error: {error}</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9em" }}>
            Please ensure the AI backend is running on port 5000.
          </p>
        </div>
      );
    }

    if (!analysis) {
      return <p>No analysis data available.</p>;
    }

    const { authenticity, quality, red_flags, recommendation, reasoning, feature_summary, model_status } = analysis;

    return (
      <div className="ai-analysis">
        {model_status && !model_status.ready && (
          <div className="model-status-banner" style={{
            backgroundColor: "#fff3cd",
            padding: "0.75rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.9em"
          }}>
            Remote AI service unavailable – generated insights using local heuristics.
          </div>
        )}

        <div className="ai-scores">
          <div className="score-card">
            <div className="score-value">{authenticity.score}%</div>
            <div className="score-label">Authenticity Score</div>
            {authenticity.label && (
              <div className="score-prediction" style={{ fontSize: "0.85em", marginTop: "0.25rem", opacity: 0.8 }}>
                Predicted: {authenticity.label}
              </div>
            )}
          </div>
          <div className="score-card">
            <div className="score-value">{quality.score}%</div>
            <div className="score-label">Quality Score</div>
            {quality.signals && quality.signals.length > 0 && (
              <div className="score-prediction" style={{ fontSize: "0.85em", marginTop: "0.25rem", opacity: 0.8 }}>
                {quality.signals.length} quality observation{quality.signals.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {authenticity.confidence && (
          <div className="confidence-breakdown" style={{ marginTop: "1.5rem" }}>
            <h4>Confidence</h4>
            <div className="confidence-bars" style={{ marginTop: "0.5rem" }}>
              {Object.entries(authenticity.confidence).map(([label, value]) => (
                <div key={label} style={{ marginBottom: "0.5rem" }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.9em",
                    marginBottom: "0.25rem"
                  }}>
                    <span>{label}</span>
                    <span>{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "#e2e8f0",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${value * 100}%`,
                      height: "100%",
                      backgroundColor: label === "Likely Authentic" ? "#48bb78" :
                                     label === "Needs Review" ? "#ed8936" : "#f56565",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="red-flags" style={{ marginTop: "1.5rem" }}>
          <h4>Red Flags</h4>
          {red_flags && red_flags.length > 0 ? (
            <ul>
              {red_flags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: "0.95em", opacity: 0.8 }}>No significant red flags detected.</p>
          )}
        </div>

        {quality.signals && quality.signals.length > 0 && (
          <div className="quality-notes" style={{ marginTop: "1.5rem" }}>
            <h4>Quality Notes</h4>
            <ul>
              {quality.signals.map((signal, idx) => (
                <li key={idx}>{signal}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="recommendation" style={{ marginTop: "1.5rem" }}>
          <h4>Recommendation</h4>
          <p>{recommendation}</p>
        </div>

        <div className="reasoning" style={{ marginTop: "1.5rem" }}>
          <h4>Reasoning</h4>
          <p>{reasoning}</p>
        </div>

        {feature_summary && (
          <div className="signals-considered" style={{ marginTop: "1.5rem" }}>
            <h4>Signals Considered</h4>
            <div className="feature-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.5rem",
              fontSize: "0.9em"
            }}>
              {Object.entries(feature_summary).map(([key, value]) => (
                <div key={key} style={{
                  padding: "0.5rem",
                  backgroundColor: "#f7fafc",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontWeight: "500", marginBottom: "0.25rem", textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ")}
                  </div>
                  <div style={{ opacity: 0.8, wordBreak: "break-word" }}>
                    {typeof value === "boolean" ? (value ? "true" : "false") :
                     typeof value === "number" ? value.toFixed(2) :
                     value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <div className="modal-header">
          <h3>AI Report Analysis</h3>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>
        {renderContent()}
        <div className="modal-actions">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAnalysisModal;
