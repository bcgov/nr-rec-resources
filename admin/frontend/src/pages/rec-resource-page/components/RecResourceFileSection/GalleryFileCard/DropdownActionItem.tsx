import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, Stack } from "react-bootstrap";

interface DropdownActionItemProps {
  icon: any;
  label: string;
  onClick: () => void;
}

/**
 * Reusable dropdown menu item component with icon and label
 */
export const DropdownActionItem = ({
  icon,
  label,
  onClick,
}: DropdownActionItemProps) => (
  <Dropdown.Item onClick={onClick}>
    <Stack direction="horizontal" gap={2} className="align-items-center">
      <FontAwesomeIcon icon={icon} />
      <span>{label}</span>
    </Stack>
  </Dropdown.Item>
);
