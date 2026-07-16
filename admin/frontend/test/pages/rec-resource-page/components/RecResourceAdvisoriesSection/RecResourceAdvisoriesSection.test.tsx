import { RecResourceAdvisoriesSection } from '@/pages/rec-resource-page/components/RecResourceAdvisoriesSection/RecResourceAdvisoriesSection';
import { RecreationResourceAdvisoryDto } from '@/services/recreation-resource-admin';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdvisoriesSection/AdvisoryCard',
  () => ({
    AdvisoryCard: ({
      advisory,
    }: {
      advisory: RecreationResourceAdvisoryDto;
    }) => (
      <div
        data-testid="advisory-card"
        data-advisory-number={advisory.advisory_number}
      >
        Advisory {advisory.advisory_number}
      </div>
    ),
  }),
);

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon?.iconName ?? String(icon)}
      {...props}
    />
  ),
}));

const makeAdvisory = (
  advisory_number: number,
): RecreationResourceAdvisoryDto => ({
  advisory_number,
  event_type: 'General Public Safety',
  access_status_name: 'Closure',
  advisory_status: 'Published',
  urgency: 'High',
  advisory_date: new Date('2027-01-01T00:00:00Z'),
  effective_date: new Date('2027-01-01T00:00:00Z'),
  end_date: null,
  expiry_date: null,
  updated_date: new Date('2027-01-15T00:00:00Z'),
  published_at: null,
  submitted_by: 'Jane Doe',
  is_advisory_date_displayed: true,
  is_effective_date_displayed: true,
  is_end_date_displayed: false,
  is_updated_date_displayed: true,
});

describe('RecResourceAdvisoriesSection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('section heading and description', () => {
    it('renders section heading', () => {
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      expect(
        screen.getByRole('heading', { name: /advisories and closures/i }),
      ).toBeInTheDocument();
    });

    it('renders description text about using the ACT tool', () => {
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      expect(
        screen.getByText(/use the advisories and closures tool/i),
      ).toBeInTheDocument();
    });
  });

  describe('ACT Tool button', () => {
    it('renders link with correct href when env var is set', () => {
      vi.stubEnv('VITE_STAFF_ADMIN_URL', 'https://alpha-test-staff.bcparks.ca');
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      const link = screen.getByRole('link', {
        name: /advisories and closures tool/i,
      });
      expect(link).toHaveAttribute(
        'href',
        'https://alpha-test-staff.bcparks.ca/?idp=idir',
      );
    });

    it('renders link with /public-advisories fallback when env var is empty', () => {
      vi.stubEnv('VITE_STAFF_ADMIN_URL', '');
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      const link = screen.getByRole('link', {
        name: /advisories and closures tool/i,
      });
      expect(link).toHaveAttribute('href', '/?idp=idir');
    });

    it('opens ACT Tool link in a new tab', () => {
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      const link = screen.getByRole('link', {
        name: /advisories and closures tool/i,
      });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('empty state', () => {
    it('renders empty state message when advisories array is empty', () => {
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      expect(
        screen.getByText('No active advisories or closures'),
      ).toBeInTheDocument();
    });

    it('does not render any advisory cards when advisories is empty', () => {
      render(<RecResourceAdvisoriesSection advisories={[]} />);
      expect(screen.queryByTestId('advisory-card')).not.toBeInTheDocument();
    });
  });

  describe('with advisories', () => {
    it('renders an AdvisoryCard for each advisory', () => {
      render(
        <RecResourceAdvisoriesSection
          advisories={[
            makeAdvisory(1001),
            makeAdvisory(1002),
            makeAdvisory(1003),
          ]}
        />,
      );
      expect(screen.getAllByTestId('advisory-card')).toHaveLength(3);
    });

    it('does not show empty state when advisories are present', () => {
      render(
        <RecResourceAdvisoriesSection advisories={[makeAdvisory(1001)]} />,
      );
      expect(
        screen.queryByText('No active advisories or closures'),
      ).not.toBeInTheDocument();
    });

    it('passes advisory_number to each card', () => {
      render(
        <RecResourceAdvisoriesSection
          advisories={[makeAdvisory(2001), makeAdvisory(2002)]}
        />,
      );
      expect(screen.getByText('Advisory 2001')).toBeInTheDocument();
      expect(screen.getByText('Advisory 2002')).toBeInTheDocument();
    });

    it('renders exactly one card for a single advisory', () => {
      render(
        <RecResourceAdvisoriesSection advisories={[makeAdvisory(3001)]} />,
      );
      expect(screen.getAllByTestId('advisory-card')).toHaveLength(1);
    });
  });
});
