import { ResourceHeaderSection } from '@/pages/rec-resource-page/components/ResourceHeaderSection';
import { RecreationResourceDetailUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

  it('falls back to status code when description is not provided', () => {
    const resourceWithoutStatus = {
      ...baseResource,
      rec_status_code: 'PE',
      recreation_status_description: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithoutStatus} />);

    expect(screen.getByTestId('file-status-badge')).toHaveTextContent('PE');
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
});
