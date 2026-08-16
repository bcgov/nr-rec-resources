import { ReactNode } from 'react';
import { Accordion } from 'react-bootstrap';
import './StyledAccordion.scss';

export interface StyledAccordionProps {
  eventKey: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export const StyledAccordion = ({
  eventKey,
  title,
  children,
  className = '',
  defaultOpen = true,
}: StyledAccordionProps) => (
  <Accordion
    defaultActiveKey={defaultOpen ? eventKey : undefined}
    className={`styled-accordion ${className}`}
  >
    <Accordion.Item eventKey={eventKey} className="styled-accordion__item">
      <Accordion.Header className="styled-accordion__header">
        <span className="styled-accordion__title">{title}</span>
      </Accordion.Header>
      <Accordion.Body>{children}</Accordion.Body>
    </Accordion.Item>
  </Accordion>
);
