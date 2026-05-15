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

export default function RecentUploadsWidget({ uploads = [] }) {
  return (
    <Card title="Recent Uploads" subtitle="Latest documents added">
      {/* TODO: Render uploads list or empty state */}
      
    </Card>
  );
}
