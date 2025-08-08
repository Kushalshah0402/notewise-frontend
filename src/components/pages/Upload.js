import React, { useRef, useState } from "react";
import "../../App.css";
import "./Upload.css";
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const extractInfoFromFilename = (fileName) => {
  const raw = fileName.replace(/\.[^/.]+$/, ""); // remove extension
  const parts = raw.split(/[_\s-]+/);

  let detectedCourseCode = "";
  let detectedYear = "";
  let detectedUniversity = "";
  let titleParts = [];

  parts.forEach((part) => {
    if (/^[A-Z]{2,3}\d{4}[A-Z]*$/i.test(part)) {
      detectedCourseCode = part.toUpperCase();
    } else if (/^(20)?\d{2,4}(S\d)?$/i.test(part)) {
      detectedYear = part;
    } else if (/(NUS|NTU|SMU|SUTD|SIT|SIM|Yale|YNU)/i.test(part)) {
      detectedUniversity = part.toUpperCase();
    } else {
      titleParts.push(part);
    }
  });

  return {
    university: detectedUniversity,
    courseCode: detectedCourseCode,
    year: detectedYear,
    title: titleParts.join(" "),
  };
};

export default function Upload() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState(1);
  const [fileDetails, setFileDetails] = useState([]);
  const allFieldsFilled = fileDetails.every(
    (entry) => entry.university && entry.courseCode && entry.title
  );

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const maxSizeMB = 30;

  const handleFileChange = (e) => {
    if (!user) {
      navigate("/sign-up");
      return;
    }

    const newFiles = Array.from(e.target.files);
    let duplicates = [];

    const nonDuplicateFiles = newFiles.filter((newFile) => {
      if (!allowedTypes.includes(newFile.type)) {
        toast.error(`${newFile.name} is not a supported file type.`);
        return false;
      }

      if (newFile.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${newFile.name} exceeds the ${maxSizeMB}MB limit.`);
        return false;
      }

      const isDuplicate = uploadedFiles.some(
        (file) => file.name === newFile.name && file.size === newFile.size
      );
      if (isDuplicate) {
        duplicates.push(newFile.name);
        return false;
      }
      return true;
    });

    if (duplicates.length > 0) {
      toast.error(`⚠️ ${duplicates.join(", ")} already uploaded.`);
    } else if (nonDuplicateFiles.length > 0) {
      toast.success(`${nonDuplicateFiles.length} file(s) uploaded.`);
    }

    setUploadedFiles((prev) => [...prev, ...nonDuplicateFiles]);
    e.target.value = "";
  };

  const handleDelete = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/sign-up");
      return;
    }
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const fakeEvent = { target: { files: droppedFiles } };
    handleFileChange(fakeEvent);
  };

  const formatTitle = (raw) => {
    return raw.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <>
      <div className="upload-page">
        <div className="upload-header">
          <h2>Upload your Notes</h2>
          <p>Help your peers by sharing useful study materials!</p>
        </div>
        {step === 1 && (
          <div className="upload-main">
            <div
              className={`upload-box ${dragActive ? "drag-active" : ""} ${
                !user ? "disabled" : ""
              }`}
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <p className="upload-title">
                Upload your files <i className="fas fa-cloud-arrow-up"></i>
              </p>
              <p className="browse-button">Browse files or Drag & Drop</p>
              <p className="supported-files-text">Supported files: pdf,docx</p>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            {uploadedFiles.length > 0 && (
              <>
                <ul className="file-list">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="file-item">
                      <span
                        title={`Name: ${file.name} | Type: ${
                          file.type || "N/A"
                        } | Size: ${(file.size / 1024).toFixed(2)} KB`}
                      >
                        {file.name}
                      </span>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(index)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="button-container">
                <button
                  className="clear-all-button"
                  onClick={() => setUploadedFiles([])}
                >
                  Clear All
                </button>
                <button
                  className="next-button"
                  onClick={() => {
                    const parsedDetails = uploadedFiles.map((file) => {
                      const info = extractInfoFromFilename(file.name);
                      return {
                        file,
                        university: info.university,
                        courseCode: info.courseCode,
                        title: formatTitle(info.title),
                        year: info.year,
                      };
                    });

                    setFileDetails(parsedDetails);
                    setStep(2);
                  }}
                >
                  Next
                </button>
                </div>
              </>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="file-metadata-form">
            <h3>Provide details for each file</h3>
            {fileDetails.map((entry, index) => (
              <div key={index} className="file-detail-entry">
                <p>
                  <strong>{entry.file.name}</strong>
                </p>
                <div className="form-row">
                  <select
                    name={`university-${index}`}
                    id={`university-${index}`}
                    value={entry.university}
                    onChange={(e) => {
                      const newDetails = [...fileDetails];
                      newDetails[index].university = e.target.value;
                      setFileDetails(newDetails);
                    }}
                    className={entry.university ? "selected" : "placeholder"}
                  >
                    <option value="">Select University</option>
                    <option value="NUS">NUS</option>
                    <option value="NTU">NTU</option>
                    <option value="SMU">SMU</option>
                  </select>
                  <div className="floating-input">
                    <input
                      type="text"
                      name={`courseCode-${index}`}
                      id={`courseCode-${index}`}
                      placeholder="Course Code (e.g. CS1010)"
                      value={entry.courseCode}
                      onChange={(e) => {
                        const newDetails = [...fileDetails];
                        newDetails[index].courseCode = e.target.value;
                        setFileDetails(newDetails);
                      }}
                      className={entry.courseCode ? "selected" : "placeholder"}
                    />
                    <label htmlFor={`courseCode-${index}`}>Course Code</label>
                  </div>
                  <div className="floating-input">
                    <input
                      type="text"
                      name={`title-${index}`}
                      id={`title-${index}`}
                      placeholder="Document Title"
                      value={entry.title}
                      onChange={(e) => {
                        const newDetails = [...fileDetails];
                        newDetails[index].title = e.target.value;
                        setFileDetails(newDetails);
                      }}
                      className={entry.title ? "selected" : "placeholder"}
                    />
                    <label htmlFor={`title-${index}`}>Title</label>
                  </div>
                  <div className="floating-input">
                    <input
                      type="text"
                      name={`year-${index}`}
                      id={`year-${index}`}
                      placeholder="Academic Year (e.g. 2025)"
                      value={entry.year || ""}
                      onChange={(e) => {
                        const newDetails = [...fileDetails];
                        newDetails[index].year = e.target.value;
                        setFileDetails(newDetails);
                      }}
                      className={entry.year ? "selected" : "placeholder"}
                    />
                    <label htmlFor={`year-${index}`}>Year</label>
                  </div>
                </div>
              </div>
            ))}

            <button className="back-button-document" onClick={() => setStep(1)}>
              Back
            </button>

            <button
              className="upload-final-button"
              onClick={(e) => {
                e.preventDefault();
                if (!allFieldsFilled) {
                  toast.error(
                    "Please fill in all fields before submitting."
                  );
                  return;
                }
                fileDetails.forEach(async (entry) => {
                  const formData = new FormData();
                  formData.append("file", entry.file);
                  formData.append("university", entry.university);
                  formData.append("courseCode", entry.courseCode);
                  formData.append("title", entry.title);
                  formData.append("userId", user._id);
                  formData.append("year", entry.year || "");

                  console.log("🚀 Sending file upload:", {
                    name: entry.file.name,
                    university: entry.university,
                    courseCode: entry.courseCode,
                    title: entry.title,
                    userId: user._id,
                  });

                  try {
                    const response = await fetch(
                      "http://localhost:5001/api/auth/upload",
                      {
                        method: "POST",
                        body: formData,
                        headers: {
                          Authorization: `Bearer ${token}`, // ✅ Add this line
                        },
                      }
                    );
                    const result = await response.json();
                    if (!result.success) throw new Error("Upload failed");

                    // 👇 Add this block to update user points
                    if (result.success) {
                      if (result.points !== undefined) {
                        updateUser({ ...user, points: result.points });
                      }
                    }
                  } catch (error) {
                    console.error("Upload error:", error);
                    toast.error("Upload failed for some files.");
                  }
                });
                setStep(1);
                setUploadedFiles([]);
                setFileDetails([]);
                toast.success("Files submitted successfully!");
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </>
  );
}
