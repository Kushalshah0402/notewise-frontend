// components/CurrentModulesBar.js
import React from "react";
import "./CurrentModulesBar.css";

export default function CurrentModulesBar({ modules, onRemove }) {
  if (!modules || modules.length === 0) return null;

  return (
    <div className="current-modules-scroll">
      <h3 className="current-modules-title">Your Current Modules</h3>
      <div className="modules-container">
        {modules.map((mod, idx) => (
          <span key={idx} className="module-pill">
            {mod}
            <span
              className="remove-icon"
              title="Remove module"
              onClick={() => onRemove(mod)}
            >
              &times;
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
