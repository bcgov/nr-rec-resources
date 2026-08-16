import { ReactNode } from 'react';
import { StyledAccordion } from '../StyledAccordion';
import { formatCurrency } from './formatCurrency';
import './CampsiteCard.scss';

interface CampsiteCardProps {
  eventKey: string;
  description: string;
  totalValue: number;
  children?: ReactNode;
}

export function CampsiteCard({
  eventKey,
  description,
  totalValue,
  children,
}: CampsiteCardProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={false}
      className="campsite-card"
      title={
        <div className="campsite-card__header">
          <span className="campsite-card__description">{description}</span>
          <span className="campsite-card__total-value">
            {formatCurrency(totalValue)} total value
          </span>
        </div>
      }
    >
      {children}
    </StyledAccordion>
  );
}
