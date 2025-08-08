import { useState } from "react";
import axios from "axios";
import "./FeedbackPage.css";

export default function FeedbackPage() {
  const [type, setType] = useState("feedback");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const route =
        type === "feedback"
          ? "http://localhost:5001/api/auth/send-feedback"
          : "http://localhost:5001/api/auth/report-problem";

      const res = await axios.post(route, form);
      setStatus(res.data.message);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="feedback-page">
      <div className="tabs">
        <button
          className={type === "feedback" ? "active" : ""}
          onClick={() => setType("feedback")}
        >
          Feedback
        </button>
        <button
          className={type === "problem" ? "active" : ""}
          onClick={() => setType("problem")}
        >
          Report a Problem
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Your School Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <textarea
          placeholder="Your Message"
          rows="5"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        ></textarea>
        <button type="submit">Submit</button>
        {status && <p className="status">{status}</p>}
      </form>
    </div>
  );
}
