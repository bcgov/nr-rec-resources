import './CustomBadge.scss';

export interface CustomBadgeProps {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor?: string;
  fontWeight?: string | number;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  label,
  bgColor,
  textColor,
  borderColor,
  fontWeight,
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
    {label}
  </span>
);
