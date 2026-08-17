import { useState } from 'react';
import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDateReadable } from '@shared/utils';
import { CustomButton } from '@/components';
import { formatCurrency } from './formatCurrency';
import { MOCK_REPAIR_CODES } from './mockData';
import type { AssetRepair } from './types';
import './AssetCardRepairs.scss';

interface AssetCardRepairsProps {
  repairs: AssetRepair[];
}

interface RepairField {
  label: string;
  value: string | null;
}

function getRepairTitle(repair: AssetRepair): string | null {
  return (
    MOCK_REPAIR_CODES.find(
      (code) => code.repair_code === repair.recreation_remed_repair_code,
    )?.description ?? null
  );
}

function getRepairFields(repair: AssetRepair): RepairField[] {
  const fields: RepairField[] = [
    {
      label: 'Estimated cost',
      value:
        repair.estimated_repair_cost != null
          ? formatCurrency(repair.estimated_repair_cost)
          : null,
    },
    {
      label: 'Actual cost',
      value:
        repair.actual_repair_cost != null
          ? formatCurrency(repair.actual_repair_cost)
          : null,
    },
    {
      label: 'Completed date',
      value: formatDateReadable(repair.repair_completed_date),
    },
  ];

  return fields.filter((field) => !!field.value);
}

export function AssetCardRepairs({ repairs }: AssetCardRepairsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleRepairs = repairs
    .map((repair) => ({ repair, title: getRepairTitle(repair) }))
    .filter(
      (entry): entry is { repair: AssetRepair; title: string } => !!entry.title,
    );

  return (
    <div className="asset-card-repairs">
      <button
        type="button"
        aria-label={isExpanded ? 'Hide repairs' : 'Show repairs'}
        aria-expanded={isExpanded}
        className="btn btn-link expand-link asset-card__expand-link"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        {isExpanded ? 'Hide repairs' : 'Show repairs'}
        <FontAwesomeIcon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="ms-2"
        />
      </button>

      {isExpanded && (
        <div className="asset-card-repairs__expandable">
          {visibleRepairs.length > 0 ? (
            <div className="asset-card-repairs__list">
              {visibleRepairs.map(({ repair, title }) => {
                const fields = getRepairFields(repair);
                return (
                  <div
                    key={repair.repair_id}
                    className="asset-card-repairs__item"
                  >
                    <div className="asset-card-repairs__item-title">
                      {title}
                    </div>
                    {fields.length > 0 && (
                      <div className="asset-card-repairs__item-fields">
                        {fields.map((field) => (
                          <span
                            key={field.label}
                            className="asset-card-repairs__item-field"
                          >
                            <span className="asset-card-repairs__item-field-label">
                              {field.label}:
                            </span>{' '}
                            {field.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="asset-card-repairs__empty">
              This asset has no repairs
            </div>
          )}

          <CustomButton
            variant="secondary"
            className="asset-summary-action-btn asset-card-repairs__add-btn"
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Add repair
          </CustomButton>
        </div>
      )}
    </div>
  );
}
