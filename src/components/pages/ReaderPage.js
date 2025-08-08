import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { useAuth } from "../AuthContext";
import axios from "axios";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./ReaderPage.css";
import { toast } from "react-toastify";

pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;

const filenameToId = {
  "Sivers-Anything_You_Want.pdf": 1,
  "Sivers-Your_Music_and_People.pdf": 2,
  "Sivers-Hell_Yeah_or_No.pdf": 3,
  "Sivers-How_to_Live.pdf": 4,
  "Sivers-Useful_Not_True.pdf": 5,
};

function ReaderPage() {
  const { filename } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ownedBooks, token } = user || {};

  const [fileData, setFileData] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const bookmarkKey = `bookmark-${filename}`;
  const pageRefs = useRef({});

  useEffect(() => {
    const bookId = filenameToId[filename];
    if (!bookId || !ownedBooks?.includes(bookId)) {
      navigate("/rewards");
      return;
    }

    let objectUrl;

    axios
      .get(`http://localhost:5001/api/books/secure-book/${filename}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setFileData(objectUrl);
      })
      .catch((err) => {
        console.error("Error fetching PDF:", err);
        navigate("/rewards");
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename, navigate, ownedBooks, token]);

  const handleDocumentLoad = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSetBookmark = () => {
    const scrollY = window.scrollY;
    const closestPage = Object.entries(pageRefs.current).reduce(
      (closest, [pageNum, ref]) => {
        if (!ref) return closest;
        const offset = Math.abs(ref.offsetTop - scrollY);
        return offset < closest.offset ? { pageNum, offset } : closest;
      },
      { pageNum: "1", offset: Infinity }
    );
    localStorage.setItem(bookmarkKey, closestPage.pageNum);
    toast.success(`✅ Bookmark set to page ${closestPage.pageNum}`);
  };

  const handleGoToBookmark = () => {
    const bookmarked = localStorage.getItem(bookmarkKey);
    if (bookmarked) {
      const ref = pageRefs.current[bookmarked];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="reader-wrapper">
      {fileData && (
        <>
          <div className="bookmark-controls">
            <button
              onClick={handleSetBookmark}
              className="bookmark-button set-bookmark-button"
            >
              ✅ Set Bookmark
            </button>
            <button onClick={handleGoToBookmark} className="bookmark-button">
              📌 Go to Bookmark
            </button>
          </div>
          <div className="pdf-scroll-container">
            <Document file={fileData} onLoadSuccess={handleDocumentLoad}>
              {Array.from({ length: numPages }, (_, i) => (
                <div
                  key={`page_${i + 1}`}
                  ref={(el) => (pageRefs.current[i + 1] = el)}
                >
                  <Page pageNumber={i + 1} width={800} className="pdf-page" />
                </div>
              ))}
            </Document>
          </div>
        </>
      )}
    </div>
  );
}

export default ReaderPage;
