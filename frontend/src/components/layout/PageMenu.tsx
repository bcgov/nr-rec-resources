import '@/components/layout/PageMenu.scss';

type PageSection = {
  sectionIndex: number;
  link: string;
  display: string;
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
          const { display, link, sectionIndex } = section;
          return (
            <a
              className={`nav-link ${activeSection === sectionIndex ? 'active' : ''}`}
              data-active-section={
                activeSection === sectionIndex ? 'true' : 'false'
              }
              key={link}
              href={link}
            >
              {display}
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
        window.location.hash = selectedSection.link;
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
            const { display, sectionIndex } = section;
            return (
              <option key={display} value={sectionIndex}>
                {display}
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
