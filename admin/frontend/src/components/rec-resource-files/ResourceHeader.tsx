import React from 'react';

export const ResourceHeader = ({
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
      gap: '1rem',
      marginBottom: '1rem',
    }}
  >
    <h2>{name}</h2>
    <span
      style={{
        background: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '6px',
        padding: '0.25rem 0.75rem',
        fontWeight: 600,
        fontSize: '1rem',
      }}
    >
      {recId}
    </span>
  </div>
);
