import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./Warnings.css";

function Warnings() {
  const { token, setUnseenWarnings } = useAuth();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5001/api/auth/warnings/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const sorted = res.data.warnings.sort(
          (a, b) => new Date(b.at) - new Date(a.at)
        );
        setWarnings(sorted);

        // ✅ Mark all as seen and clear badge after page loads

        await axios.patch(
          "http://localhost:5001/api/auth/warnings/mark-seen",
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnseenWarnings(0);
      } catch (err) {
        console.error("Failed to fetch warnings", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchWarnings();
  }, [token, setUnseenWarnings]);


  if (loading) {
    return (
      <div className="warnings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading warnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="warnings-container">
      <div className="warnings-header">
        <h1 className="warnings-title">Account Warnings</h1>
        <div className="warnings-count">
          <span className={`count-badge`}>
            {warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
          </span>
        </div>
      </div>
      {warnings.length === 2 && (
        <div className="escalation-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>Account at Risk</h3>
            <p>
              You have received <strong>{warnings.length} warnings</strong>. One
              additional warning will result in account suspension.
            </p>
          </div>
        </div>
      )}
      <div className="warnings-content">
        {warnings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No Warnings</h3>
            <p>Your account is in good standing with no active warnings.</p>
          </div>
        ) : (
          <div className="warnings-list">
            {warnings.map((warning, idx) => (
              <div key={idx} className="warning-card">
                <div className="warning-header">
                  <div className="warning-severity">
                    <span className="severity-indicator"></span>
                    <span className="warning-number">
                      Warning #{warnings?.length - idx}
                    </span>
                  </div>
                  <div className="warning-date">{new Date(warning?.at).toLocaleString()}</div>
                </div>
                <div className="warning-body">
                  <h4 className="warning-document">{warning?.docTitle}</h4>
                  <p className="warning-message">{warning?.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Warnings;
