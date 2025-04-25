import '@/components/layout/PageMenu.scss';

type PageSection = {
  sectionIndex: number;
  href: string;
  title: string;
};

type PageMenuProps = {
  pageSections: PageSection[];
  activeSection: number;
};

const PageMenu: React.FC<PageMenuProps> = ({ pageSections, activeSection }) => {
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
