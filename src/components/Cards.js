// components/AllDocuments.js
import React, { useEffect, useState } from "react";
import "./Cards.css";
import { useAuth } from "./AuthContext";
import ModuleDocumentsScroll from "./ModuleDocumentsScroll";
import DocumentScroll from "./DocumentScroll";

export default function Cards({ refreshTrigger }) {
  const { user, token, updateUser } = useAuth();
  const [userModulesDocs, setUserModulesDocs] = useState([]);
  const [mostLikedDocs, setMostLikedDocs] = useState([]);
  const [newestDocs, setNewestDocs] = useState([]);
  const [recentlyViewedDocs, setRecentlyViewedDocs] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;



  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docRes = await fetch(`${API_URL}/api/auth/documents`);
        const docData = await docRes.json();
        if (!docData.success) return;
        const allDocs = docData.documents;

        let grouped = [];

        if (user && token) {
          const modules = user?.currentModules || [];

          grouped = modules
            .map((mod) => {
              const modDocs = allDocs.filter(
                (doc) =>
                  doc.courseCode?.toUpperCase().trim() ===
                  mod.toUpperCase().trim()
              );
              return modDocs.length > 0
                ? { courseCode: mod.trim().toUpperCase(), documents: modDocs }
                : null;
            })
            .filter(Boolean);
        }

        setUserModulesDocs(grouped);

        const likedRes = await fetch(
          `${API_URL}/api/auth/documents/most-liked`
        );
        const likedData = await likedRes.json();
        if (likedData.success) setMostLikedDocs(likedData.documents);

        const newestRes = await fetch(
          `${API_URL}/api/auth/documents/newest`
        );
        const newestData = await newestRes.json();

        if (user && token) {
          const recentRes = await fetch(
            `${API_URL}/api/auth/documents/recently-viewed`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const recentData = await recentRes.json();
          if (recentData.success) setRecentlyViewedDocs(recentData.documents);
        }

        if (newestData.success) setNewestDocs(newestData.documents);
      } catch (err) {
        console.error("Failed to load documents", err);
      }
    };

    fetchDocs();
  }, [refreshTrigger, user, token, updateUser]);

  return (
    <div className="cards">
      {/* Horizontal scrolls by module */}
      {user && userModulesDocs.length > 0 && (
        <ModuleDocumentsScroll grouped={userModulesDocs} />
      )}

      {mostLikedDocs.length > 0 && (
        <DocumentScroll
          title="Most Liked Documents"
          documents={mostLikedDocs}
        />
      )}

      {recentlyViewedDocs.length > 0 && (
        <DocumentScroll
          title="Recently Viewed"
          documents={recentlyViewedDocs}
        />
      )}

      {newestDocs.length > 0 && (
        <DocumentScroll title="Newest Uploads" documents={newestDocs} />
      )}
    </div>
  );
}
