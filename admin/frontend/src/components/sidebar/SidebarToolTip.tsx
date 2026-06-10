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
      overlay={<Tooltip id={`tooltip-${placement}`}>{text}</Tooltip>}
    >
      {children}
    </OverlayTrigger>
  );
};

export default SidebarTooltip;
