import '../pages/RecordPages.css';
import { useState, useRef } from 'react';

export default function DragAndDropFileUpload({ file, handleFile, onUpload }){
    // drag and drop states
    const [isDragging, setIsDragging] = useState(null);
    const inputRef = useRef();
    const [isUploading, setIsUploading] = useState(null);
    
      const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
      };
      const handleDragLeave = () => {
        setIsDragging(false);
      };
    
      const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        handleFile(droppedFile);
      };
    
      const handleBrowseClick = () => {
        inputRef.current?.click();
      };
      const handleInputChange = (e) => {
        const selectedFile = e.target.files?.[0];
        handleFile(selectedFile);
      };

      const handleUpload=()=>{
        onUpload();
        setIsUploading(false);
      }

      return(
        <div className="upload-section">
        <div
          className={`drop-zone ${isDragging ? "drop-zone--active" : ""}`}
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="drop-zone__input"
            onChange={handleInputChange}
          />
          <p className="drop-zone__text">
            {file
              ? `Selected: ${file.name}`
              : "Drag & drop a file here, or click to browse"}
          </p>
          {file && (
            <p className="drop-zone__meta">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        <button
          type="button"
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      );

}