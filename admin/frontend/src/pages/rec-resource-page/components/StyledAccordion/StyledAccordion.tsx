import { ReactNode } from 'react';
import { Accordion } from 'react-bootstrap';
import './StyledAccordion.scss';

export interface StyledAccordionProps {
  eventKey: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  // Rendered as a sibling of the toggle button (not inside it), so it can
  // hold its own interactive elements (e.g. buttons) without nesting inside
  // and without accidentally toggling — the accordion's own button.
  headerEnd?: ReactNode;
}

export const StyledAccordion = ({
  eventKey,
  title,
  children,
  className = '',
  defaultOpen = true,
  headerEnd,
}: StyledAccordionProps) => (
  <Accordion
    defaultActiveKey={defaultOpen ? eventKey : undefined}
    className={`styled-accordion ${className}`}
  >
    <Accordion.Item eventKey={eventKey} className="styled-accordion__item">
      <div className="styled-accordion__header-row">
        <Accordion.Header className="styled-accordion__header">
          <span className="styled-accordion__title">{title}</span>
        </Accordion.Header>
        {headerEnd}
      </div>
      <Accordion.Body>{children}</Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
