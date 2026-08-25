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
  isEditing?: boolean;
  isDisabled?: boolean;
  isSaving?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export function AssetTypeCard({
  eventKey,
  description,
  count,
  totalValue,
  activeRepairsCount,
  children,
  isEditing = false,
  isDisabled = false,
  isSaving = false,
  onEdit,
  onSave,
  onCancel,
}: AssetTypeCardProps) {
  return (
    <StyledAccordion
      eventKey={eventKey}
      defaultOpen={isEditing}
      className={`asset-type-card${
        isEditing ? ' asset-type-card--editing' : ''
      }`}
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
          {isEditing ? (
            <div className="d-flex gap-2">
              <CustomButton
                variant="outline-primary"
                className="asset-summary-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
                disabled={isSaving}
              >
                Cancel
              </CustomButton>
              <CustomButton
                variant="primary"
                className="asset-summary-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.();
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </CustomButton>
            </div>
          ) : (
            <CustomButton
              variant="secondary"
              className="asset-summary-action-btn asset-type-card__bulk-update-btn"
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              Edit
            </CustomButton>
          )}
        </>
      }
    >
      {children}
    </StyledAccordion>
  );
}
