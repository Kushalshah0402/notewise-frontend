import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReasonText, setOtherReasonText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const { user: currentUser, loading } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/auth/profile/${userId}`
        );
        setProfile(res.data.user);
        setDocuments(res.data.documents);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!loading && !currentUser) {
      toast.info("Please login to view profiles.");
      navigate("/");
    }
  }, [currentUser, loading, navigate]);

  const reportReasons = [
    { value: "Not their real photo", label: "Not their real photo", icon: "👤" },
    { value: "Inappropriate behavior", label: "Inappropriate behavior", icon: "⚠️" },
    { value: "Harassment or spam", label: "Harassment or spam", icon: "🚫" },
    { value: "Copyright violation", label: "Copyright violation", icon: "©️" },
    { value: "Other", label: "Other", icon: "💬" }
  ];

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      toast.warning("Please select a reason before submitting.");
      return;
    }

    if (selectedReason === "Other" && !otherReasonText.trim()) {
      toast.warning("Please describe the issue.");
      return;
    }

    setIsSubmittingReport(true);
    try {
      await axios.post(
        "http://localhost:5001/api/auth/report-user",
        {
          reportedUserId: profile._id,
          reportedUsername: profile.username,
          reason: selectedReason === "Other" ? otherReasonText : selectedReason,
        }
      );

      toast.success("Report submitted successfully. Thank you for helping keep our community safe.");
      setShowReportModal(false);
      setSelectedReason("");
      setOtherReasonText("");
    } catch (err) {
      toast.error("Failed to report user. Please try again later.");
      console.error("Report error:", err);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const closeModal = () => {
    setShowReportModal(false);
    setSelectedReason("");
    setOtherReasonText("");
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <i className="fa fa-exclamation-triangle" size={48} />
        <h2>Profile Not Found</h2>
        <p>The user profile you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="user-profile-container">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <img
              src={
                profile.avatar?.startsWith("http")
                  ? profile.avatar
                  : `http://localhost:5001${profile.avatar}`
              }
              alt={profile.username}
              className="profile-avatar-large"
            />
            <div className="profile-status-indicator"></div>
          </div>  
          <div className="profile-info">
            <div className="profile-name-section">
              <h1 className="profile-username">{profile?.username}</h1>
            </div>  
            <div className="profile-stats">
              <div className="stat-item">
                <i className="fa fa-file" size={24} />
                <span className="stat-number">{documents?.length}</span>
                <span className="stat-label">Documents</span>
              </div>
              <div className="stat-item">
                <i className="fa fa-thumbs-up" size={18} />
                <span className="stat-number">
                  {documents?.reduce((sum, doc) => sum + (doc.likes || 0), 0)}
                </span>
                <span className="stat-label">Total Likes</span>
              </div>
            </div>
            {currentUser && currentUser?._id !== profile._id && (
              <button
                className="report-user-button"
                onClick={() => setShowReportModal(true)}
              >
                <i className="fa fa-flag" size={16} />
                Report User
              </button>
            )}
          </div>
        </div>
        <div className="user-documents-section">
          <div className="section-header">
            <h2>
              <i className="fa fa-folder-open" size={24} />
              Documents ({documents.length})
            </h2>
          </div>
          {documents.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-folder-open" size={64} />
              <h3>No Documents Yet</h3>
              <p>This user hasn't uploaded any documents.</p>
            </div>
          ) : (
            <div className="document-grid">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="document-card"
                  onClick={() => navigate(`/document/${doc._id}`)}
                >
                  <div className="document-thumbnail-container">
                    <img
                      src={
                        doc.thumbnail?.startsWith("http")
                          ? doc.thumbnail
                          : `http://localhost:5001/${doc.thumbnail}`
                      }
                      alt={doc.title}
                      className="document-thumbnail"
                    />
                    <div className="document-overlay">
                      <div className="document-likes">
                        <span className="like-count">
                          <i className="fas fa-thumbs-up" size={12} />
                          {doc?.likes || 0}
                        </span>
                        <span className="dislike-count">
                          <i className="fas fa-thumbs-down" size={12} />
                          {doc?.dislikes || 0}
                        </span>
                      </div>
                    </div>
                  </div>        
                  <div className="document-info">
                    <h4 className="document-title">{doc?.title}</h4>
                    <p className="document-course">{doc?.courseCode}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-flag" size={20} />
                Report User: {profile?.username}
              </h3>
              <button className="close-button" onClick={closeModal}>
                <i className="fas fa-times" size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Help us keep the community safe by reporting inappropriate behavior.
              </p>
              <div className="reason-options">
                {reportReasons.map((reason) => (
                  <label key={reason.value} className="reason-option">
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    />
                    <div className="reason-content">
                      <span className="reason-icon">{reason.icon}</span>
                      <span className="reason-text">{reason.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              {selectedReason === "Other" && (
                <div className="other-reason-section">
                  <label htmlFor="other-reason">Please describe the issue:</label>
                  <textarea
                    id="other-reason"
                    rows={4}
                    placeholder="Provide details about the issue..."
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    maxLength={500}
                  />
                  <div className="char-count">
                    {otherReasonText.length}/500
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="report-submit-button"
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? (
                  <>
                    <div className="button-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="submit-icon" size={16} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}