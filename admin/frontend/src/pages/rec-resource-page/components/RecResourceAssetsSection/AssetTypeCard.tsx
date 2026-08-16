import { ReactNode } from 'react';
import { CustomBadge } from '@/components';
import { COLOR_BLUE_LIGHT, COLOR_BLUE_MED } from '@/styles/colors';
import { StyledAccordion } from '../StyledAccordion';
import { formatCurrency } from './formatCurrency';
import './AssetTypeCard.scss';

interface AssetTypeCardProps {
  eventKey: string;
  description: string;
  count: number;
  totalValue: number;
  children?: ReactNode;
}

export function AssetTypeCard({
  eventKey,
  description,
  count,
  totalValue,
  children,
}: AssetTypeCardProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={false}
      className="asset-type-card"
      title={
        <div className="asset-type-card__header">
          <div className="asset-type-card__heading">
            <span className="asset-type-card__description">{description}</span>
            <span className="asset-type-card__count">
              <CustomBadge
                label={String(count)}
                bgColor={COLOR_BLUE_LIGHT}
                textColor={COLOR_BLUE_MED}
              />
            </span>
          </div>
          <span className="asset-type-card__total-value">
            {formatCurrency(totalValue)} total value
          </span>
        </div>
      }
    >
      {children}
    </StyledAccordion>
  );
}
