import React, { useState } from "react";
import "../../App.css";
import "./SignUp.css";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    idCard: null,
  });
  const API_URL = process.env.REACT_APP_API_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    setFormData((prev) => ({ ...prev, [name]: file }));

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreviewUrl(previewUrl);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isAllowedEmail = (email) =>
      /@(?:u\.nus\.edu|smu\.edu\.sg|e\.ntu\.edu\.sg)$/i.test(email);

    if (!isAllowedEmail(formData.email)) {
      toast.error("❌ Only NUS, SMU, or NTU student emails are accepted.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.username);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      formPayload.append("idCard", formData.idCard);

      const response = await axios.post(
        "${API_URL}/api/auth/register",
        formPayload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Registered:", response.data);
      navigate("/verify-otp", {
        state: { email: formData.email, password: formData.password },
      });
    } catch (error) {
      const msg = error?.response?.data?.message;

      if (msg === "User already exists") {
        toast.warning("⚠️ An account with this email already exists.");
      } else if (
        msg ===
        "Face not detected. Please upload a clearer image of your ID card."
      ) {
        toast.error("❌ Face not detected. Please upload a clearer image.");
      } else {
        toast.error("❌ Registration failed. Please try again.");
      }

      console.error(
        "❌ Registration error:",
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("signup");
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: loginEmail,
          password: loginPassword,
        },
        { withCredentials: true }
      );

      // ✅ Check if email is verified before navigating
      if (!res.data.user.emailVerified) {
        navigate("/verify-otp", {
          state: { email: loginEmail, password: loginPassword },
        });
      } else {
        login(res.data.user, res.data.token); // store token & user
        navigate("/");
      }
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.reason === "suspended"
      ) {
        setLoginError(
          "Your account is suspended. Contact notewise@gmail.com for assistance"
        );
        return;
      }
      setLoginError("Invalid email or password.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-left">
        <h1 className="notewise-logo">NoteWise</h1>
      </div>

      <div className="signup-right">
        <div className="tab-switcher">
          <button
            className={`tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Create Account
          </button>
          <button
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
        </div>
        {activeTab === "signup" && (
          <form className="signup-form" onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <input
              type="email"
              name="email"
              placeholder="School Email Only"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoComplete="new-username"
            />
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="new-password"
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </span>
            </div>
            <div className="upload-id-box">
              <label className="upload-label" htmlFor="idUpload">
                Upload School ID Card 
              </label>
              <label htmlFor="idUpload" className="upload-button">
                <i className="fas fa-upload" /> Choose Image
              </label>
              <input
                type="file"
                name="idCard"
                id="idUpload"
                accept="image/*"
                onChange={handleFileChange}
                required
                autoComplete="off"
              />
              {formData.idCard && (
                <p className="file-name">📎 {formData.idCard.name}</p>
              )}
              <p className="disclaimer">
                📌 Your uploaded school card will appear next to your documents.
              </p>
              {avatarPreviewUrl && (
                <div className="avatar-preview-section">
                  <p className="avatar-preview-warning">
                    <strong>
                      Your face on the card will be used as your profile
                      picture just for credibility of documents uploaded
                    </strong>
                    <br />
                    Please ensure the image clearly shows <em>your own face</em>
                    .
                  </p>
                  {/* Uncomment to show image preview */}
                  {/* <img
        src={avatarPreviewUrl}
        alt="Avatar Preview"
        className="avatar-preview-img"
      /> */}
                </div>
              )}
            </div>
            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                required
              />
              <label htmlFor="terms">
                I accept&nbsp;
                <span
                  className="link-text"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms of Service
                </span>
                &nbsp; and&nbsp;
                <span
                  className="link-text"
                  onClick={() => setShowPrivacyModal(true)}
                >
                  Privacy Policy
                </span>
              </label>
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={!acceptedTerms || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" /> Authenticating...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        )}

        {activeTab === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login</h2>

            <input
              type="email"
              name="loginEmail"
              placeholder="School Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="login-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="loginPassword"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <span
                className="toggle-login-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </span>
            </div>
            <div className="login-options">
              <label className="remember-me-label">
                <input type="checkbox" /> Remember me
              </label>
              <button
                className="forgot-password"
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
            {loginError && <p className="login-error">{loginError}</p>}
            {/* reCAPTCHA placeholder (implement with actual reCAPTCHA later)*/}
            {/* <div className="recaptcha-box">
              [I'm not a robot CAPTCHA placeholder]
            </div> */}
            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
        )}
        {showTermsModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowTermsModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Terms of Service</h2>
              <p>
                Welcome to NoteWise! By using our platform, you agree not to
                upload inappropriate content and understand that NoteWise is not
                liable for the accuracy or legality of user-contributed
                material.
              </p>
              <button onClick={() => setShowTermsModal(false)}>Close</button>
            </div>
          </div>
        )}

        {showPrivacyModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowPrivacyModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Privacy Policy</h2>
              <p>
                Your email and ID card image will be stored securely and only
                used for verifying your school identity and displaying next to
                uploaded documents. We do not share your information with third
                parties.
              </p>
              <button onClick={() => setShowPrivacyModal(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
