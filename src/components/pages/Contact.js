import React from "react";
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>
        For any inquiries or issues, feel free to email us at:{" "}
        <a href="mailto:notewise.sg@gmail.com">notewise.sg@gmail.com</a>
      </p>
      <p>
        You can also click on <strong>"Report Problem"</strong> or{" "}
        <strong>"Submit Feedback"</strong> using the link at the footer of the
        homepage.
      </p>
    </div>
  );
}
