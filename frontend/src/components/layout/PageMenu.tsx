import '@/components/layout/PageMenu.scss';

type PageSection = {
  sectionIndex: number;
  href: string;
  title: string;
};

type PageMenuProps = {
  pageSections: PageSection[];
  activeSection: number;
  menuStyle: 'nav' | 'select';
};

const PageMenu: React.FC<PageMenuProps> = ({
  pageSections,
  activeSection,
  menuStyle,
}) => {
  if (menuStyle === 'nav') {
    return (
      <nav
        id="section-navbar"
        aria-label="Page section navigation"
        className="navbar"
      >
        {pageSections.map((section) => {
          const { href, sectionIndex, title } = section;
          return (
            <a
              className={`nav-link ${activeSection === sectionIndex ? 'active' : ''}`}
              data-active-section={
                activeSection === sectionIndex ? 'true' : 'false'
              }
              key={href}
              href={href}
            >
              {title}
            </a>
          );
        })}
      </nav>
    );
  }

  if (menuStyle === 'select') {
    const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const index = e.target.value;
      const selectedSection = pageSections.find(
        (section) => section.sectionIndex === Number(index),
      );
      if (selectedSection) {
        window.location.hash = selectedSection.href;
      }
    };

    return (
      <div className="section-select-container">
        <select
          className="section-select"
          value={activeSection}
          onChange={handleSectionChange}
          title="mobile-navigation"
        >
          <option value="" disabled>
            Table of Contents
          </option>
          {pageSections.map((section) => {
            const { title, sectionIndex } = section;
            return (
              <option key={title} value={sectionIndex}>
                {title}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return null;
};

export default PageMenu;
