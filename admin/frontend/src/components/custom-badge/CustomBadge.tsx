import React from 'react';
import './CustomBadge.scss';

export interface CustomBadgeProps {
  label: string;
  bgColor: string;
  textColor: string;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  label,
  bgColor,
  textColor,
}) => (
  <span
    className="custom-badge"
    style={{ backgroundColor: bgColor, color: textColor }}
  >
    {label}
  </span>
);
