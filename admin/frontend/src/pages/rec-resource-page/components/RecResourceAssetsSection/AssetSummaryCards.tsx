import { Col, Row } from 'react-bootstrap';
import { formatDateReadable } from '@shared/utils';
import { SummaryCard } from './SummaryCard';
import type { AssetSummary } from './types';
import resourceInspection from '@shared/assets/icons/asset-type.svg';
import dangerTreeAssessment from '@shared/assets/icons/danger-tree-inspection.svg';

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

interface AssetSummaryCardsProps {
  summary: AssetSummary;
  showStructuresCard: boolean;
}

export function AssetSummaryCards({
  summary,
  showStructuresCard,
}: AssetSummaryCardsProps) {
  return (
    <Row className="g-3 row-cols-1 row-cols-sm-2 row-cols-xl-4">
      {showStructuresCard ? (
        <Col>
          <SummaryCard
            title="Structures"
            subtitle={`${summary.total_campsites} campsites`}
          >
            <div className="summary-card__value">{summary.total_assets}</div>
          </SummaryCard>
        </Col>
      ) : null}

      <Col>
        <SummaryCard
          title="Total value"
          subtitle="Actual value, default if unset"
        >
          <div className="summary-card__value">
            {formatCurrency(summary.total_value)}
          </div>
        </SummaryCard>
      </Col>

      <Col>
        <SummaryCard
          title="Outstanding repairs"
          subtitle={`${formatCurrency(summary.spent_to_date)} spent to date`}
        >
          <div className="summary-card__value">
            {summary.outstanding_repairs}
          </div>
        </SummaryCard>
      </Col>

      <Col>
        <SummaryCard title="Last inspected">
          <div className="summary-card__meta">
            <div>
              <img
                alt="Resource inspection icon"
                src={resourceInspection}
                height={16}
                width={15}
                className="me-2"
              />
              <span className="summary-card__meta-label">Resource:</span>{' '}
              {formatDateReadable(summary.last_inspection_date) ??
                'No inspection recorded'}
            </div>
            <div>
              <img
                alt="Danger tree assessment icon"
                src={dangerTreeAssessment}
                height={16}
                width={15}
                className="me-2"
              />
              <span className="summary-card__meta-label">Danger tree:</span>{' '}
              {formatDateReadable(summary.last_hzd_tree_assessment_date) ??
                'No inspection recorded'}
            </div>
          </div>
        </SummaryCard>
      </Col>
    </Row>
  );
}
