import { BlueStatusIcon, RedStatusIcon, YellowStatusIcon } from './StatusIcons';

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

interface AccessStatusProps {
  grouplabel?: string | null;
  statusDescription: string;
  advisoryCount: number;
  slug: string;
  hideComma?: boolean;
  punctuation?: string;
}

export default function AccessStatus({
  grouplabel,
  statusDescription,
  advisoryCount,
  slug,
  hideComma = false,
  punctuation,
}: AccessStatusProps) {
  const icon = getStatusIcon(grouplabel);

  return (
    <div className="access-status-icon">
      {icon}
      {statusDescription}
      {!hideComma && advisoryCount > 0 && ', '}
      {advisoryCount > 0 && (
        <a href={`/resource/${slug}#know-before-you-go`}>
          {hideComma ? 'C' : 'c'}heck advisories ({advisoryCount})
        </a>
      )}
      {punctuation}
    </div>
  );
}
