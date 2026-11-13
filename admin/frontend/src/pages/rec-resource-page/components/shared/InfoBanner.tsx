import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import { Alert, Stack } from 'react-bootstrap';

type InfoBannerProps = {
  children: ReactNode;
  title?: string;
  variant?: 'warning' | 'beta';
};

export const InfoBanner = ({
  children,
  title,
  variant = 'warning',
}: InfoBannerProps) => (
  <Alert
    variant={variant === 'beta' ? 'light' : 'warning'}
    className={`rec-resource-page__info-banner rec-resource-page__info-banner--${variant}`}
  >
    <Stack
      direction="horizontal"
      gap={2}
      className={title ? 'align-items-start' : undefined}
    >
      <FontAwesomeIcon
        className="rec-resource-page__info-banner-icon"
        icon={faInfoCircle}
        aria-label="Information"
      />
      <Stack gap={1}>
        {title && (
          <span className="rec-resource-page__info-banner-title">{title}</span>
        )}
        <span className="rec-resource-page__info-banner-text">{children}</span>
      </Stack>
    </Stack>
  </Alert>
);
