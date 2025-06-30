import React from 'react';

interface GalleryCardProps {
  topContent: React.ReactNode;
  filename: string;
  date: string;
  menu?: React.ReactNode;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  topContent,
  filename,
  date,
  menu = (
    <span
      style={{ fontSize: 20, color: '#222', opacity: 0.7, cursor: 'pointer' }}
    >
      •••
    </span>
  ),
}) => (
  <div
    style={{
      width: 200,
      borderRadius: '10px',
      background: '#fff',
      boxShadow: '0 1px 2px #e0e0e0',
      border: '1px solid #d3d3d3',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        background: '#f5f5f5',
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {topContent}
    </div>
    <div
      style={{
        background: '#fff',
        padding: '0.5rem 0.75rem',
        borderTop: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15 }}>{filename}</span>
        {menu}
      </div>
      <div style={{ fontSize: '0.92rem', color: '#757575' }}>{date}</div>
    </div>
  </div>
);
