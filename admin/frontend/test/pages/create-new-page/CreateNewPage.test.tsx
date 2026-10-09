import { CreateNewPage } from '@/pages/create-new-page/CreateNewPage';
import { useGetNextRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetNextRecResourceId';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Mock, describe, expect, it, vi } from 'vitest';

vi.mock('@/components', () => ({
  PageLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

vi.mock('@/components/RecResourceSpatial/SpatialSubmissionSection', () => ({
  SpatialSubmissionSection: ({ recResourceId }: { recResourceId: string }) => (
    <div
      data-testid="spatial-submission-section"
      data-rec-resource-id={recResourceId}
    />
  ),
}));

vi.mock('@shared/index', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetNextRecResourceId',
  () => ({
    useGetNextRecResourceId: vi.fn(),
  }),
);

const mockUseGetNextRecResourceId = useGetNextRecResourceId as Mock;

describe('CreateNewPage', () => {
  it('shows loading state while generating the next Rec #', () => {
    mockUseGetNextRecResourceId.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<CreateNewPage />);

    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    expect(screen.getByText('Generating next Rec #...')).toBeInTheDocument();
    expect(
      screen.queryByTestId('spatial-submission-section'),
    ).not.toBeInTheDocument();
  });

  it('shows an error when the next Rec # cannot be generated', () => {
    mockUseGetNextRecResourceId.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<CreateNewPage />);

    expect(
      screen.getByText(
        'Unable to generate the next Rec #. Please refresh and try again.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('spatial-submission-section'),
    ).not.toBeInTheDocument();
  });

  it('renders the spatial submission section when a rec resource id is available', () => {
    mockUseGetNextRecResourceId.mockReturnValue({
      data: { rec_resource_id: 'REC000123' },
      isLoading: false,
      isError: false,
    });

    render(<CreateNewPage />);

    expect(screen.getByTestId('spatial-submission-section')).toHaveAttribute(
      'data-rec-resource-id',
      'REC000123',
    );
  });
});
