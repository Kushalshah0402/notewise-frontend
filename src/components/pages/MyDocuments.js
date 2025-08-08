import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./MyDocuments.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CardItem from "../CardItem";

export default function MyDocuments() {
  const { user, token, loading } = useAuth();
  const [groupedDocs, setGroupedDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchSavedDocs = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/auth/my-documents`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setGroupedDocs(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load saved documents");
      } finally {
        setIsLoading(false);
      }
    };

    if (loading) return;

    if (user) {
      fetchSavedDocs();
    } else {
      navigate("/sign-up");
    }
  }, [user, token, navigate, loading]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-documents-page">
      <div className="my-documents-container">
        <div className="page-header">
          <div className="header-icon">
            <i className="fas fa-book-open"></i>
          </div>
          <h1 className="page-title">My Saved Documents</h1>
          <p className="page-subtitle">
            Access your curated collection of saved documents, organized by
            course for easy reference.
          </p>
        </div>
        {groupedDocs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h3 className="empty-title">No saved documents yet</h3>
            <p className="empty-description">
              Start building your personal library by saving documents from your
              courses. They'll appear here for quick access anytime.
            </p>
            <button onClick={() => navigate("/browse")} className="browse-btn">
              <i className="fas fa-file-text"></i>
              Browse Documents
            </button>
          </div>
        ) : (
          <div className="documents-section">
            {groupedDocs?.map((group) => (
              <div key={group.courseCode} className="course-group">
                <div className="course-header">
                  <div className="course-info">
                    <h2 className="course-title">{group?.courseCode}</h2>
                    <p className="course-count">
                      {group?.documents?.length} document
                      {group?.documents?.length !== 1 ? "s" : ""} saved
                    </p>
                  </div>
                  <div className="course-icon">
                    <i className="fas fa-book-open"></i>
                  </div>
                </div>
                <div className="documents-grid">
                  {group?.documents.map((doc) => (
                    <CardItem
                      key={doc._id}
                      thumbnail={
                        doc.thumbnailUrl?.replace("\\", "/") || "default-thumb.jpg"
                      }
                      text={doc.title || "Untitled Document"}
                      label={doc.courseCode || "Document"}
                      id={doc._id}
                      likes={doc.likes || 0}
                      dislikes={doc.dislikes || 0}
                      uploader={doc.uploader}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
