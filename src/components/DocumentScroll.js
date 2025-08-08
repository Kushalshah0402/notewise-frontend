import "./Cards.css";
import CardItem from "./CardItem";

export default function DocumentScroll({ title, documents }) {
  return (
    <div className="cards__horizontal-container">
      <div className="section-header">
        <h2 className="section-header__title">{title}</h2>
        <div className="document-count">
          {documents.length} {documents.length === 1 ? "document" : "documents"}
        </div>
      </div>
      <div className="cards__horizontal-scroll">
        <ul className="cards__horizontal-items">
          {documents.map((doc) => (
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
              uploader={doc.uploadedBy}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
