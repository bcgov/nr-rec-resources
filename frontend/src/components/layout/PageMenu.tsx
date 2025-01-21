import '@/components/layout/PageMenu.scss';

type PageSection = {
  sectionIndex: number;
  link: string;
  display: string;
  visible: boolean;
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
        {pageSections
          .filter((s) => s.visible)
          .map((section) => (
            <a
              className={`nav-link ${activeSection === section.sectionIndex ? 'active' : ''}`}
              data-active-section={
                activeSection === section.sectionIndex ? 'true' : 'false'
              }
              key={section.sectionIndex}
              href={section.link}
            >
              {section.display}
            </a>
          ))}
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
          {pageSections
            .filter((s) => s.visible)
            .map((section) => (
              <option key={section.sectionIndex} value={section.sectionIndex}>
                {section.display}
              </option>
            ))}
        </select>
      </div>
    );
  }

  return null;
};

export default PageMenu;
