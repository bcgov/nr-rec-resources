import { ResourceHeaderSection } from '@/pages/rec-resource-page/components/ResourceHeaderSection';
import { RecreationResourceDetailUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuthorizations = vi.fn();

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

vi.mock('@/components', () => ({
  CustomBadge: ({ label }: any) => (
    <span data-testid="custom-badge">{label}</span>
  ),
  AdminStatusBadge: ({ label }: any) => (
    <span data-testid="admin-status-badge">{label}</span>
  ),
  FileStatusBadge: ({ code, label }: any) => {
    if (!code) return null;
    return (
      <span data-testid="file-status-badge" data-code={code}>
        {label ?? code}
      </span>
    );
  },
  PublicAccessStatusBadge: ({ label }: any) => (
    <span data-testid="public-access-status-badge">{label}</span>
  ),
  PUBLIC_ACCESS_STATUS_OPEN: 'Open',
}));

vi.mock('@/components/clamp-lines', () => ({
  ClampLines: ({ text }: any) => <h1 data-testid="clamp-lines">{text}</h1>,
}));

const baseResource = {
  rec_resource_id: '123',
  name: 'Test Resource',
  rec_resource_type: 'Park',
  recreation_status: {
    code: 'Open',
    label: 'Open',
    status_code: 1,
    comment: '',
    description: '',
  },
} as unknown as RecreationResourceDetailUIModel;

describe('ResourceHeaderSection', () => {
  beforeEach(() => {
    mockUseAuthorizations.mockReturnValue({ isSuperAdmin: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders resource name, id, and type', () => {
    render(<ResourceHeaderSection recResource={baseResource} />);
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByTestId('custom-badge')).toHaveTextContent('123');
    expect(screen.getByText('Park')).toBeInTheDocument();
  });

  it('renders file status badge with description when rec_status_description is provided', () => {
    const resourceWithStatus = {
      ...baseResource,
      rec_status_code: 'HI',
      rec_status_description: 'Issued',
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithStatus} />);

    expect(screen.getByTestId('file-status-badge')).toHaveTextContent('Issued');
    expect(screen.getByTestId('file-status-badge')).toHaveAttribute(
      'data-code',
      'HI',
    );
  });

  it('renders admin status badge when recreation_status_description is provided', () => {
    const resourceWithAdminStatus = {
      ...baseResource,
      recreation_status_description: 'Currently Open',
      recreation_status_code: 1,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithAdminStatus} />);

    expect(screen.getByTestId('admin-status-badge')).toHaveTextContent(
      'Currently Open',
    );
  });

  it('hides the admin status badge for users who are not super admins', () => {
    mockUseAuthorizations.mockReturnValue({ isSuperAdmin: false });
    const resourceWithAdminStatus = {
      ...baseResource,
      recreation_status_description: 'Currently Open',
      recreation_status_code: 1,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithAdminStatus} />);

    expect(screen.queryByTestId('admin-status-badge')).not.toBeInTheDocument();
  });

  it('falls back to status code when description is not provided', () => {
    const resourceWithoutStatus = {
      ...baseResource,
      rec_status_code: 'PE',
      recreation_status_description: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithoutStatus} />);

    expect(screen.getByTestId('file-status-badge')).toHaveTextContent('PE');
  });

  it('renders the public access status pill using the advisory label', () => {
    const resource = {
      ...baseResource,
      access_status_grouplabel: 'Limited access',
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resource} />);

    expect(screen.getByTestId('public-access-status-badge')).toHaveTextContent(
      'Limited access',
    );
  });

  it('falls back to Open when the resource has no advisories on file', () => {
    const resource = {
      ...baseResource,
      access_status_grouplabel: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resource} />);

    expect(screen.getByTestId('public-access-status-badge')).toHaveTextContent(
      'Open',
    );
  });

  it('shows the Open fallback pill to users who are not super admins', () => {
    mockUseAuthorizations.mockReturnValue({ isSuperAdmin: false });
    const resource = {
      ...baseResource,
      recreation_status_description: 'Open',
      recreation_status_code: 1,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resource} />);

    expect(screen.queryByTestId('admin-status-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('public-access-status-badge')).toHaveTextContent(
      'Open',
    );
  });

  it('hides the public access pill when it would duplicate a visible admin status badge', () => {
    const resource = {
      ...baseResource,
      recreation_status_description: 'Open',
      recreation_status_code: 1,
      access_status_grouplabel: 'Open',
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resource} />);

    expect(screen.getByTestId('admin-status-badge')).toHaveTextContent('Open');
    expect(
      screen.queryByTestId('public-access-status-badge'),
    ).not.toBeInTheDocument();
  });

  it('hides the public access pill when the Open fallback duplicates the admin status badge', () => {
    const resource = {
      ...baseResource,
      recreation_status_description: 'Open',
      recreation_status_code: 1,
      access_status_grouplabel: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resource} />);

    expect(screen.getByTestId('admin-status-badge')).toHaveTextContent('Open');
    expect(
      screen.queryByTestId('public-access-status-badge'),
    ).not.toBeInTheDocument();
  });

  it('renders both pills when the advisory label differs from the admin status', () => {
    const resource = {
      ...baseResource,
      recreation_status_description: 'Open',
      recreation_status_code: 1,
      access_status_grouplabel: 'Closed',
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resource} />);

    expect(screen.getByTestId('admin-status-badge')).toHaveTextContent('Open');
    expect(screen.getByTestId('public-access-status-badge')).toHaveTextContent(
      'Closed',
    );
  });

  it('does not render status badge when rec status code is missing', () => {
    const resourceWithoutCode = {
      ...baseResource,
      recreation_status_description: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithoutCode} />);

    expect(screen.queryByTestId('file-status-badge')).not.toBeInTheDocument();
    const badges = screen.getAllByTestId('custom-badge');
    expect(badges).toHaveLength(1);
  });

  describe('in production', () => {
    // No ACT advisories in prod yet, so FTA status is all we have, and
    // everyone gets it, not just super admins.
    beforeEach(() => {
      vi.stubEnv('VITE_DEPLOYMENT_ENV', 'prod');
    });

    it('hides the public access pill even when an advisory label exists', () => {
      const resource = {
        ...baseResource,
        access_status_grouplabel: 'Closed',
      } as unknown as RecreationResourceDetailUIModel;

      render(<ResourceHeaderSection recResource={resource} />);

      expect(
        screen.queryByTestId('public-access-status-badge'),
      ).not.toBeInTheDocument();
    });

    it('shows the admin status badge to users who are not super admins', () => {
      mockUseAuthorizations.mockReturnValue({ isSuperAdmin: false });
      const resource = {
        ...baseResource,
        recreation_status_description: 'Open',
        recreation_status_code: 1,
        access_status_grouplabel: 'Closed',
      } as unknown as RecreationResourceDetailUIModel;

      render(<ResourceHeaderSection recResource={resource} />);

      expect(screen.getByTestId('admin-status-badge')).toHaveTextContent(
        'Open',
      );
      expect(
        screen.queryByTestId('public-access-status-badge'),
      ).not.toBeInTheDocument();
    });

    it('treats an unrecognised deployment env as production', () => {
      vi.stubEnv('VITE_DEPLOYMENT_ENV', 'staging');
      mockUseAuthorizations.mockReturnValue({ isSuperAdmin: false });
      const resource = {
        ...baseResource,
        recreation_status_description: 'Open',
        recreation_status_code: 1,
      } as unknown as RecreationResourceDetailUIModel;

      render(<ResourceHeaderSection recResource={resource} />);

      expect(screen.getByTestId('admin-status-badge')).toBeInTheDocument();
      expect(
        screen.queryByTestId('public-access-status-badge'),
      ).not.toBeInTheDocument();
    });
  });
});
