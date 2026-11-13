import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './CustomBadge.scss';

export interface CustomBadgeProps {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  fontWeight?: string | number;
  icon?: IconDefinition;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  label,
  bgColor,
  textColor,
  borderColor,
  fontWeight,
  icon,
}) => (
  <span
    className="custom-badge"
    style={{
      backgroundColor: bgColor,
      color: textColor,
      ...(borderColor && {
        border: `1px solid ${borderColor}`,
      }),
      ...(fontWeight && {
        fontWeight: fontWeight,
      }),
    }}
  >
    {icon && <FontAwesomeIcon icon={icon} className="me-2" />}
    {label}
  </span>
);
