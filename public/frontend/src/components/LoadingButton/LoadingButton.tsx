import { CSSProperties, ReactNode } from 'react';
import { Button, Spinner, Stack } from 'react-bootstrap';

interface LoadingButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
  variant?: string;
  disabled?: boolean;
  ariaLabel?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  loading = false,
  className = '',
  variant = 'secondary',
  disabled = false,
  ariaLabel,
  style,
  children,
}) => {
  return (
    <Button
      data-testid="loading-button"
      onClick={onClick}
      className={`d-flex align-items-center justify-content-center ${className}`}
      variant={variant}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
    >
      <Stack direction="horizontal" gap={2}>
        {loading ? (
          <Spinner size="sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : (
          children
        )}
      </Stack>
    </Button>
  );
};
