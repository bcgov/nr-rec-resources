import { ReactNode } from 'react';
import { CustomButton } from '@/components';
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
              {structureCount} structures
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
          <CustomButton
            variant="secondary"
            className="asset-summary-action-btn campsite-card__bulk-update-btn"
          >
            Bulk update
          </CustomButton>
        </>
      }
    >
      {children}
    </StyledAccordion>
  );
}
