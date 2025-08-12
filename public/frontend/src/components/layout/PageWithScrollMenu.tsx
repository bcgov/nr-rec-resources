import {
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
  RefObject,
} from 'react';
import useScrollSpy from 'react-use-scrollspy';
import PageMenu from '@/components/layout/PageMenu';
import { Row, Col } from 'react-bootstrap';

export interface PageSection {
  id: string;
  title: string;
  href: string;
  isVisible: boolean;
}

interface PageWithScrollMenuProps {
  sections: PageSection[];
  children: (sectionRefs: RefObject<HTMLElement>[]) => ReactNode;
  className?: string;
  offsetPx?: number;
}

/**
 * A wrapper component that handles scroll behavior and page menu functionality.
 * It manages section refs, scroll spy, and active section state automatically.
 */
export const PageWithScrollMenu: React.FC<PageWithScrollMenuProps> = ({
  sections,
  children,
  className = '',
  offsetPx = -100,
}) => {
  // Get visible sections
  const visibleSections = useMemo(() => {
    return sections.filter((section) => section.isVisible);
  }, [sections]);

  // Use a ref to store an array of refs - this is a common React pattern
  const sectionRefs = useRef<RefObject<HTMLElement>[]>([]);

  // Initialize/update refs array when visible sections change
  useMemo(() => {
    sectionRefs.current = visibleSections.map(
      (_, index) => sectionRefs.current[index] || { current: null },
    );
  }, [visibleSections]);

  // Create page sections array for PageMenu
  const pageSections = useMemo(() => {
    return visibleSections.map((section, index) => ({
      sectionIndex: index,
      href: section.href,
      title: section.title,
    }));
  }, [visibleSections]);

  // Use scroll spy to track active section
  const activeScrollSection = useScrollSpy({
    sectionElementRefs: sectionRefs.current,
    offsetPx,
  });

  const [activeSection, setActiveSection] = useState<number | undefined>(0);

  useEffect(() => {
    setActiveSection(activeScrollSection);
  }, [activeScrollSection]);

  const handleMenuClick = (sectionIndex: number) => {
    setActiveSection(sectionIndex);
    const sectionRef = sectionRefs.current[sectionIndex];
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Row className={className}>
      <Col className={`${className}-side-bar`} md={3}>
        <PageMenu
          pageSections={pageSections}
          activeSection={activeSection}
          onMenuClick={handleMenuClick}
        />
      </Col>
      <Col className={`${className}-content`} md={9}>
        {children(sectionRefs.current)}
      </Col>
    </Row>
  );
};
