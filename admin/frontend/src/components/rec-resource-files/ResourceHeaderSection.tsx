import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export const ResourceHeaderSection = ({
  name,
  recId,
}: {
  name: string;
  recId: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 0,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <h1 style={{ fontWeight: 700, margin: 0 }}>{name}</h1>
      <span
        style={{
          background: '#C7E2FA',
          color: '#0B3556',
          borderRadius: '999px',
          padding: '0.18em 1.1em 0.18em 1.1em',
          fontWeight: 500,
          fontSize: '1rem',
          lineHeight: 1,
          letterSpacing: 0.5,
          display: 'inline-block',
        }}
      >
        {recId}
      </span>
    </div>
    <div style={{ display: 'flex', gap: '1.25rem' }}>
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
  </div>
);
