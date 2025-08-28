import { CustomButton } from "@/components";
import {
  REC_RESOURCE_PAGE_NAV_SECTIONS,
  RecResourceNavKey,
} from "@/pages/rec-resource-page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { faBars } from "~/@fortawesome/free-solid-svg-icons";
import "./RecResourceVerticalNav.scss";

interface RecResourceVerticalNavProps {
  activeTab: RecResourceNavKey;
  resourceId: string;
}

export const RecResourceVerticalNav = ({
  activeTab,
  resourceId,
}: RecResourceVerticalNavProps) => {
  const navigate = useNavigate();

  const handleNavSelect = (eventKey: string | null) => {
    if (eventKey) {
      const tabKey = eventKey as RecResourceNavKey;
      const route = REC_RESOURCE_PAGE_NAV_SECTIONS[tabKey].route(resourceId);
      navigate(route);
    }
  };

  const activeTabTitle = REC_RESOURCE_PAGE_NAV_SECTIONS[activeTab].title;

  return (
    <>
      {/* Mobile navigation trigger - visible on small screens */}
      <div className="d-md-none mb-3">
        <Dropdown onSelect={handleNavSelect}>
          <Dropdown.Toggle
            className="rec-resource-vertical-nav__mobile-trigger w-100"
            as={CustomButton}
            rightIcon={<FontAwesomeIcon icon={faBars} />}
          >
            {activeTabTitle}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).map(
              ([key, { title }]) => (
                <Dropdown.Item eventKey={key} key={key}>
                  {title}
                </Dropdown.Item>
              ),
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Desktop vertical nav - hidden on small screens */}
      <Nav
        variant="pills"
        className="flex-column rec-resource-vertical-nav d-none d-md-flex"
        activeKey={activeTab}
        onSelect={handleNavSelect}
      >
        {Object.entries(REC_RESOURCE_PAGE_NAV_SECTIONS).map(
          ([key, { title }]) => (
            <Nav.Item key={key}>
              <Nav.Link eventKey={key}>{title}</Nav.Link>
            </Nav.Item>
          ),
        )}
      </Nav>
    </>
  );
};
