import { useRef, useState } from 'react';
import { Overlay, Tooltip } from 'react-bootstrap';
import './HelpIcon.scss';

export interface HelpIconProps {
  /** Tooltip text to display on click */
  text: string;
  /** Unique id used to link the tooltip (should be unique on the page) */
  id: string;
}

/** Small inline ? badge that shows a tooltip on click */
export function HelpIcon({ text, id }: HelpIconProps) {
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState<HTMLSpanElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  return (
    <>
      <span
        ref={(node) => {
          spanRef.current = node;
          setTarget(node);
        }}
        className="help-icon__badge"
        aria-label="Help"
        tabIndex={0}
        onClick={() => setShow((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setShow((prev) => !prev);
        }}
      >
        ?
      </span>
      <Overlay
        target={target}
        show={show}
        placement="top"
        rootClose
        onHide={() => setShow(false)}
      >
        <Tooltip id={`tooltip-${id}`} className="help-icon__tooltip">
          {text}
        </Tooltip>
      </Overlay>
    </>
  );
}
