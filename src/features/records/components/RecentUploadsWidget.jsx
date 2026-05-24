/**
 * Recent Uploads Widget — reusable widget for dashboards.
 * Owner: Fadi
 *
 * TODO:
 * - Accept uploads[] prop (array of { id, title, date })
 * - Render list inside a Card
 * - Show empty state if no uploads
 */
import { Card } from '../../../components/ui';
import DocumentSection from './DocumentSection';
export default function RecentUploadsWidget({ uploads = [] }) {

  
  const handleDownload = async (documentId, fallbackFileName = 'document') => {
    try {
      const response = await recordsApi.downloadDocument(documentId);

      // response.data is the blob payload from axios (responseType: 'blob')
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data]);

      // Try to read filename from Content-Disposition header first
      const contentDisposition =
        response.headers?.['content-disposition'] ||
        response.headers?.['Content-Disposition'];

      let fileName = fallbackFileName;

      if (contentDisposition) {
        // Supports: filename="x.pdf" and filename*=UTF-8''x.pdf
        const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
        const asciiMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i);

        if (utf8Match?.[1]) {
          fileName = decodeURIComponent(utf8Match[1]);
        } else if (asciiMatch) {
          fileName = (asciiMatch[1] || asciiMatch[2] || fallbackFileName).trim();
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document', error);
    }
  };

  return (
    <Card title="Recent Uploads" subtitle="Latest documents added">
      {/* TODO: Render uploads list or empty state */}
        <DocumentSection documents={uploads} downloadable={true} handleDownload={handleDownload} />

    </Card>
  );
}
