import { Card, Col, Row } from 'react-bootstrap';
import { formatDateReadable } from '@shared/utils';
import { HelpIcon } from '@/components';
import { SummaryCard } from './SummaryCard';
import { formatCurrency } from './formatCurrency';
import type { AssetSummary } from './types';
import resourceInspection from '@shared/assets/icons/asset-type.svg';
import dangerTreeAssessment from '@shared/assets/icons/danger-tree-inspection.svg';

interface AssetSummaryCardsProps {
  summary: AssetSummary;
  isLoading?: boolean;
}

const TOTAL_VALUE_HELP_TEXT = (
  <>
    <p className="mb-2">
      <strong>Total value</strong> is the sum of &lsquo;actual value&rsquo; when
      available, or &lsquo;default value&rsquo; when not.
    </p>
    <p className="mb-2">
      <strong>Actual value</strong> is the real amount paid (or donated value)
      for this specific asset.
    </p>
    <p className="mb-0">
      <strong>Default value</strong> is the estimated cost to replace this asset
      today using provincial standard rates.
    </p>
  </>
);

export function AssetSummaryCards({
  summary,
  isLoading,
}: AssetSummaryCardsProps) {
  if (isLoading) {
    return (
      <Row className="g-3 row-cols-1 row-cols-sm-2 row-cols-xl-4">
        {[0, 1, 2, 3].map((i) => (
          <Col key={i}>
            <Card className="h-100">
              <Card.Body>
                <div className="summary-card__title placeholder-glow">
                  <span className="placeholder col-6" />
                </div>
                <div className="summary-card__value placeholder-glow mt-2">
                  <span className="placeholder col-4" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row className="g-3 row-cols-1 row-cols-sm-2 row-cols-xl-4">
      <Col>
        <SummaryCard
          title="Assets"
          subtitle={
            summary.total_campsites > 0
              ? `${summary.total_campsites} campsites`
              : undefined
          }
        >
          <div className="summary-card__value">{summary.total_assets}</div>
        </SummaryCard>
      </Col>

      <Col>
        <SummaryCard
          title={
            <>
              Total value
              <HelpIcon
                id="asset-summary-total-value"
                text={TOTAL_VALUE_HELP_TEXT}
              />
            </>
          }
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
