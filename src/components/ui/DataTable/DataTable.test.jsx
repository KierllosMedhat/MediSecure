import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DataTable from './DataTable';

describe('DataTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age', render: (val) => `${val} years` }
  ];

  const data = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
  ];

  it('renders empty message when no data is provided', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders table headers and rows correctly', () => {
    render(<DataTable columns={columns} data={data} />);
    
    // Headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    
    // Rows
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30 years')).toBeInTheDocument(); // Custom render
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('25 years')).toBeInTheDocument();
  });

  it('triggers onRowClick when a row is clicked', () => {
    const handleRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={handleRowClick} />);
    
    fireEvent.click(screen.getByText('Alice'));
    
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });
});
