import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./UpdateModules.css";

export default function UpdateModules({ onModulesUpdated }) {
  const { token, updateUser } = useAuth();
  const [modules, setModules] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newModules = modules
      .split(",")
      .map((m) => m.trim().toUpperCase())
      .filter((m) => m.length > 0);

    if (newModules.length === 0) {
      setStatus("❌ Enter valid module codes.");
      return;
    }

    try {
      console.log("Submitting with token:", token);

      // Fetch existing modules
      const resMe = await axios.get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const existingModules = resMe.data.user?.currentModules || [];

      // Merge & deduplicate
      const mergedModules = Array.from(
        new Set([...existingModules, ...newModules])
      );

      // Save merged modules to backend
      const res = await axios.post(
        "http://localhost:5001/api/auth/update-modules",
        { modules: mergedModules },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setStatus("✅ Modules updated!");
        setModules("");
        updateUser(res.data.user);
        if (onModulesUpdated) onModulesUpdated();
      } else {
        setStatus("❌ Failed to update modules.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error updating modules.");
    }
  };

  return (
    <div className="update-modules-container">
      <div className="update-modules">
        <h2>Enter this Semester's Modules</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={modules}
            onChange={(e) => setModules(e.target.value)}
            placeholder="Enter module codes (e.g., CS1010, MA1101R)"
          />
          <button type="submit">Save</button>
        </form>
        <p>{status}</p>
      </div>
    </div>
  );
}
