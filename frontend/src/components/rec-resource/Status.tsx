import blueStatus from '@/images/icons/blue-status.svg';
import redStatus from '@/images/icons/red-status.svg';

interface StatusProps {
  description: string;
  statusCode: string;
}

const Status = ({ description, statusCode }: StatusProps) => {
  const getStatusIcon = (statusCode: string) => {
    switch (statusCode) {
      case '01':
        return blueStatus;
      case '02':
        return redStatus;
    }
  };

  const statusIcon = getStatusIcon(statusCode);
  if (!statusIcon) return null;
  return (
    <div
      className="icon-container"
      style={{
        minWidth: '96px',
      }}
    >
      <img
        alt={`Site ${description} status icon`}
        src={statusIcon}
        height={24}
        width={24}
      />{' '}
      <span>{description}</span>
    </div>
  );
};

export default Status;
