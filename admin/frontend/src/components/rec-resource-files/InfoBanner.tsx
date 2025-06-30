import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export const InfoBanner = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      background: '#FFF3CD',
      border: '2px solid #FFE6A1',
      borderRadius: 8,
      padding: '18px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      margin: '24px 0',
    }}
  >
    <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#E6A100' }} />
    <span style={{ fontWeight: 700, color: '#222', fontSize: '1rem' }}>
      {children}
    </span>
  </div>
);
