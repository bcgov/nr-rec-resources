import {
  Button,
  Header as BCGovHeader,
} from "@bcgov/design-system-react-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Stack,
} from "react-bootstrap";
import React, { forwardRef } from "react";
import { FocusableElement } from "@react-types/shared";
import { useAuthContext } from "@/contexts/AuthContext";

/**
 * A custom menu toggle component for the header dropdown.
 *
 * @remarks
 * This component renders a Button with a "Menu" label (visible on md and up) and a FontAwesome bars icon.
 */
const HeaderMenuToggle = forwardRef<
  HTMLDivElement,
  {
    onClick: (event: React.MouseEvent<FocusableElement>) => void;
    className?: string;
  }
>((props, ref) => (
  <div ref={ref}>
    <Button
      data-testid="menu-toggle"
      onClick={(event) => {
        event.preventDefault();
        props.onClick(event);
      }}
      variant="secondary"
    >
      <span className="d-none d-md-inline">Menu</span>
      <FontAwesomeIcon icon={faBars} />
    </Button>
  </div>
));

/**
 * The Header component renders the top-level header with a welcome message and a dropdown menu.
 *
 * @remarks
 * If a user is present, a welcome message is displayed on desktop, while the user's display name is shown in the
 * dropdown on mobile.
 */
export const Header = () => {
  const { user, authService } = useAuthContext();
  return (
    <BCGovHeader>
      <Stack
        direction={"horizontal"}
        gap={3}
        className="w-100 d-flex justify-content-end align-items-center"
      >
        {user && (
          <div className="d-none d-md-block">
            Welcome, {user?.idir_username}
          </div>
        )}
        <Dropdown>
          <DropdownToggle
            as={HeaderMenuToggle} // for a custom bc gov design-based button
            id="dropdown-basic"
          />
          <DropdownMenu>
            {user && (
              // Only show in mobile view (md and lower)
              <DropdownItem disabled className="d-md-none">
                Signed in as {user?.idir_username}
              </DropdownItem>
            )}
            <DropdownItem onClick={() => authService.logout()}>
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Stack>
    </BCGovHeader>
  );
};
