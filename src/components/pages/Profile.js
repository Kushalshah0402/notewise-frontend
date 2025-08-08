import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import "./Profile.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState("");

  const [preview, setPreview] = useState(null);
  const [myDocuments, setMyDocuments] = useState([]);
  const [idCard, setIdCard] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setPreview(
        user.avatar
          ? `http://localhost:5001${user.avatar}`
          : "/images/avatar.png"
      );

      // Fetch user documents
      const fetchDocs = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5001/api/auth/documents/user/${user._id}`
          );
          console.log("📦 Documents response:", res.data);
          if (res.data.success) {
            setMyDocuments(res.data.documents);
          }
        } catch (err) {
          console.error("Failed to load documents", err);
        }
      };

      fetchDocs();
    } else {
      console.log("🚫 No user available in AuthContext");
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setIdCard(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation
    if (!username.trim()) {
      toast.error("Username and email are required.");
      return;
    }

    // Prepare form data or object for updating
    const formData = new FormData();
    formData.append("username", username);
    if (idCard) formData.append("idCard", idCard); // Upload ID card

    try {
      await updateProfile({ username, idCard });
      // Backend should accept multipart/form-data
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    }
  };

  const deleteDocument = async (docId) => {
    try {
      await axios.delete(`http://localhost:5001/api/auth/documents/${docId}`);
      setMyDocuments((prev) => prev.filter((doc) => doc._id !== docId));
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-form-card">
          <div className="avatar-section">
            <div className="avatar-container">
              <img src={preview} alt="Profile" className="profile-avatar" />
              <label className="avatar-upload">
                <i className="fas fa-camera camera-icon"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Click the camera to change avatar. If face not detected on card,
              it will revert back
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-user" style={{ marginRight: "6px" }}></i>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <button onClick={handleSubmit} className="save-btn">
            <>
              <i className="fas fa-save"></i>
              Save Changes
            </>
          </button>
        </div>
        <div className="documents-card">
          <div className="documents-header">
            <h2 className="documents-title">
              <i className="fas fa-file-alt"></i>
              Your Documents
            </h2>
            <span className="document-count">
              {myDocuments?.length} documents
            </span>
          </div>
          {myDocuments?.length > 0 ? (
            <div className="documents-grid">
              {myDocuments?.map((doc) => (
                <div
                  key={doc._id}
                  className="document-card"
                  onClick={() => navigate(`/document/${doc._id}`)}
                >
                  <img
                    src={
                      doc.thumbnail?.startsWith("http")
                        ? doc.thumbnail
                        : `http://localhost:5001/${doc.thumbnail}`
                    }
                    alt={doc?.title}
                    className="document-thumbnail"
                  />
                  <div className="document-info">
                    <h3 className="document-title">{doc?.title}</h3>
                    <p className="document-course">{doc?.courseCode}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc?._id);
                    }}
                    className="delete-btn"
                  >
                    <i className="fas fa-trash trash-icon"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-upload"></i>
              </div>
              <h3 className="empty-title">No documents yet</h3>
              <p className="empty-text">
                Upload your first document to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
