import '@/components/layout/PageMenu.scss';
import { trackClickEvent } from '@shared/utils';
import {
  MATOMO_CATEGORY_SECTION_MENU_NAV,
  MATOMO_ACTION_CLICK,
} from '@/constants/analytics';

type PageSection = {
  sectionIndex: number;
  href: string;
  title: string;
};

type PageMenuProps = {
  pageSections: PageSection[];
  activeSection?: number;
  onMenuClick?: (sectionIndex: number) => void; // Added optional prop for click handler
};

const PageMenu: React.FC<PageMenuProps> = ({
  pageSections,
  activeSection = 0,
  onMenuClick,
}) => {
  return (
    <nav
      id="section-navbar"
      aria-label="Page section navigation"
      className="page-menu"
    >
      <span className="menu-header">On this page</span>
      <ul>
        {pageSections.map((section) => {
          const { href, sectionIndex, title } = section;
          return (
            <li key={href}>
              <a
                className={`nav-link ${activeSection === sectionIndex ? 'active' : ''}`}
                data-active-section={
                  activeSection === sectionIndex ? 'true' : 'false'
                }
                onClick={() => {
                  const trackClickEventHandler = trackClickEvent({
                    category: MATOMO_CATEGORY_SECTION_MENU_NAV,
                    action: MATOMO_ACTION_CLICK,
                    name: title,
                  });
                  trackClickEventHandler();
                  onMenuClick?.(sectionIndex);
                }}
                href={href}
              >
                {title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default PageMenu;
