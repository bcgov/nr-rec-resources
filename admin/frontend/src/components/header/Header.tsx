import { CustomButton } from "@/components";
import { Avatar } from "@/components/avatar/Avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { Header as BCGovHeader } from "@bcgov/design-system-react-components";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef, KeyboardEvent, MouseEvent } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Image,
  Stack,
} from "react-bootstrap";
import "./Header.scss";

/**
 * A custom menu toggle component for the header dropdown.
 */
const HeaderMenuToggle = forwardRef<
  HTMLDivElement,
  {
    onClick: (event: MouseEvent | KeyboardEvent) => void;
    className?: string;
    name: string;
  }
>((props, ref) => (
  <div
    ref={ref}
    data-testid="menu-toggle"
    tabIndex={0}
    onClick={(event) => {
      event.preventDefault();
      props.onClick(event);
    }}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        props.onClick(event);
      }
    }}
  >
    <CustomButton
      className={"d-lg-none d-sm-block header__menu-button"}
      leftIcon={<FontAwesomeIcon icon={faBars} />}
    />

    <Avatar
      name={props.name}
      size={50}
      tooltip={false}
      className="d-none d-lg-flex header__avatar"
    />
  </div>
));

/**
 * Renders the HeaderMenuToggle with the user's full name.
 */
const renderMenuToggle = (fullName: string) =>
  forwardRef<
    HTMLDivElement,
    {
      onClick: (event: MouseEvent | KeyboardEvent) => void;
      className?: string;
    }
  >((props, ref) => <HeaderMenuToggle {...props} ref={ref} name={fullName} />);

/**
 * The Header component renders the top-level header with a welcome message and a dropdown menu.
 *
 * @remarks
 * If a user is present, a welcome message is displayed on desktop, while the user's display name is shown in the
 * dropdown on mobile.
 */
export const Header = () => {
  const { user, authService } = useAuthContext();
  const fullName = authService.getUserFullName();
  return (
    <div className={"header"}>
      <BCGovHeader
        title={"Admin Tool"}
        logoImage={
          <>
            <Image
              src="/images/rst-mobile.svg"
              className="d-lg-none d-sm-block header__logo header__logo--mobile"
            />

            <Image
              src="/images/RST_nav_logo.svg"
              className="d-none d-lg-block header__logo"
            />
          </>
        }
      >
        <Stack
          direction={"horizontal"}
          gap={3}
          className={`d-flex justify-content-end align-items-center`}
        >
          {user && <div className="d-none d-lg-block fw-bold">{fullName}</div>}
          <Dropdown>
            <DropdownToggle
              as={renderMenuToggle(fullName)} // use the renderMenuToggle function
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
    </div>
  );
};
