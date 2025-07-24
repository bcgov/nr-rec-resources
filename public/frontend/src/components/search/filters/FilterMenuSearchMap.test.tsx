import { vi, Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/test-utils';
import { useStore } from '@tanstack/react-store';
import { useSearchParams } from 'react-router-dom';
import FilterMenuSearchMap from '@/components/search/filters/FilterMenuSearchMap';
import { useSearchRecreationResourcesPaginated } from '@/service/queries/recreation-resource';

vi.mock('@tanstack/react-store', async () => {
  const mod = await import('@tanstack/react-store');
  return {
    ...mod,
    useStore: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const mod = await import('react-router-dom');
  return {
    ...mod,
    useSearchParams: vi.fn(),
  };
});

vi.mock('@/service/queries/recreation-resource', () => ({
  useSearchRecreationResourcesPaginated: vi.fn(),
}));

describe('FilterMenuSearchMap', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams({ district: 'ok' }),
      vi.fn(),
    ]);

    (useStore as Mock).mockReturnValue({
      filters: [
        {
          label: 'District',
          param: 'district',
          options: [
            { id: 'ok', description: 'Okanagan', count: 2 },
            { id: 'cw', description: 'Chilliwack', count: 3 },
          ],
        },
      ],
    });

    (useSearchRecreationResourcesPaginated as Mock).mockReturnValue({
      data: {
        totalCount: 5,
        filters: [
          {
            label: 'District',
            param: 'district',
            options: [
              { id: 'ok', description: 'Okanagan', count: 2 },
              { id: 'cw', description: 'Chilliwack', count: 3 },
            ],
          },
        ],
      },
    });
  });

  it('renders filters from store with initial selected state and counts', async () => {
    render(<FilterMenuSearchMap isOpen={true} setIsOpen={vi.fn()} />);
    expect(await screen.findByLabelText('Okanagan (2)')).toBeChecked();
    expect(await screen.findByLabelText('Chilliwack (3)')).not.toBeChecked();
  });

  it('updates filters when a checkbox is toggled', async () => {
    render(<FilterMenuSearchMap isOpen={true} setIsOpen={vi.fn()} />);
    const chilliwack = await screen.findByLabelText('Chilliwack (3)');
    fireEvent.click(chilliwack);
    await waitFor(() => expect(chilliwack).toBeChecked());
  });

  it('disables filters with zero count and not selected', async () => {
    (useSearchParams as Mock).mockReturnValue([
      new URLSearchParams({}),
      vi.fn(),
    ]);

    (useSearchRecreationResourcesPaginated as Mock).mockReturnValue({
      data: {
        totalCount: 1,
        filters: [
          {
            label: 'District',
            param: 'district',
            options: [
              { id: 'ok', description: 'Okanagan', count: 0 },
              { id: 'cw', description: 'Chilliwack', count: 3 },
            ],
          },
        ],
      },
    });

    render(<FilterMenuSearchMap isOpen={true} setIsOpen={vi.fn()} />);

    expect(await screen.findByLabelText('Okanagan (0)')).toBeDisabled();
    expect(await screen.findByLabelText('Chilliwack (3)')).not.toBeDisabled();
  });

  it('shows total count on apply button', async () => {
    render(<FilterMenuSearchMap isOpen={true} setIsOpen={vi.fn()} />);
    expect(
      await screen.findByRole('button', { name: /apply 5 results/i }),
    ).toBeInTheDocument();
  });
});
