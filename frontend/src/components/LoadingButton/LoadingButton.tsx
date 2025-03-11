import React from 'react';
import { Button, Spinner, Stack } from 'react-bootstrap';

interface LoadingButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
  variant?: string;
  children: React.ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loading = false,
  className = '',
  variant = 'secondary',
  children,
}) => {
  return (
    <Button
      data-testid="loading-button"
      onClick={onClick}
      className={`d-flex align-items-center justify-content-center ${className}`}
      variant={variant}
    >
      <Stack direction="horizontal" gap={2}>
        {children}
        {loading && <Spinner size="sm" />}
      </Stack>
    </Button>
  );
};
