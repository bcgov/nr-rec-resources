import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export const UploadSection = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1.25rem',
      marginBottom: '1.5rem',
    }}
  >
    <Button
      variant="outline-primary"
      style={{
        fontWeight: 500,
        color: '#0B3556',
        borderColor: '#0B3556',
        background: '#fff',
        padding: '8px 22px',
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <FontAwesomeIcon icon={faPlus} style={{ fontSize: 18 }} />
      Upload image
    </Button>
    <Button
      variant="outline-primary"
      style={{
        fontWeight: 500,
        color: '#0B3556',
        borderColor: '#0B3556',
        background: '#fff',
        padding: '8px 22px',
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <FontAwesomeIcon icon={faPlus} style={{ fontSize: 18 }} />
      Upload document
    </Button>
  </div>
);
