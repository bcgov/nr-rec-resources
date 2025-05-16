import blueStatus from '@/images/icons/blue-status.svg';
import redStatus from '@/images/icons/red-status.svg';

interface StatusProps {
  description: string;
  statusCode: number;
}

const Status = ({ description, statusCode }: StatusProps) => {
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
      />{' '}
      <span>{description}</span>
    </div>
  );
};

export default Status;
