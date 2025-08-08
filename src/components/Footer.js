import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer-container">
      <section className="footer-subscription">
        <h2 className="footer-subscription-heading">
          Stay Connected with NoteWise
        </h2>
        <p className="footer-subscription-text">
          Join students accessing quality study materials and academic resources.
        </p>
      </section>
      <div className="footer-links">
        <div className="footer-link-wrapper">
          <div className="footer-link-items">
            <h2>Company</h2>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            {/* <Link to="/careers">Careers</Link>
            <Link to="/blog">Blog</Link> */}
          </div>
          <div className="footer-link-items">
            <h2>Resources</h2>
            <Link to="/upload">Upload Notes</Link>
            <Link to="/feedback">Feedback</Link>
            <Link to="/feedback">Report a Problem</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          <div className="footer-link-items">
            <h2>Legal</h2>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            {/* <Link to="/cookies">Cookie Policy</Link>
            <Link to="/guidelines">Community Guidelines</Link> */}
          </div>
        </div>
      </div>
      <section className="social-media">
        <div className="social-media-wrap">
          <div className="footer-logo">
            <Link to="/" className="social-logo">
              NoteWise
              <i className="fas fa-book" />
            </Link>
          </div>
          <small className="website-rights">
            © {new Date().getFullYear()} NoteWise. All rights reserved.
          </small>
        </div>
      </section>
    </div>
  );
}

export default Footer;