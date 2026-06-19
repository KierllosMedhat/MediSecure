import { useState, useMemo, useEffect } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import './DataTable.css';

/**
 * @param {{ columns: Array<{key: string, label: string, render?: Function, sortable?: boolean}>, data: Array, emptyMessage?: string, searchable?: boolean, pagination?: boolean, itemsPerPage?: number }} props
 */
export default function DataTable({ 
  columns, 
  data, 
  emptyMessage = 'No data available.', 
  onRowClick, 
  sortConfig, 
  onSort,
  searchable = false,
  searchTerm: externalSearchTerm,
  onSearchChange,
  hideSearchBar = false,
  pagination = false,
  itemsPerPage = 5
}) {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const currentSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  const handleSearchChange = (val) => {
    if (onSearchChange) onSearchChange(val);
    else setInternalSearchTerm(val);
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchable || !currentSearchTerm) return data;
    const lower = currentSearchTerm.toLowerCase();
    return data.filter(row => {
      return columns.some(col => {
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(lower);
      });
    });
  }, [data, currentSearchTerm, columns, searchable]);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [currentSearchTerm]);

  // Pagination logic
  const totalPages = pagination ? Math.max(1, Math.ceil(filteredData.length / itemsPerPage)) : 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, pagination, currentPage, itemsPerPage]);

  if (!data || data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      {searchable && !hideSearchBar && (
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <IoSearchOutline 
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                fontSize: '1.1rem'
              }}
            />
            <input
              type="text"
              placeholder="Search in table..."
              value={currentSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="data-table-search"
              style={{
                padding: '10px 12px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                width: '100%',
                fontSize: '0.95rem',
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary, #3b82f6)';
                e.target.style.backgroundColor = '#fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              }}
            />
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={col.sortable ? { cursor: 'pointer', userSelect: 'none' } : {}}
                title={col.sortable ? "Click to sort" : undefined}
              >
                {col.label}
                {col.sortable && sortConfig?.key === col.key && (
                  <span style={{ marginLeft: '4px', fontSize: '0.8em' }}>
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, idx) => (
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
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                No results found for "{currentSearchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && filteredData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 0' }}>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
