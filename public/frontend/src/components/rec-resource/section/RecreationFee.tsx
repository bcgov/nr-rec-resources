import { useId, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { RecreationFeeModel } from '@/service/custom-models';
import {
  formatDateFull,
  formatFeeDays,
  formatRecurringMonthDay,
  getFeeTypeLabel,
} from '@shared/utils';
import './RecreationFee.scss';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import {
  faCircleDollar,
  faCampground,
} from '@fortawesome/pro-regular-svg-icons';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

type RecreationFeeViewModel = RecreationFeeModel & {
  fee_description?: string | null;
  fee_sub_type_description?: string | null;
  fee_start_date?: Date | string | number | null;
  fee_end_date?: Date | string | number | null;
  recurring_start_mmdd?: string | null;
  recurring_end_mmdd?: string | null;
  recreation_fee_sub_code?: string | null;
};

interface RecreationFeeListProps {
  data: RecreationFeeViewModel[];
  campsite_count?: number;
  /**
   * When provided, drives the expand/collapse state of all items at once.
   * Per-item toggling still works after the parent state changes (until
   * the parent flips `expandAll` again, which re-syncs all items).
   */
  expandAll?: boolean;
  /**
   * Fires when individual chevron toggles change whether ALL items are
   * expanded. Lets the parent keep its bulk "Expand all / Collapse all"
   * button label in sync with the actual state of the items below it.
   */
  onAllExpandedChange?: (allExpanded: boolean) => void;
}

const getFeeSubTypeLabel = (fee: RecreationFeeViewModel): string => {
  if (fee.fee_sub_type_description) {
    return fee.fee_sub_type_description;
  }
  return (
    fee.recreation_fee_sub_code || getFeeTypeLabel(fee.recreation_fee_code)
  );
};

const getFeeAppliesToDateLabel = (fee: RecreationFeeViewModel): string => {
  const hasRecurring =
    fee.recurring_ind && (fee.recurring_start_mmdd || fee.recurring_end_mmdd);
  const hasStartEnd = [fee.fee_start_date, fee.fee_end_date].some(
    (d) => d && new Date(d).getTime() > 0,
  );

  if (!hasRecurring && !hasStartEnd) return 'Always';

  if (hasRecurring) {
    return `${formatRecurringMonthDay(fee.recurring_start_mmdd)} - ${formatRecurringMonthDay(fee.recurring_end_mmdd)}`;
  }

  const fmt = (d: RecreationFeeViewModel['fee_start_date']) =>
    d && new Date(d).getTime() > 0 ? (formatDateFull(d) ?? '--') : '--';

  return `${fmt(fee.fee_start_date)} - ${fmt(fee.fee_end_date)}`;
};

const getBulkExpandedIndices = (
  expandAll: boolean | undefined,
  count: number,
): Set<number> =>
  expandAll ? new Set(Array.from({ length: count }, (_, i) => i)) : new Set();

interface FeeAppliesColumnProps {
  icon: IconDefinition;
  iconClassName: string;
  title: string;
  titleClassName: string;
  value: string;
  valueClassName: string;
}

const FeeAppliesColumn: React.FC<FeeAppliesColumnProps> = ({
  icon,
  iconClassName,
  title,
  titleClassName,
  value,
  valueClassName,
}) => (
  <div className="fee-applies-column">
    <div className="fee-applies-header">
      <FontAwesomeIcon icon={icon} className={iconClassName} />
      <div className="fee-applies-content">
        <h5 className={titleClassName}>{title}</h5>
        <p className={valueClassName}>{value}</p>
      </div>
    </div>
  </div>
);

const RecreationFee: React.FC<RecreationFeeListProps> = ({
  data,
  campsite_count = 0,
  expandAll,
  onAllExpandedChange,
}) => {
  const fees = Array.isArray(data) ? data : [];
  const idPrefix = useId();
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(() =>
    getBulkExpandedIndices(expandAll, fees.length),
  );

  const [prevExpandAll, setPrevExpandAll] = useState(expandAll);
  if (expandAll !== prevExpandAll) {
    setPrevExpandAll(expandAll);
    if (expandAll !== undefined) {
      setExpandedIndices(getBulkExpandedIndices(expandAll, fees.length));
    }
  }

  const toggleItem = (index: number) => {
    const next = new Set(expandedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setExpandedIndices(next);

    if (onAllExpandedChange) {
      const nowAllExpanded = fees.length > 0 && next.size === fees.length;
      if (nowAllExpanded !== expandAll) {
        setPrevExpandAll(nowAllExpanded);
        onAllExpandedChange(nowAllExpanded);
      }
    }
  };

  const isSingleFee = fees.length === 1;

  const isAllCollapsed = !isSingleFee && expandedIndices.size === 0;

  return (
    <div className="fee-groups">
      <article
        className={`fee-card ${isAllCollapsed ? 'is-all-collapsed' : 'has-expanded'}`}
      >
        <div className="fee-card-content">
          {fees.map((fee, index) => {
            const feeSubTypeLabel = getFeeSubTypeLabel(fee);
            const days = formatFeeDays(fee);
            const isNotLastFee = index < fees.length - 1;

            const isExpanded = isSingleFee || expandedIndices.has(index);
            const contentId = `${idPrefix}fee-item-${index}`;

            return (
              <div
                key={`${fee.recreation_fee_sub_code ?? 'general'}-${index}`}
                className={`fee-item ${isExpanded ? 'is-expanded' : 'is-collapsed'} ${isNotLastFee ? 'with-item-divider' : ''}`}
              >
                {isSingleFee ? (
                  <div className="fee-item-header">
                    <h4 className="fee-card-title">{feeSubTypeLabel} fees</h4>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="fee-item-toggle"
                    onClick={() => toggleItem(index)}
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                  >
                    <h4 className="fee-card-title">{feeSubTypeLabel} fees</h4>
                    <FontAwesomeIcon
                      icon={faChevronUp}
                      className={`fee-item-chevron ${isExpanded ? 'expanded' : 'collapsed'}`}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {isExpanded && (
                  <div id={contentId} className="fee-item-content">
                    {/* Fee Applies Section - Date Range at Top */}
                    <div className="fee-applies-section">
                      {/* Left Column: Fee applies */}
                      <FeeAppliesColumn
                        icon={faCalendar}
                        iconClassName="fee-applies-icon"
                        title="Fee applies"
                        titleClassName="fee-applies-title"
                        value={getFeeAppliesToDateLabel(fee)}
                        valueClassName="fee-applies-date"
                      />

                      {/* Right Column: Campsites - only for camping fees */}
                      {fee.recreation_fee_sub_code === 'C' &&
                        campsite_count > 0 && (
                          <FeeAppliesColumn
                            icon={faCampground}
                            iconClassName="fee-applies-campsites-icon"
                            title="Campsites"
                            titleClassName="fee-applies-campsites-title"
                            value={`${campsite_count} campsites`}
                            valueClassName="fee-applies-campsites-count"
                          />
                        )}
                    </div>

                    {/* Fee Section with Table */}
                    <div className="fee-section">
                      <div className="fee-section-header">
                        <FontAwesomeIcon
                          icon={faCircleDollar}
                          className="fee-section-icon"
                        />
                        <h5 className="fee-section-title">Fee</h5>
                      </div>
                      <table
                        className="fee-table"
                        aria-label={`${feeSubTypeLabel} fee table`}
                      >
                        <thead className="visually-hidden">
                          <tr>
                            <th scope="col">Item</th>
                            <th scope="col">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="fee-table-row-days">
                            <th scope="row" className="fee-table-label">
                              Days applied
                            </th>
                            <td className="fee-table-value">{days}</td>
                          </tr>
                          <tr className="fee-table-row-amount">
                            <th scope="row" className="fee-subtype-label">
                              {feeSubTypeLabel}
                            </th>
                            <td>${fee.fee_amount?.toFixed(2) ?? '0.00'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
};

export default RecreationFee;
