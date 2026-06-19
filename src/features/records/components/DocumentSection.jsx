import { useRef } from 'react';
import { Card, Button } from '../../../components/ui';
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
<<<<<<< HEAD
              <li key={doc.id || doc.document_id} className="document-item">
=======
              <li key={doc.id} className="document-item">
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
                <div className="document-info">
                  <div><strong>{doc.file_name || 'Unnamed file'}</strong></div>
                  <div>Type: {doc.file_type || 'document'}</div>
                  <div>Created at: {new Date(doc.created_at).toLocaleString() || 'N/A'}</div>
  
                </div>
  { downloadable ?
<<<<<<< HEAD
                <Button onClick={() => handleDownload(doc.id || doc.document_id, doc.file_name)}>
=======
                <Button onClick={() => handleDownload(doc.id, doc.file_name)}>
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
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
  