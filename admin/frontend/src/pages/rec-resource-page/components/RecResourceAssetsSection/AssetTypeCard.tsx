import { ReactNode } from 'react';
import { CustomBadge, CustomButton } from '@/components';
import {
  COLOR_AMBER_DARK,
  COLOR_AMBER_LIGHT,
  COLOR_BLUE_LIGHT,
  COLOR_BLUE_MED,
} from '@/styles/colors';
import { StyledAccordion } from '../StyledAccordion';
import { formatCurrency } from './formatCurrency';
import './AssetTypeCard.scss';

interface AssetTypeCardProps {
  eventKey: string;
  description: string;
  count: number;
  totalValue: number;
  activeRepairsCount: number;
  children?: ReactNode;
}

export function AssetTypeCard({
  eventKey,
  description,
  count,
  totalValue,
  activeRepairsCount,
  children,
}: AssetTypeCardProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={false}
      className="asset-type-card"
      title={
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
      }
      headerEnd={
        <>
          <div className="asset-type-card__secondary-info">
            {activeRepairsCount > 0 && (
              <span className="asset-type-card__active-repairs">
                <CustomBadge
                  label={String(activeRepairsCount) + ' repairs'}
                  bgColor={COLOR_AMBER_LIGHT}
                  textColor={COLOR_AMBER_DARK}
                />
              </span>
            )}
            <span className="asset-type-card__total-value">
              {formatCurrency(totalValue)} total value
            </span>
          </div>
          <CustomButton
            variant="secondary"
            className="asset-summary-action-btn asset-type-card__bulk-update-btn"
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
