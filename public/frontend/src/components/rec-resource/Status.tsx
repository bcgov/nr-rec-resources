import { getStatusIcon } from '@/components/rec-resource/card/getStatusIcon';

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
