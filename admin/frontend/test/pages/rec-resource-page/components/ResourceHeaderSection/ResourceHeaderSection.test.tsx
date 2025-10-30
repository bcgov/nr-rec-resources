import { ResourceHeaderSection } from '@/pages/rec-resource-page/components/ResourceHeaderSection';
import { RecreationResourceDetailUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components', () => ({
  CustomBadge: ({ label }: any) => (
    <span data-testid="custom-badge">{label}</span>
  ),
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
    expect(screen.getByTestId('clamp-lines')).toHaveTextContent(
      'Test Resource',
    );
    expect(screen.getByTestId('custom-badge')).toHaveTextContent('123');
    expect(screen.getByText('Park')).toBeInTheDocument();
  });

  it('renders recreation status description when provided', () => {
    const resourceWithStatus = {
      ...baseResource,
      recreation_status_description: 'Currently Open',
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithStatus} />);

    const badges = screen.getAllByTestId('custom-badge');
    expect(badges).toHaveLength(2); // ID badge and status badge
    expect(badges[1]).toHaveTextContent('Currently Open');
  });

  it('does not render recreation status badge when description is not provided', () => {
    const resourceWithoutStatus = {
      ...baseResource,
      recreation_status_description: null,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithoutStatus} />);

    const badges = screen.getAllByTestId('custom-badge');
    expect(badges).toHaveLength(1); // Only ID badge
  });

  it('uses green color when recreation_status_code is 1 (active)', () => {
    const resourceWithActiveStatus = {
      ...baseResource,
      recreation_status_description: 'Active',
      recreation_status_code: 1,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithActiveStatus} />);

    const badges = screen.getAllByTestId('custom-badge');
    expect(badges).toHaveLength(2); // ID badge and status badge
    expect(badges[1]).toHaveTextContent('Active');
  });

  it('uses red color when recreation_status_code is not 1 (inactive)', () => {
    const resourceWithInactiveStatus = {
      ...baseResource,
      recreation_status_description: 'Inactive',
      recreation_status_code: 0,
    } as unknown as RecreationResourceDetailUIModel;

    render(<ResourceHeaderSection recResource={resourceWithInactiveStatus} />);

    const badges = screen.getAllByTestId('custom-badge');
    expect(badges).toHaveLength(2); // ID badge and status badge
    expect(badges[1]).toHaveTextContent('Inactive');
  });
});
