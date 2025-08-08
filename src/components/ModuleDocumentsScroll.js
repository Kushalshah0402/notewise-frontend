// components/ModuleDocumentsScroll.js
import React from "react";
import "./Cards.css";
import CardItem from "./CardItem";

export default function ModuleDocumentsScroll({ grouped }) {

  return (
    <>
      {grouped.map((group) => (
        <div className="cards__horizontal-container">
          <div className="section-header">
            <h2 className="section-header__title">{group?.courseCode}</h2>
            <div className="document-count">
              {group.documents.length}{" "}
              {group.documents.length === 1 ? "document" : "documents"}
            </div>
          </div>
          <div className="cards__horizontal-scroll">
            <ul className="cards__horizontal-items">
              {group.documents.map((doc) => (
                <CardItem
                  key={doc._id}
                  thumbnail={
                    doc.thumbnail?.replace("\\", "/") || "default-thumb.jpg"
                  }
                  text={doc.title || "Untitled Document"}
                  label={doc.courseCode || "Document"}
                  id={doc._id}
                  likes={doc.likes || 0}
                  dislikes={doc.dislikes || 0}
                  uploader={doc.uploader}
                />
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  );
}
