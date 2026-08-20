import { ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import './SummaryCard.scss';

interface SummaryCardProps {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

export function SummaryCard({ title, subtitle, children }: SummaryCardProps) {
  return (
    <Card className="h-100">
      <Card.Body className="summary-card__body">
        <div className="summary-card__title">{title}</div>
        <div className="summary-card__value-slot mt-sm-1">{children}</div>
        {subtitle ? (
          <div className="summary-card__subtitle mt-1">{subtitle}</div>
        ) : null}
      </Card.Body>
    </Card>
  );
}
