import { getStatusIcon } from './getStatusIcon';

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
