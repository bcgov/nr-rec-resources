import { ReactNode } from 'react';
import { Accordion } from 'react-bootstrap';
import './StyledAccordion.scss';

export interface StyledAccordionProps {
  eventKey: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  /**
   * When provided, puts the accordion into controlled mode.
   * Pass the eventKey to open it, or undefined to close it.
   * Overrides defaultOpen.
   */
  activeKey?: string;
  headerEnd?: ReactNode;
}

export const StyledAccordion = ({
  eventKey,
  title,
  children,
  className = '',
  defaultOpen = true,
  activeKey,
  headerEnd,
}: StyledAccordionProps) => {
  const controlledProps =
    activeKey !== undefined
      ? { activeKey }
      : { defaultActiveKey: defaultOpen ? eventKey : undefined };

  return (
    <Accordion {...controlledProps} className={`styled-accordion ${className}`}>
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
};
