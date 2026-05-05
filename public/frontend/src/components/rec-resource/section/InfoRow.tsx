import { ReactNode } from 'react';

interface InfoRowProps {
  icon: string;
  iconAlt: string;
  title: string;
  className?: string;
  children: ReactNode;
}

const InfoRow = ({
  icon,
  iconAlt,
  title,
  className,
  children,
}: InfoRowProps) => (
  <div className="row">
    <div className="col-sm-1">
      <img src={icon} alt={iconAlt} height={40} width={40} />
    </div>
    <div className={`col-sm${className ? ` ${className}` : ''}`}>
      <p className="small-tittle">{title}</p>
      {children}
    </div>
  </div>
);

export default InfoRow;
