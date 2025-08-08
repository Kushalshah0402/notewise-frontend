import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import { useAuth } from "./AuthContext";

function Navbar() {
  const { user, logout, unseenWarnings, unseenInbox } = useAuth();
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;


  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const navigate = useNavigate();

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  React.useEffect(() => {
    showButton();
    window.addEventListener("resize", showButton);
    return () => window.removeEventListener("resize", showButton);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      searchRef.current?.blur();
    }
  };

  const totalNotifications = unseenWarnings + unseenInbox;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <div className="logo-content">
              <span className="logo-text">NoteWise</span>
              <i className="fas fa-book logo-icon"></i>
            </div>
          </Link>
          <div
            className={`search-container ${isSearchFocused ? "focused" : ""}`}
          >
            <div className="search-wrapper">
              <i className="fas fa-search search-icon-left"></i>
              <input
                ref={searchRef}
                type="text"
                className="search-input"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="search-clear"
                  type="button"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"} />
          </div>

          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                <i className="fas fa-home nav-icon"></i>
                <span>Home</span>
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link
                    to="/my-documents"
                    className="nav-links"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-folder nav-icon"></i>
                    <span>My Documents</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/upload"
                    className="nav-links"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-upload nav-icon"></i>
                    <span>Upload</span>
                  </Link>
                </li>
                <li className="nav-links-mobile">
                  <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                    <i className="fas fas fa-user nav-icon"></i>
                    <span>My Profile</span>
                  </Link>
                </li>
                <li className="nav-links-mobile">
                  <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                    <i className="fas fa-exclamation-triangle nav-icon"></i>
                    <span>Warnings</span>
                  </Link>
                </li>
                <li className="nav-links-mobile">
                  <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                    <i className="fas fa-inbox nav-icon"></i>
                    <span>Inbox</span>
                  </Link>
                </li>
                {user?.role === "admin" && (
                  <li className="nav-links-mobile">
                    <Link to="/admin/broadcast" className="nav-links">
                      <i className="fas fa-bullhorn nav-icon"></i>
                      <span>Broadcast Message</span>
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    to="/rewards"
                    className="nav-links"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-gift nav-icon"></i>
                    Rewards {user?.points !== undefined && `(${user.points})`}
                  </Link>
                </li>
                <li className="nav-links-mobile">
                  <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                    <i className="fas fa-sign-out-alt nav-icon"></i>
                    <span>Logout</span>
                  </Link>
                </li>
              </>
            )}
            {user && (
              <li
                className="nav-item avatar-dropdown"
                ref={dropdownRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="avatar-wrapper">
                  <img
                    src={
                      typeof user?.avatar === "string" &&
                      user.avatar.startsWith("/uploads")
                        ? `${API_URL}${user.avatar}`
                        : "/images/avatar.png"
                    }
                    alt="User Avatar"
                    className="avatar-img"
                  />
                  {totalNotifications > 0 && (
                    <span className="notification-badge">
                      {totalNotifications > 99 ? "99+" : totalNotifications}
                    </span>
                  )}
                  <div className="avatar-ring"></div>
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <img
                          src={
                            typeof user?.avatar === "string" &&
                            user.avatar.startsWith("/uploads")
                              ? `${API_URL}${user.avatar}`
                              : "/images/avatar.png"
                          }
                          alt="User Avatar"
                          className="dropdown-avatar"
                        />
                        <div className="user-details">
                          <span className="user-name">
                            {user?.username || "User"}
                          </span>
                          <span className="user-email">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <i className="fas fa-user dropdown-icon"></i>
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/warnings"
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <i className="fas fa-exclamation-triangle dropdown-icon"></i>
                      <span>Warnings</span>
                      {unseenWarnings > 0 && (
                        <span className="item-badge">{unseenWarnings}</span>
                      )}
                    </Link>
                    <Link
                      to="/inbox"
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <i className="fas fa-inbox dropdown-icon"></i>
                      <span>Inbox</span>
                      {unseenInbox > 0 && (
                        <span className="item-badge">{unseenInbox}</span>
                      )}
                    </Link>
                    {user?.role === "admin" && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link
                          to="/admin/broadcast"
                          className="dropdown-item admin-item"
                        >
                          <i className="fas fa-bullhorn dropdown-icon"></i>
                          <span>Broadcast Message</span>
                        </Link>
                      </>
                    )}
                    <button
                      className="dropdown-item logout-item"
                      onClick={() => {
                        logout("sign-up");
                        setDropdownOpen(false);
                        closeMobileMenu();
                      }}
                    >
                      <i className="fas fa-sign-out-alt dropdown-icon"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </li>
            )}
            {!user && (
              <li className="nav-item">
                <Link
                  to="/sign-up"
                  className="nav-links-mobile"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </li>
            )}
            {button && !user && (
              <Link to="/sign-up" className="btn-signup">
                <span>Sign Up</span>
                <i className="fas fa-arrow-right"></i>
              </Link>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
