/**
 * Reusable Data Table component
 * Owner: Kyrillos (Shared UI)
 */
import './DataTable.css';

/**
 * @param {{ columns: Array<{key: string, label: string, render?: Function}>, data: Array, emptyMessage?: string }} props
 */
export default function DataTable({ columns, data, emptyMessage = 'No data available.', onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'data-table__row--clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
