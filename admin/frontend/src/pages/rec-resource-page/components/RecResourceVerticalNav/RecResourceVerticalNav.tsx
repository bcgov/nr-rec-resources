import {
  REC_RESOURCE_PAGE_TABS,
  RecResourceTabKey,
} from "@/pages/rec-resource-page/constants";
import { Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./RecResourceVerticalNav.scss";

interface RecResourceVerticalNavProps {
  activeTab: RecResourceTabKey;
  resourceId: string;
}

export const RecResourceVerticalNav = ({
  activeTab,
  resourceId,
}: RecResourceVerticalNavProps) => {
  const navigate = useNavigate();

  const handleNavSelect = (eventKey: string | null) => {
    if (eventKey) {
      const tabKey = eventKey as RecResourceTabKey;
      const route = REC_RESOURCE_PAGE_TABS[tabKey].route(resourceId);
      navigate(route);
    }
  };

  return (
    <Nav
      variant="pills"
      className="flex-column rec-resource-vertical-nav"
      activeKey={activeTab}
      onSelect={handleNavSelect}
    >
      {Object.entries(REC_RESOURCE_PAGE_TABS).map(([key, { title }]) => (
        <Nav.Item key={key}>
          <Nav.Link eventKey={key}>{title}</Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};
