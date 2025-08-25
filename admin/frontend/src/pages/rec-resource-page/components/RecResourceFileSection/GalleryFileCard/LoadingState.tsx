import { Spinner, Stack } from 'react-bootstrap';

interface LoadingStateProps {
  label: string;
}

/**
 * Loading state component with spinner and label
 */
export const LoadingState = ({ label }: LoadingStateProps) => (
  <Stack
    direction="vertical"
    gap={2}
    className="align-items-center justify-content-center"
  >
    <Spinner
      animation="border"
      role="status"
      aria-label={`${label} in progress`}
    />
    <span>{label}</span>
  </Stack>
);
