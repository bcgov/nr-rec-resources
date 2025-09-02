import clsx from 'clsx';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './ClampLines.scss';

export interface ClampLinesProps {
  text: string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  as?: React.ElementType;
}

export const ClampLines: React.FC<ClampLinesProps> = ({
  text,
  lines = 2,
  className,
  style,
  placement = 'top',
  as: Component = 'span',
}) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={<Tooltip id={`tooltip-clamp`}>{text}</Tooltip>}
    >
      <Component
        className={clsx('clamp-ellipsis', className)}
        style={{
          WebkitLineClamp: lines,
          ...style,
        }}
        tabIndex={0}
        title={text}
      >
        {text}
      </Component>
    </OverlayTrigger>
  );
};
