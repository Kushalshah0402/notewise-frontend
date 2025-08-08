import React, { useState } from "react";
import styles from "./Faq.module.css";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqList = [
    {
      question: "📚 What is Notewise?",
      answer:
        "Notewise is a platform for university students to upload, access, and collaborate on academic notes and documents, completely free.",
    },
    {
      question: "📝 Do I need to upload documents to use the site?",
      answer:
        "Nope! You can freely access and download materials without uploading anything. However, uploading helps the community and boosts your credibility.",
    },
    {
      question: "👤 Why do I need to upload my student ID photo?",
      answer:
        "This helps us verify that you're a genuine student and keeps our platform high-quality and trustworthy. Your photo will be used as your profile picture.",
    },
    {
      question: "🔒 Who can see my uploaded documents?",
      answer:
        "All logged-in users can view and download documents. Your username and profile photo will be shown as the uploader.",
    },
    {
      question: "✏️ Can I delete my documents?",
      answer:
        'Yes! Go to "My Profile" and you\'ll have options to manage or delete your uploads anytime.',
    },
    {
      question: "❓ What if I can’t find documents for my module?",
      answer:
        "We're still growing! Consider uploading if you have notes, or invite peers to contribute. You can also request documents for specific modules soon!",
    },
    {
      question: "📬 How do I contact support?",
      answer:
        "Drop us an email at contact.notewise@gmail.com — we’ll get back to you as soon as possible!",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Frequently Asked Questions</h1>
      {faqList.map((faq, index) => (
        <div
          className={`${styles.faqItem} ${
            openIndex === index ? styles.open : ""
          }`}
          key={index}
        >
          <h3
            className={styles.question}
            onClick={() => toggle(index)}
            style={{ cursor: "pointer" }}
          >
            {faq.question} <span>{openIndex === index ? "−" : "+"}</span>
          </h3>
          {openIndex === index && (
            <p className={styles.answer}>{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
