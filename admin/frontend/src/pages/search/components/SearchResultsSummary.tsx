import { Spinner } from 'react-bootstrap';

interface SearchResultsSummaryProps {
  isLoading: boolean;
  total: number;
  query?: string;
}

export function SearchResultsSummary({
  isLoading,
  total,
  query,
}: SearchResultsSummaryProps) {
  if (isLoading) {
    return (
      <span>
        <Spinner as="span" animation="border" size="sm" aria-hidden="true" />
        <span className="visually-hidden">Loading results...</span>
      </span>
    );
  }

  if (query) {
    return `${total} result${total === 1 ? '' : 's'} for "${query}"`;
  }

  return `${total} total resource${total === 1 ? '' : 's'}`;
}
