import React, { useState } from "react";
import axios from "axios";
import "./ResetPassword.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error("❌ Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        newPassword: password,
      });

      toast.success(" Password reset successfully! Please log in.");
      navigate("/signup", { state: { activeTab: "login" } });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reset password";
      toast.error(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reset-password-page">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <i
              className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
            ></i>
          </span>
        </div>

        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            className="toggle-password"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            <i
              className={`fa-solid ${
                showConfirmPassword ? "fa-eye-slash" : "fa-eye"
              }`}
            ></i>
          </span>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
