import { FC } from 'react';
import { Spinner, Stack } from 'react-bootstrap';
import clsx from 'clsx';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  spinnerVariant?: 'primary' | 'secondary' | 'light' | 'dark';
  spinnerSize?: string; // CSS size like "3rem", "5rem"
  backdropClassName?: string; // overrides backdrop
  positionClassName?: string; // overrides position class
  className?: string; // extra classes for the wrapper
  zIndex?: number;
  loader?: React.ReactNode;
}

/**
 * Displays a loading spinner overlay.
 *
 * This component is designed to be rendered within a parent container that has `position: relative`
 * to ensure the overlay correctly covers its content.
 *
 * @param {LoadingOverlayProps} props - The props for the LoadingOverlay component.
 */
export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  spinnerVariant = 'dark',
  spinnerSize = '4rem',
  backdropClassName = 'bg-white',
  positionClassName = 'position-absolute',
  className,
  zIndex = 1050,
  loader,
}) => {
  if (!isLoading) return null;

  const defaultSpinner = (
    <Spinner
      animation="border"
      role="status"
      variant={spinnerVariant}
      style={{ width: spinnerSize, height: spinnerSize }}
    >
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );

  return (
    <Stack
      direction="vertical"
      gap={2}
      className={clsx(
        'w-100 h-100 align-items-center justify-content-center p-5',
        positionClassName,
        backdropClassName,
        className,
      )}
      style={{ zIndex }}
    >
      {loader || defaultSpinner}
      {message && <div className="text-muted">{message}</div>}
    </Stack>
  );
};
