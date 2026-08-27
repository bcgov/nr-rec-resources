import { ReactNode } from 'react';
import { StyledAccordion } from '../StyledAccordion';
import { formatCurrency } from './formatCurrency';
import './CampsiteCard.scss';

interface CampsiteCardProps {
  eventKey: string;
  description: string;
  structureCount: number;
  totalValue: number;
  children?: ReactNode;
}

export function CampsiteCard({
  eventKey,
  description,
  structureCount,
  totalValue,
  children,
}: CampsiteCardProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={false}
      className="campsite-card"
      title={<span className="campsite-card__description">{description}</span>}
      headerEnd={
        <>
          <div className="campsite-card__secondary-info">
            <span className="campsite-card__secondary-info-text">
              {structureCount} asset{structureCount === 1 ? '' : 's'}
            </span>
            <span
              className="campsite-card__secondary-info-separator"
              aria-hidden="true"
            >
              •
            </span>
            <span className="campsite-card__secondary-info-text">
              {formatCurrency(totalValue)} total value
            </span>
          </div>
        </>
      }
    >
      {children}
    </StyledAccordion>
  );
}
