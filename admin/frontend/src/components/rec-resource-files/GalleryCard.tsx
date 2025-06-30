import React from 'react';
import './Gallery.scss';

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
  menu = <span className="gallery-card-menu">•••</span>,
}) => (
  <div className="gallery-card">
    <div className="gallery-card-top">{topContent}</div>
    <div className="gallery-card-body">
      <div className="gallery-card-row">
        <span className="gallery-card-filename">{filename}</span>
        {menu}
      </div>
      <div className="gallery-card-date">{date}</div>
    </div>
  </div>
);
