import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./CardItem.css";
// import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function CardItem({
  thumbnail,
  text,
  label,
  id,
  likes = 0,
  dislikes = 0,
  // isUserModule = false,
  uploader,
}) {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.savedDocuments?.includes(id)) {
      setSaved(true);
    }
  }, [user, id]);

  const handleClick = (e) => {
    if (e.target.closest(".save-icon")) return;

    if (!user) {
      alert("Please sign up or log in to view this document.");
      setTimeout(() => {
        navigate("/sign-up");
      }, 100);
    } else {
      navigate(`/document/${id}`);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();

    if (!user) {
      alert("You must be logged in to save documents.");
      return;
    }

    const alreadySaved = user.savedDocuments?.includes(id);

    try {
      const res = await fetch(
        `http://localhost:5001/api/auth/${
          alreadySaved ? "unsave" : "save"
        }/${id}`,
        {
          method: alreadySaved ? "DELETE" : "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        if (alreadySaved) {
          toast.info("Removed from My Documents");
          setSaved(false);
          updateUser({
            ...user,
            savedDocuments: user.savedDocuments.filter((docId) => docId !== id),
          });
        } else {
          toast.success("Saved to My Documents");
          setSaved(true);
          updateUser({
            ...user,
            savedDocuments: [...(user.savedDocuments || []), id],
          });
        }
      } else {
        toast.error("⚠️ Failed to update bookmark.");
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    }
  };

  return (
    <li className="cards__item">
      <div className="cards__item__link" onClick={handleClick}>
        <figure className="cards__item__pic-wrap" data-category={label}>
          <img
            className="cards__item__img"
            alt="Document"
            src={
              thumbnail
                ? thumbnail.startsWith("http")
                  ? thumbnail
                  : `http://localhost:5001/${thumbnail}`
                : "http://localhost:5001/images/avatar.png"
            }
          />
          <div className="likes-overlay">
            <i className="fas fa-thumbs-up" style={{ color: "green" }}></i>{" "}
            {likes} |{" "}
            <i
              className="fas fa-thumbs-down"
              style={{ color: "red", marginLeft: "8px" }}
            ></i>{" "}
            {dislikes}
          </div>

          {user && (
            <div
              className="save-icon"
              onClick={handleSave}
              title="Save to My Documents"
            >
              <i className={saved ? "fas fa-bookmark" : "far fa-bookmark"}></i>
            </div>
          )}

          {uploader?.avatar && (
            <a href={`/profile/${uploader._id}`}>
              <img
                src={
                  uploader?.avatar
                    ? uploader.avatar.startsWith("http")
                      ? uploader.avatar
                      : `http://localhost:5001${uploader.avatar}`
                    : "http://localhost:5001/images/avatar.png"
                }
                alt="Uploader"
                className="uploader-avatar"
                title={`Uploaded by ${uploader.username}`}
                onClick={(e) => e.stopPropagation()}
              />
            </a>
          )}
        </figure>
        <div className="cards__item__info">
          <h5 className="cards__item__text">{text}</h5>
        </div>
      </div>
    </li>
  );
}

export default CardItem;
