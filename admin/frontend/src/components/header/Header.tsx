import { Header as BCGovHeader } from "@bcgov/design-system-react-components";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Image,
  Stack,
} from "react-bootstrap";
import { forwardRef, KeyboardEvent, MouseEvent } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import "./Header.scss";
import { Avatar } from "@/components/avatar/Avatar";

/**
 * A custom menu toggle component for the header dropdown.
 */
const HeaderMenuToggle = forwardRef<
  HTMLDivElement,
  {
    onClick: (event: MouseEvent | KeyboardEvent) => void;
    className?: string;
    name: string;
    isMobile: boolean;
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
    {props.isMobile ? (
      <button type="button" className="btn btn-outline-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-list"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
          ></path>
        </svg>
      </button>
    ) : (
      <Avatar name={props.name} size={50} tooltip={false} />
    )}
  </div>
));

/**
 * Renders the HeaderMenuToggle with the user's full name.
 */
const renderMenuToggle = (fullName: string, isMobile: boolean) =>
  forwardRef<
    HTMLDivElement,
    {
      onClick: (event: MouseEvent | KeyboardEvent) => void;
      className?: string;
    }
  >((props, ref) => (
    <HeaderMenuToggle
      {...props}
      ref={ref}
      name={fullName}
      isMobile={isMobile}
    />
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
  const fullName = authService.getUserFullName();
  const isMobile = useMediaQuery("(max-width: 767px)");
  return (
    <div className={"header-container"}>
      <BCGovHeader
        logoImage={
          isMobile ? (
            <Image src="/images/rst-mobile.svg" className="logo-mobile" />
          ) : (
            <Image src="/images/RST_nav_logo.svg" className="logo" />
          )
        }
      >
        <div className="admin-title">Admin Tool</div>
        <Stack
          direction={"horizontal"}
          gap={3}
          className={`${isMobile ? "w-25" : "w-100"} d-flex justify-content-end align-items-center`}
        >
          {user && (
            <div className="d-none d-md-block full-name">{fullName}</div>
          )}
          <Dropdown>
            <DropdownToggle
              as={renderMenuToggle(fullName, isMobile)} // use the renderMenuToggle function
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
