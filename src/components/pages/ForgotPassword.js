// frontend/src/components/pages/ForgotPassword.js
import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isAllowedEmail = (email) =>
    /@(?:u\.nus\.edu|smu\.edu\.sg|e\.ntu\.edu\.sg)$/i.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAllowedEmail(email)) {
      toast.error("❌ Only NUS, SMU, or NTU student emails are accepted.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        "http://localhost:5001/api/auth/request-reset-password",
        {
          email,
        }
      );

      toast.success(" OTP sent! Check your email.");
      navigate("/verify-otp", {
        state: {
          email,
          isPasswordReset: true, // mark this as a reset flow
        },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send OTP";
      toast.error(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <h2>Forgot Password</h2>
      <p>Enter your school email to receive an OTP.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter school email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
