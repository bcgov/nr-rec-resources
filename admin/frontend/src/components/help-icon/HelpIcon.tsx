import { useSyncExternalStore } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './HelpIcon.scss';

export interface HelpIconProps {
  /** Tooltip text to display on click */
  text: string;
  /** Unique id used to link the tooltip (should be unique on the page) */
  id: string;
}

let activeId: string | null = null;
const listeners = new Set<() => void>();

const store = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => activeId,
  setActiveId: (id: string | null) => {
    activeId = id;
    listeners.forEach((listener) => listener());
  },
};

/** Small inline ? badge that shows a tooltip on click (only one open at a time) */
export function HelpIcon({ text, id }: HelpIconProps) {
  const show = useSyncExternalStore(store.subscribe, store.getSnapshot) === id;

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <OverlayTrigger
      placement="top"
      trigger="click"
      show={show}
      onToggle={(next) => store.setActiveId(next ? id : null)}
      rootClose
      overlay={
        <Tooltip id={`tooltip-${id}`} className="help-icon__tooltip">
          {text}
        </Tooltip>
      }
    >
      <span
        className="help-icon__badge"
        aria-label="Help"
        role="button"
        tabIndex={0}
        onClick={stop}
        onMouseDown={stop}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            stop(e);
            store.setActiveId(show ? null : id);
          }
        }}
      >
        ?
      </span>
    </OverlayTrigger>
  );
}
