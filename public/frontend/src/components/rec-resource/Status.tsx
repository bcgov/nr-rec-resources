import blueStatus from '@/images/icons/blue-status.svg';
import redStatus from '@/images/icons/red-status.svg';

interface StatusProps {
  description: string;
  statusCode: number;
  advisoriesCount: number;
}

const Status = ({ description, statusCode, advisoriesCount }: StatusProps) => {
  const getStatusIcon = (statusCode: string) => {
    switch (statusCode) {
      case '1':
        return blueStatus;
      case '2':
        return redStatus;
    }
  };

  const statusIcon = getStatusIcon(String(statusCode));
  if (!statusIcon) return null;
  return (
    <div className="icon-container">
      <img
        alt={`Site ${description} status icon`}
        src={statusIcon}
        height={24}
        width={24}
      />
      <span>{description}</span>
      {advisoriesCount > 0 && (
        <>
          {','}&nbsp;
          <a href="#know-before-you-go">check advisories ({advisoriesCount})</a>
        </>
      )}
    </div>
  );
};

export default Status;
