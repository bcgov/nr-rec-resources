import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecreationFeaturePreview from '@/components/search-map/RecreationFeaturePreview';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource';

vi.mock('@/service/queries/recreation-resource', () => ({
  useGetRecreationResourceById: vi.fn(),
}));

vi.mock('@/components/rec-resource/card/RecResourceCard', () => {
  return {
    default: ({ recreationResource }: any) => (
      <div data-testid="rec-resource-card">
        {recreationResource.name || 'Mocked Resource'}
      </div>
    ),
  };
});

describe('RecreationFeaturePreview', () => {
  const mockId = 'abc123';

  it('shows spinner when data is loading (no data)', () => {
    (useGetRecreationResourceById as any).mockReturnValue({ data: null });

    render(<RecreationFeaturePreview rec_resource_id={mockId} />);

    const spinner = screen.getByRole('output');
    expect(spinner).toBeInTheDocument();
  });

  it('shows RecResourceCard when data is loaded', () => {
    const mockResource = { id: mockId, name: 'Test Resource' };
    (useGetRecreationResourceById as any).mockReturnValue({
      data: mockResource,
    });

    render(<RecreationFeaturePreview rec_resource_id={mockId} />);

    const card = screen.getByTestId('rec-resource-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Test Resource');
  });
});
