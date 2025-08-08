import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VerifyOTP.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email;
  const isPasswordReset = location.state?.isPasswordReset || false;
  const passwordFromSignup = location.state?.password;

  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(120);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    let interval = null;
    if (timerActive && cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, cooldown]);

  const handleVerify = async () => {
    try {
      if (isPasswordReset) {
        // Password reset flow
        await axios.post("http://localhost:5001/api/auth/verify-reset-otp", {
          email,
          otp,
        });
        toast.success("✅ OTP verified! Please reset your password.");
        navigate("/reset-password", { state: { email } });
      } else {
        // Signup flow
        await axios.post("http://localhost:5001/api/auth/verify-otp", {
          email,
          otp,
        });

        toast.success("✅ Email verified! You can now login.");
        const res = await axios.post(
          "http://localhost:5001/api/auth/login",
          {
            email,
            password: passwordFromSignup,
          },
          { withCredentials: true }
        );

        login(res.data.user, res.data.token);
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "❌ OTP verification failed";
      if (msg.toLowerCase().includes("expired")) {
        setResendStatus("Your OTP has expired. Please resend a new one.");
      }
      toast.error(msg);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const endpoint = isPasswordReset
        ? "http://localhost:5001/api/auth/resend-reset-otp"
        : "http://localhost:5001/api/auth/resend-otp";

      const res = await axios.post(endpoint, { email });
      toast.success(res.data.message || "OTP resent successfully");
      setResendStatus("A new OTP has been sent to your email.");
      setCooldown(120);
      setTimerActive(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
      setResendStatus("Something went wrong. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <h2>
        {isPasswordReset ? "Reset Password Verification" : "Email Verification"}
      </h2>
      <p>
        Enter the OTP sent to: <strong>{email}</strong>
      </p>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        placeholder="Enter 6-digit OTP"
      />
      <button onClick={handleVerify}>Verify</button>

      <p style={{ marginTop: "1rem" }}>
        Didn’t receive the code?{" "}
        <button onClick={handleResendOTP} disabled={resending || timerActive}>
          {timerActive
            ? `Resend OTP in ${Math.floor(cooldown / 60)}:${(cooldown % 60)
                .toString()
                .padStart(2, "0")}`
            : resending
            ? "Resending..."
            : "Resend OTP"}
        </button>
      </p>
      {resendStatus && <p className="otp-resend-status">{resendStatus}</p>}
    </div>
  );
}
