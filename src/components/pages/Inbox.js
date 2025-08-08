import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./Inbox.css";

function Inbox() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/api/messages/inbox`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to load inbox", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchMessages();
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await axios.post(
        `${API_URL}/api/messages/mark-read/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, read: true } : m))
      );
    } catch (err) {
      console.error("Could not mark message as read", err);
    }
  };

  const unreadCount = messages.filter((msg) => !msg.read).length;

  if (loading) {
    return (
      <div className="inbox-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h1 className="inbox-title">
          <span className="inbox-icon">
            <i className="fas fa-inbox"></i>
          </span>
          Inbox
        </h1>
        <div className="inbox-stats">
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
          <span className="total-count">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
      </div>

      <div className="inbox-content">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Messages</h3>
            <p>Your inbox is empty. New messages will appear here.</p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message-item ${msg.read ? "read" : "unread"}`}
                onClick={() => !msg.read && markAsRead(msg._id)}
              >
                <div className="message-indicator">
                  {!msg.read && <span className="unread-dot"></span>}
                </div>

                <div className="message-content">
                  <div className="message-header">
                    <h4 className="message-title">{msg.title}</h4>
                    <span className="message-date">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="message-body">{msg.body}</p>

                  {!msg.read && (
                    <div className="message-actions">
                      <span className="mark-read-hint">
                        Click to mark as read
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;
