import React from 'react';
import { Button } from 'react-bootstrap';

export const UploadSection = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    }}
  >
    <Button variant="outline-primary" style={{ fontWeight: 500 }}>
      Upload image
    </Button>
    <Button variant="outline-primary" style={{ fontWeight: 500 }}>
      Upload document
    </Button>
  </div>
);
