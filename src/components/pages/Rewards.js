// src/pages/Rewards.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";
import "./Rewards.css";
import { Link } from "react-router-dom";

function Rewards() {
  const [books, setBooks] = useState([]);
  const { user, token, updateUser, loading } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/rewards/books", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setBooks(res.data.books);
      } catch (err) {
        toast.error("Failed to fetch books.");
        console.error("Book fetch error:", err);
      }
    };
    if (loading) return;
    if (user) fetchBooks();
  }, [user, token, loading]);

  const handleRedeem = async (bookId) => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/rewards/redeem",
        { bookId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      // ✅ fetch updated user with ownedBooks + points
      const refreshed = await axios.get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      updateUser(refreshed.data.user); // replaces stale state
    } catch (err) {
      const msg =
        err.response?.data?.message || "Redemption failed, try again.";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="rewards-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      <div className="rewards-header">
        <div className="header-content">
          <h1 className="rewards-title">
            <i className="fas fa-gift"></i>
            Book Shop Rewards
          </h1>
          <p className="rewards-subtitle">
            Discover premium books and unlock them with your points
          </p>
        </div>
        
        <div className="points-display">
          <div className="points-card">
            <div className="points-icon">
              <i className="fas fa-coins"></i>
            </div>
            <div className="points-info">
              <span className="points-label">Your Points</span>
              <span className="points-value">{user?.points || 0}</span>

            </div>
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No books available</h3>
          <p>Check back later for new rewards!</p>
        </div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-image-container">
                <img 
                  className="book-image" 
                  src={book.cover} 
                  alt={book.title}
                  loading="lazy"
                />
                {user?.ownedBooks?.includes(book.id) && (
                  <div className="owned-badge">
                    <i className="fas fa-check"></i>
                    Owned
                  </div>
                )}
              </div>
              
              <div className="book-content">
                <div className="book-header">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                </div>
                
                <p className="book-description">{book.description}</p>
                
                {book.website && (
                  <a 
                    href={book.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="book-website"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Visit Website
                  </a>
                )}
                
                <div className="book-footer">
                  <div className="price-tag">
                    <i className="fas fa-coins"></i>
                    <span className="price-value">{book.price}</span>
                    <span className="price-label">points</span>
                  </div>
                  
                  <div className="book-actions">
                    {user?.ownedBooks?.includes(book.id) ? (
                      <Link
                        to={`/reader/${book.pdf.split("/").pop()}`}
                        className="btn btn-success"
                      >
                        <i className="fas fa-book-reader"></i>
                        Read Now
                      </Link>
                    ) : (
                      <button
                        className={`btn ${
                          user?.points >= book.price ? 'btn-primary' : 'btn-disabled'
                        }`}
                        onClick={() => {
                          if (user?.points >= book.price) {
                            handleRedeem(book.id);
                          } else {
                            toast.info(
                              "Earn more points by uploading your documents."
                            );
                          }
                        }}
                        disabled={user?.points < book.price}
                      >
                        <i className="fas fa-unlock"></i>
                        {user?.points >= book.price ? 'Unlock Book' : 'Insufficient Points'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="earn-points-cta">
        <div className="cta-content">
          <h3>Need More Points?</h3>
          <p>Upload your documents to earn points and unlock more books!</p>
          <Link to="/upload" className="btn btn-outline">
            <i className="fas fa-upload"></i>
            Start Uploading
          </Link>
        </div>
      </div>
      <div className="more-coming">
        <p>📚 More books coming soon. Stay tuned!</p>
      </div>
    </div>
  );
}

export default Rewards;