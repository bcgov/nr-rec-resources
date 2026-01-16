import './Badge.scss';

interface BadgeProps {
  label: string;
}

export const Badge: React.FC<BadgeProps> = ({ label }) => {
  return <span className="badge">{label}</span>;
};
