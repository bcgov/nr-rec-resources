import { Table as BootstrapTable } from 'react-bootstrap';
import './Table.scss';

export interface TableColumn<T> {
  header: string;
  render: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  getRowKey: (row: T, index: number) => string;
  className?: string;
}

export const Table = <T,>({
  columns,
  rows,
  emptyMessage = 'No data available',
  getRowKey,
  className = '',
}: TableProps<T>) => {
  return (
    <div className="table-responsive">
      <BootstrapTable className={`custom-table ${className}`}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={`header-${index}`}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-muted py-4"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)}>
                {columns.map((column, colIndex) => (
                  <td key={`cell-${rowIndex}-${colIndex}`}>
                    {column.render(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </BootstrapTable>
    </div>
  );
};
