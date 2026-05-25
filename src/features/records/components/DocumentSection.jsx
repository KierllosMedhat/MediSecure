import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, StatusBadge, DataTable } from '../../../components/ui';
import '../pages/RecordPages.css';
export default function DocumentSection({documents,docError,downloadable,handleDownload}) {
    
    const docListRef = useRef(null);
    if (docError) {
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
              <li key={doc.document_id} className="document-item">
                <div className="document-info">
                  <div><strong>{doc.file_name || 'Unnamed file'}</strong></div>
                  <div>Type: {doc.file_type || 'document'}</div>
                  <div>Created at: {new Date(doc.created_at).toLocaleString() || 'N/A'}</div>
  
                </div>
  { downloadable ?
                <Button onClick={() => props.handleDownload(doc.document_id, doc.file_name)}>
                  Download
                </Button>
                :
                <></>
}
              </li>
            ))}
          </ul>
        )}
      </Card>
  
  
  
    );
  }
  