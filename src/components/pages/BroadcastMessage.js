import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";
import "./BroadcaseMessage.css";

function BroadcastMessage() {
  const { token, user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      toast.error("Title and message cannot be empty");
      return;
    }

    try {
      setLoadingSend(true);
      const res = await axios.post(
        "http://localhost:5001/api/admin/broadcast-message",
        { title, body },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("📢 Message broadcasted to all users!");
        setTitle("");
        setBody("");
      }
    } catch (err) {
      console.error("Broadcast failed:", err);
      toast.error("Failed to broadcast message");
    } finally {
      setLoadingSend(false);
    }
  };

  console.log("User role:", user?.role);
  console.log("🔍 Debug - user:", user);
  console.log("🔍 Debug - user.role:", user?.role);
  console.log("🔍 Debug - loading:", loading);

  if (loading) {
    return <div>Loading user data…</div>;
  }

  if (!user || user.role !== "admin") {
    return <h2>🚫 Access Denied – You are not an admin</h2>;
  }

  return (
    <div className="broadcast-container">
      <h2>📣 Send Broadcast Message</h2>
      <form onSubmit={handleSubmit} className="broadcast-form">
        <input
          type="text"
          placeholder="Title (e.g. Let's build together!)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Message to all users..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          required
        />
        <button type="submit" disabled={loadingSend}>
          {loadingSend ? "Sending..." : "Send to All Users"}
        </button>
      </form>
    </div>
  );
}

export default BroadcastMessage;
