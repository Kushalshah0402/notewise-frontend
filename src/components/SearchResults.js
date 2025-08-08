import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./SearchResults.css";
import { useAuth } from "./AuthContext";
import Fuse from "fuse.js";
import CardItem from "./CardItem";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Expand common abbreviations and synonyms
function normalizeTerm(term) {
  const map = {
    tut: "tutorial",
    tutorial: "tutorial",
    soln: "solution",
    solution: "solution",
    lec: "lecture",
    lecture: "lecture",
    midterm: "midterm",
    finals: "final",
    final: "final",
  };
  return map[term] || term;
}

function SearchResults() {
  const query = useQuery().get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  useAuth();

  useEffect(() => {
    if (!query) return;

    const fetchAndSearch = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/auth/documents");
        if (!res.data.success) throw new Error("Failed to load documents");

        const allDocs = res.data.documents;

        const enrichedDocs = allDocs.map((doc) => {
          const rawText = `${doc.courseCode || ""} ${doc.title || ""} ${
            doc.year || ""
          }`.toLowerCase();
          const normalizedWords = rawText
            .split(/\s+/)
            .map(normalizeTerm)
            .join(" ");
          return {
            ...doc,
            searchText: `${rawText} ${normalizedWords}`, // original + expanded
          };
        });

        const fuse = new Fuse(enrichedDocs, {
          keys: ["searchText"],
          threshold: 0.4,
          ignoreLocation: true,
          minMatchCharLength: 2,
          useExtendedSearch: true,
        });

        const terms = query.toLowerCase().split(/\s+/).map(normalizeTerm);
        const pattern = terms.map((term) => `'${term}`).join(" ");

        const fuzzyResults = fuse.search(pattern);
        const matchedDocs = fuzzyResults.map((r) => r.item);

        setResults(matchedDocs);
      } catch (err) {
        console.error("Fuzzy search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSearch();
  }, [query]);

  return (
    <div className="search-results-page">
      <h2 className="search-results-title">Results for "{query}"</h2>
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <div
          className={`cards__items ${results.length < 4 ? "few-results" : ""}`}
        >
          {results.map((doc) => (
            <CardItem
              key={doc._id}
              thumbnail={doc.thumbnail}
              text={doc.title}
              label={doc.courseCode}
              id={doc._id}
              likes={doc.likes}
              dislikes={doc.dislikes}
              uploader={doc.uploader}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
