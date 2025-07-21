import { FC, HtmlHTMLAttributes } from "react";
import { OverlayTrigger, OverlayTriggerProps, Tooltip } from "react-bootstrap";
import "./Avatar.scss";

/**
 * Props for the Avatar component.
 */
export interface AvatarProps
  extends Pick<HtmlHTMLAttributes<HTMLDivElement>, "className"> {
  /**
   * The full name to display as initials in the avatar.
   */
  name: string;
  /**
   * The diameter of the avatar in pixels.
   * @default 50
   */
  size?: number;
  /**
   * Whether to show a tooltip with the full name on hover.
   * @default false
   */
  tooltip?: boolean;
  /**
   * Placement of the tooltip.
   * @default "bottom"
   */
  tooltipPlacement?: OverlayTriggerProps["placement"];
}

/**
 * Renders a circular avatar with user initials.
 * Optionally displays a tooltip with the full name.
 */
export const Avatar: FC<AvatarProps> = ({
  name,
  size = 50,
  tooltip = false,
  tooltipPlacement = "bottom",
  className,
}) => {
  // Get up to two initials from the name
  const initials = name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  const avatar = (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: "bold",
        textTransform: "uppercase",
        userSelect: "none",
      }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );

  return tooltip ? (
    <OverlayTrigger
      overlay={<Tooltip id="avatar-tooltip">{name}</Tooltip>}
      placement={tooltipPlacement}
    >
      <div>{avatar}</div>
    </OverlayTrigger>
  ) : (
    avatar
  );
};
