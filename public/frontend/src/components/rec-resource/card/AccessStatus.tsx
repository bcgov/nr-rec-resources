import { BlueStatusIcon, RedStatusIcon } from './StatusIcons';

const STATUS_ICONS: Record<number, React.ReactElement> = {
  1: <BlueStatusIcon />,
  2: <RedStatusIcon />,
};

interface AccessStatusProps {
  statusCode: number;
  statusDescription: string;
  advisoryCount: number;
  slug: string;
  hideComma?: boolean;
  punctuation?: string;
}

export default function AccessStatus({
  statusCode,
  statusDescription,
  advisoryCount,
  slug,
  hideComma = false,
  punctuation,
}: AccessStatusProps) {
  const icon = STATUS_ICONS[statusCode];

  if (!icon) return null;

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
