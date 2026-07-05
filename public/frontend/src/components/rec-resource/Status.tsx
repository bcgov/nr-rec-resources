import {
  BlueStatusIcon,
  RedStatusIcon,
  YellowStatusIcon,
} from '@/components/rec-resource/card/StatusIcons';

const YELLOW_GROUPLABELS = new Set([
  'seasonal restrictions',
  'visit with caution',
  'limited access',
]);
const RED_GROUPLABELS = new Set(['closed', 'restricted']);

function getStatusIcon(grouplabel?: string | null): React.ReactElement {
  if (!grouplabel) return <BlueStatusIcon />;
  const lower = grouplabel.toLowerCase();
  if (RED_GROUPLABELS.has(lower)) return <RedStatusIcon />;
  if (YELLOW_GROUPLABELS.has(lower)) return <YellowStatusIcon />;
  return <BlueStatusIcon />;
}

interface StatusProps {
  grouplabel?: string | null;
  description: string;
  advisoriesCount: number;
}

const Status = ({ grouplabel, description, advisoriesCount }: StatusProps) => {
  const icon = getStatusIcon(grouplabel);

  return (
    <div className="icon-container advisories-info">
      {icon}
      <span>{description}</span>
      {advisoriesCount > 0 && (
        <div data-testid="advisories-info-link">
          {','}&nbsp;
          <a href="#know-before-you-go">
            check advisories ({advisoriesCount}).
          </a>
        </div>
      )}
    </div>
  );
};

export default Status;
