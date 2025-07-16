import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Stack } from "react-bootstrap";

interface ActionButtonProps {
  icon: any;
  label: string;
  onClick: () => void;
}

/**
 * Reusable action button component for hover overlays and interactive elements
 */
export const ActionButton = ({ icon, label, onClick }: ActionButtonProps) => (
  <Stack
    direction="vertical"
    gap={2}
    className="align-items-center justify-content-center gallery-file-card__action-button-container"
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label={label}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <Button variant="link" tabIndex={-1} aria-hidden="true">
      <FontAwesomeIcon icon={icon} />
    </Button>
    <span>{label}</span>
  </Stack>
);
