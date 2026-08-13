import { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import './SummaryCard.scss';

interface SummaryCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SummaryCard({ title, subtitle, children }: SummaryCardProps) {
  return (
    <Card className="h-100">
      <Card.Body
        className="d-flex flex-row flex-sm-column justify-content-between
          justify-content-sm-start align-items-start"
      >
        <div>
          <div className="summary-card__title">{title}</div>
          {subtitle ? (
            <div className="summary-card__subtitle mt-1">{subtitle}</div>
          ) : null}
        </div>
        <div className="mt-sm-1">{children}</div>
      </Card.Body>
    </Card>
  );
}
