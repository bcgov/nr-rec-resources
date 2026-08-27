import { ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { CustomBadge } from '@/components';
import {
  COLOR_AMBER_DARK,
  COLOR_AMBER_LIGHT,
  COLOR_BLUE_LIGHT,
  COLOR_BLUE_MED,
} from '@/styles/colors';
import { StyledAccordion } from '../StyledAccordion';
import { formatCurrency } from './formatCurrency';
import './AssetTypeCard.scss';

interface AssetTypeCardEditProps {
  eventKey: string;
  description: string;
  count: number;
  totalValue: number;
  activeRepairsCount: number;
  children?: ReactNode;
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function AssetTypeCardEdit({
  eventKey,
  description,
  count,
  totalValue,
  activeRepairsCount,
  children,
  onCancel,
  onSave,
  isSaving = false,
}: AssetTypeCardEditProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={true}
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
                  label={`${activeRepairsCount} repair${activeRepairsCount === 1 ? '' : 's'}`}
                  bgColor={COLOR_AMBER_LIGHT}
                  textColor={COLOR_AMBER_DARK}
                />
              </span>
            )}
            <span className="asset-type-card__total-value">
              {formatCurrency(totalValue)} total value
            </span>
          </div>
          <div className="asset-type-card__edit-actions">
            <Button
              variant="outline-primary"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </>
      }
    >
      {children}
    </StyledAccordion>
  );
}
