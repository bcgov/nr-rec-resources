import { ReactElement } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Placement } from 'react-bootstrap/types';

interface SidebarTooltipProps {
  /** The Link component or element to trigger the tooltip */
  children: ReactElement;
  /** The text to display inside the tooltip */
  text: string;
  /** State determining if the sidebar is collapsed or open */
  isCollapsed: boolean;
  /** Optional direction of the tooltip. Defaults to 'right' */
  placement?: Placement;
}

const SidebarTooltip: React.FC<SidebarTooltipProps> = ({
  children,
  text,
  isCollapsed,
  placement = 'right',
}) => {
  // If the sidebar is NOT collapsed, we don't need to show the tooltip
  if (!isCollapsed) {
    return children;
  }

  return (
    <OverlayTrigger
      placement={placement}
      container={() => document.body}
      popperConfig={{
        strategy: 'fixed',
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport', // Constrains calculations strictly to view boundaries
              padding: 8, // Keeps the tooltip bubble 8px clear of viewport boundaries
            },
          },
        ],
      }}
      overlay={<Tooltip id={`tooltip-${placement}`}>{text}</Tooltip>}
    >
      {({ ref, ...triggerHandler }) => (
        <span
          ref={ref}
          {...triggerHandler}
          className="d-flex w-100" // Maintains the flex layout size
        >
          {children}
        </span>
      )}
    </OverlayTrigger>
  );
};

export default SidebarTooltip;
