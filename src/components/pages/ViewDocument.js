import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./ViewDocument.css";
import { useMemo } from "react";
import { Rnd } from "react-rnd";
import { toast } from "react-toastify";

function ViewDocument() {
  const { id } = useParams();
  const { user, token, updateUser } = useAuth();
  const voteKey = useMemo(() => {
    if (user && id) {
      return `vote-${user._id}-${id}`;
    }
    return null;
  }, [user, id]);
  console.log("Loaded user:", user);
  console.log("Loaded token:", token);
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState(null); // "like", "dislike", or null
  const [removed, setRemoved] = useState(false);
  const [note, setNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const res = await axios.get(
          `${API_URL}/api/auth/document/${id}`,
          config
        );

        if (res.data.document && res.data.document.isActive === false) {
          setRemoved(true); // 👈 Inactive doc detected
          setDocument(res.data.document);
        } else {
          setDocument(res.data.document);
          setLikes(res.data.document.likes || 0);
          setDislikes(res.data.document.dislikes || 0);
        }

        if (voteKey) {
          const savedVote = localStorage.getItem(voteKey);
          if (savedVote) setUserVote(savedVote);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id, user, token, voteKey]);

  // Fetch note if user has 15+ uploads
  useEffect(() => {
    if (
      user &&
      user.uploadedDocuments &&
      user.uploadedDocuments.length >= 15 &&
      document
    ) {
      setNoteLoading(true);
      axios
        .get(`${API_URL}/api/notes/${document._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setNote(res.data.note?.content || "");
        })
        .catch(() => setNote(""))
        .finally(() => setNoteLoading(false));
    }
  }, [user, document, token]);

  useEffect(() => {
    if (user?.savedDocuments?.includes(id)) {
      setSaved(true);
    }
  }, [user, id]);

  const handleLike = async () => {
    if (!token) {
      navigate("/sign-up");
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (userVote === "like") {
        await axios.post(
          `${API_URL}/api/auth/document/${id}/remove-like`,
          {},
          config
        );
        setUserVote(null);
        if (voteKey) localStorage.removeItem(voteKey);
      } else {
        if (userVote === "dislike") {
          await axios.post(
            `${API_URL}/api/auth/document/${id}/remove-dislike`,
            {},
            config
          );
        }
        await axios.post(
          `${API_URL}/api/auth/document/${id}/like`,
          {},
          config
        );
        setUserVote("like");
        localStorage.setItem(voteKey, "like");
      }

      // 🆕 Fetch fresh document with updated like/dislike counts
      const res = await axios.get(
        `${API_URL}/api/auth/document/${id}`,
        config
      );
      setLikes(res.data.document.likes || 0);
      setDislikes(res.data.document.dislikes || 0);
    } catch (err) {
      console.error("Voting error:", err.response?.data || err);
      if (err.response?.status === 401) {
        console.error("Token expired or unauthorized. Logging out.");
        localStorage.removeItem("user");
        navigate("/sign-up");
      } else {
        console.error("Voting error:", err);
      }
    }
  };

  const handleDislike = async () => {
    if (!token) {
      navigate("/sign-up");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (userVote === "dislike") {
        await axios.post(
          `${API_URL}/api/auth/document/${id}/remove-dislike`,
          {},
          config
        );

        setUserVote(null);
        if (voteKey) {
          localStorage.removeItem(voteKey);
        }
      } else {
        if (userVote === "like") {
          await axios.post(
            `${API_URL}/api/auth/document/${id}/remove-like`,
            {},
            config
          );
        }
        await axios.post(
          `${API_URL}/api/auth/document/${id}/dislike`,
          {},
          config
        );
        setUserVote("dislike");
        localStorage.setItem(voteKey, "dislike");
      }
      const res = await axios.get(
        `${API_URL}/api/auth/document/${id}`,
        config
      );
      setLikes(res.data.document.likes || 0);
      setDislikes(res.data.document.dislikes || 0);
    } catch (err) {
      if (err.response?.status === 401) {
        console.error("Token expired or unauthorized. Logging out.");
        localStorage.removeItem("user");
        navigate("/sign-up");
      } else {
        console.error("Voting error:", err);
      }
    }
  };

  // const handleSummarize = async () => {
  //   setSummarizing(true);
  //   try {
  //     if (!document.text) {
  //       console.error("No document text found");
  //       return;
  //     }

  //     const res = await axios.post(
  //       `${API_URL}/api/auth/document/${document._id}/summarize`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setSummary(res.data.summary);
  //   } catch (err) {
  //     console.error("Error summarizing:", err);
  //   } finally {
  //     setSummarizing(false);
  //   }
  // };

  const handleNoteSave = async () => {
    setNoteSaved(false);
    try {
      await axios.post(
        `${API_URL}/api/notes/${document._id}`,
        { content: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 1500);
    } catch (err) {
      alert("Failed to save note.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!document) return <div>Document not found.</div>;
  if (removed) {
    return (
      <div className="removed-message">
        <h2>This document has been removed due to too many dislikes.</h2>
      </div>
    );
  }

  const handleSaveDocument = async () => {
    if (!user) {
      alert("You must be logged in to save documents.");
      navigate("/sign-up");
      return;
    }

    const alreadySaved = user.savedDocuments?.includes(id);

    try {
      const res = await fetch(
        `${API_URL}/api/auth/${
          alreadySaved ? "unsave" : "save"
        }/${id}`,
        {
          method: alreadySaved ? "DELETE" : "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        if (alreadySaved) {
          toast.info("Removed from My Documents");
          setSaved(false);
          updateUser({
            ...user,
            savedDocuments: user.savedDocuments.filter((docId) => docId !== id),
          });
        } else {
          toast.success("Saved to My Documents");
          setSaved(true);
          updateUser({
            ...user,
            savedDocuments: [...(user.savedDocuments || []), id],
          });
        }
      } else {
        toast.error("⚠️ Failed to update bookmark.");
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  return (
    <div className="view-doc-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      {user && (
        <button className="save-doc-button" onClick={handleSaveDocument}>
          {saved ? "Unsave Document" : "Save Document"}
        </button>
      )}
      <h2>{document.title}</h2>
      <p>
        <strong>Course:</strong> {document.courseCode}
      </p>
      <p>
        <strong>University:</strong> {document.university}
      </p>

      {user ? (
        <>
          <iframe
            src={`${API_URL}/api/auth/secure-file/${document.filename}`}
            title="PDF viewer"
            className="pdf-viewer"
            style={{
              width: "100%",
              height: "80vh",
              border: "none",
              marginTop: "1rem",
            }}
          />

          {/* ✅ Summarize Button and Output */}
          {/* <div className="summarize-section" style={{ marginTop: "2rem" }}>
            <button onClick={handleSummarize} disabled={summarizing}>
              {summarizing ? "Summarizing..." : "Summarize Notes"}
            </button>

            {summary.length > 0 && (
              <div className="summary-box" style={{ marginTop: "1rem" }}>
                <h4>Summary:</h4>
                <ul>
                  {summary.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div> */}

          {/* Feedback Section */}
          <div className="feedback-section">
            <p className="feedback-prompt">
              Like if you found the document useful!
            </p>
            <div className="feedback-buttons">
              <button
                onClick={handleLike}
                style={{
                  color: "green",
                  fontWeight: userVote === "like" ? "bold" : "normal",
                  opacity: userVote === "dislike" ? 0.4 : 1,
                }}
              >
                <i
                  className="fas fa-thumbs-up"
                  style={{ marginRight: "4px" }}
                ></i>{" "}
                {likes}
              </button>
              <button
                onClick={handleDislike}
                style={{
                  color: "red",
                  fontWeight: userVote === "dislike" ? "bold" : "normal",
                  opacity: userVote === "like" ? 0.4 : 1,
                }}
              >
                <i
                  className="fas fa-thumbs-down"
                  style={{ marginRight: "4px" }}
                ></i>{" "}
                {dislikes}
              </button>
            </div>
          </div>

          {/* Notepad Feature */}
          {user.uploadedDocuments && user.uploadedDocuments.length >= 15 && (
            <Rnd
              default={{
                x: 40,
                y: 120,
                width: 380,
                height: 260,
              }}
              minWidth={260}
              minHeight={160}
              bounds="window"
              className="notepad-rnd"
            >
              <div className="notepad-section floating-notepad">
                <div className="notepad-header">
                  📝 Notepad for this Document
                </div>
                {noteLoading ? (
                  <div>Loading your notes...</div>
                ) : (
                  <>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={8}
                      style={{
                        width: "100%",
                        height: "120px",
                        borderRadius: "8px",
                        padding: "1rem",
                        fontSize: "1.1rem",
                        marginBottom: "0.5rem",
                        resize: "none",
                      }}
                      placeholder="Write your notes for this document here..."
                    />
                    <button
                      onClick={handleNoteSave}
                      style={{
                        padding: "0.5rem 1.2rem",
                        borderRadius: "6px",
                        background: "#000000", // black background
                        color: "#ffffff", // white text
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Save Note
                    </button>
                    {noteSaved && (
                      <span style={{ color: "green", marginLeft: "1rem" }}>
                        Saved!
                      </span>
                    )}
                  </>
                )}
              </div>
            </Rnd>
          )}
          {user.uploadedDocuments && user.uploadedDocuments.length < 15 && (
            <div
              style={{
                marginTop: "2rem",
                background: "#ffecec",
                color: "#c0392b",
                padding: "1rem",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              Upload 15 documents to unlock the notepad feature!
            </div>
          )}
        </>
      ) : (
        <div className="blurred-doc">
          <img
            src={`${API_URL}/${document.thumbnail}`}
            alt="Preview"
            className="preview-thumb"
          />
          <div className="overlay">
            <p>
              Please{" "}
              <span
                className="signup-link"
                onClick={() => navigate("/sign-up")}
              >
                sign up
              </span>{" "}
              to view this document.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewDocument;
