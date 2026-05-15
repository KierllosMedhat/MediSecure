import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, StatusBadge, DataTable } from '../../../components/ui';
import '../pages/RecordPages.css';
export default function DocumentSection(props) {
    const documents = props.documents;
    const docListRef = useRef(null);
    if (props.docError) {
      return (
        <p> could not retreive documents</p>
      );
    }
    return (
      <Card className="record-documents">
        <h3>Attachments</h3>
  
        {documents.length === 0 ? (
          <p>No documents available.</p>
        ) : (
          <ul className="documents-list" ref={docListRef}>
            {documents.map((doc) => (
              <li key={doc.Document_Id} className="document-item">
                <div className="document-info">
                  <div><strong>{doc.file_name || 'Unnamed file'}</strong></div>
                  <div>Type: {doc.file_type || 'N/A'}</div>
  
                </div>
  
                <Button onClick={() => props.handleDownload(doc.Document_Id, doc.file_name)}>
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
  
  
  
    );
  }
  