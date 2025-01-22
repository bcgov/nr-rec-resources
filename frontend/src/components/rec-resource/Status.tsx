import blueStatus from '@/images/icons/blue-status.svg';

const Status = () => {
  return (
    <div className="icon-container">
      <img
        alt="Site open status icon"
        src={blueStatus}
        height={24}
        width={24}
      />{' '}
      <span>Open (Placeholder)</span>
    </div>
  );
};

export default Status;
