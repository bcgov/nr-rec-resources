import { Table, TableColumn } from '@/components/table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

interface TestRow {
  id: string;
  name: string;
  age: number;
}

describe('Table', () => {
  const columns: TableColumn<TestRow>[] = [
    {
      header: 'ID',
      render: (row) => row.id,
    },
    {
      header: 'Name',
      render: (row) => row.name,
    },
    {
      header: 'Age',
      render: (row) => row.age.toString(),
    },
  ];

  const rows: TestRow[] = [
    { id: '1', name: 'John Doe', age: 30 },
    { id: '2', name: 'Jane Smith', age: 25 },
  ];

  it('renders table with columns and rows', () => {
    render(<Table columns={columns} rows={rows} getRowKey={(row) => row.id} />);

    // Check headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    // Check row data
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders empty state message when no rows', () => {
    render(<Table columns={columns} rows={[]} getRowKey={(row) => row.id} />);

    expect(screen.getByText('No data available')).toBeInTheDocument();
    expect(screen.getByText('No data available')).toHaveClass(
      'text-center',
      'text-muted',
      'py-4',
    );
  });

  it('renders custom empty message', () => {
    const customMessage = 'No records found';
    render(
      <Table
        columns={columns}
        rows={[]}
        emptyMessage={customMessage}
        getRowKey={(row) => row.id}
      />,
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Table
        columns={columns}
        rows={rows}
        className="custom-class"
        getRowKey={(row) => row.id}
      />,
    );

    const table = container.querySelector('.custom-table.custom-class');
    expect(table).toBeInTheDocument();
  });

  it('uses getRowKey function to generate row keys', () => {
    const getRowKey = (row: TestRow) => `row-${row.id}`;
    const { container } = render(
      <Table columns={columns} rows={rows} getRowKey={getRowKey} />,
    );

    // Check that rows are rendered (keys are used internally)
    const tableRows = container.querySelectorAll('tbody tr');
    expect(tableRows).toHaveLength(2);
  });

  it('renders column headers correctly', () => {
    render(<Table columns={columns} rows={rows} getRowKey={(row) => row.id} />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    expect(headers[0]).toHaveTextContent('ID');
    expect(headers[1]).toHaveTextContent('Name');
    expect(headers[2]).toHaveTextContent('Age');
  });

  it('renders cell content using column render functions', () => {
    const customColumns: TableColumn<TestRow>[] = [
      {
        header: 'Full Info',
        render: (row, index) => `${row.name} (${row.age}) - Row ${index}`,
      },
    ];

    render(
      <Table columns={customColumns} rows={rows} getRowKey={(row) => row.id} />,
    );

    expect(screen.getByText('John Doe (30) - Row 0')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith (25) - Row 1')).toBeInTheDocument();
  });

  it('handles empty columns array', () => {
    render(<Table columns={[]} rows={rows} getRowKey={(row) => row.id} />);

    // Should render empty table with no headers
    const headers = screen.queryAllByRole('columnheader');
    expect(headers).toHaveLength(0);
  });

  it('renders table with single row', () => {
    const singleRow = [rows[0]];
    render(
      <Table columns={columns} rows={singleRow} getRowKey={(row) => row.id} />,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    // Should not have second row
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('wraps table in table-responsive div', () => {
    const { container } = render(
      <Table columns={columns} rows={rows} getRowKey={(row) => row.id} />,
    );

    const wrapper = container.querySelector('.table-responsive');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.querySelector('.custom-table')).toBeInTheDocument();
  });

  it('renders complex cell content', () => {
    const complexColumns: TableColumn<TestRow>[] = [
      {
        header: 'Details',
        render: (row) => (
          <div>
            <strong>{row.name}</strong>
            <span> - Age: {row.age}</span>
          </div>
        ),
      },
    ];

    render(
      <Table
        columns={complexColumns}
        rows={[rows[0]]}
        getRowKey={(row) => row.id}
      />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Check for the age text - it might be in a span or combined
    expect(screen.getByText(/Age: 30/)).toBeInTheDocument();
  });
});
