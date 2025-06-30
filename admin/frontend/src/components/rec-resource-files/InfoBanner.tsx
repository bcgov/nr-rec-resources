import React from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export const InfoBanner = ({ children }: { children: React.ReactNode }) => (
  <Alert variant="warning" className="info-banner">
    <Stack direction="horizontal" gap={2}>
      <span className="info-banner-icon">
        <FontAwesomeIcon icon={faInfoCircle} />
      </span>
      <span className="info-banner-text">{children}</span>
    </Stack>
  </Alert>
);
