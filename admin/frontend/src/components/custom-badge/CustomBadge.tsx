import './CustomBadge.scss';
import { Stack } from 'react-bootstrap';

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
  <Stack
    direction="horizontal"
    className="custom-badge h-100"
    style={{ backgroundColor: bgColor, color: textColor }}
  >
    {label}
  </Stack>
);
