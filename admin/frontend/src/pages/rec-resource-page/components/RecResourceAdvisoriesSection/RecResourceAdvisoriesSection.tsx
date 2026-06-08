import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Stack } from 'react-bootstrap';
import { RecreationResourceAdvisoryDto } from '@/services/recreation-resource-admin';
import { AdvisoryCard } from './AdvisoryCard';
import './RecResourceAdvisoriesSection.scss';

type RecResourceAdvisoriesSectionProps = {
  advisories: RecreationResourceAdvisoryDto[];
};

export const RecResourceAdvisoriesSection = ({
  advisories,
}: RecResourceAdvisoriesSectionProps) => {
  const staffAdminUrl = import.meta.env.VITE_STAFF_ADMIN_URL ?? '';
  const actToolHref = `${staffAdminUrl}/public-advisories`;

  return (
    <Stack direction="vertical" gap={4}>
      <div>
        <h2 className="mb-2">Advisories and closures</h2>
        <p className="mb-3">
          Use the Advisories and Closures Tool to edit or remove the existing
          closure, or to manage closures for individual recreation sites and
          trails or apply bulk closures across multiple resources.
        </p>
        <a
          href={actToolHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary advisories-action-btn gap-2"
        >
          Advisories and Closures Tool
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} aria-hidden="true" />
        </a>
      </div>

      {advisories.length === 0 ? (
        <div className="bg-light p-3 rounded text-muted">
          No active advisories or closures
        </div>
      ) : (
        <Stack direction="vertical" gap={3}>
          {advisories.map((advisory) => (
            <AdvisoryCard
              key={advisory.advisory_number}
              advisory={advisory}
              staffAdminUrl={staffAdminUrl}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
