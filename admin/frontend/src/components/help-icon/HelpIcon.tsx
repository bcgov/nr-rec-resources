import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './HelpIcon.scss';

export interface HelpIconProps {
  /** Tooltip text to display on hover */
  text: string;
  /** Unique id used to link the tooltip (should be unique on the page) */
  id: string;
}

/** Small inline ? badge that shows a tooltip on hover */
export function HelpIcon({ text, id }: HelpIconProps) {
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${id}`} className="help-icon__tooltip">
          {text}
        </Tooltip>
      }
    >
      <span className="help-icon__badge" aria-label="Help" tabIndex={0}>
        ?
      </span>
    </OverlayTrigger>
  );
}
