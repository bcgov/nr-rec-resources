import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppliedFilterChips } from '@/pages/admin-search-page/components/AppliedFilterChips';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/admin-search-page/constants';

describe('AppliedFilterChips', () => {
  const typeOptions = [
    { id: 'SIT', label: 'Site' },
    { id: 'RTR', label: 'Trail' },
  ];
  const districtOptions = [{ id: 'DCK', label: 'Chilliwack' }];
  const activityOptions = [{ id: '1', label: 'Hiking' }];
  const accessOptions = [{ id: 'B', label: 'Boat access' }];

  it('renders all active chip labels', () => {
    render(
      <AppliedFilterChips
        search={{
          ...DEFAULT_ADMIN_SEARCH_STATE,
          q: 'tamihi',
          type: ['SIT'],
          district: ['DCK'],
          activities: ['1'],
          access: ['B'],
          establishment_date_from: '2020-01-01',
          establishment_date_to: '2021-12-31',
        }}
        typeOptions={typeOptions}
        districtOptions={districtOptions}
        activityOptions={activityOptions}
        accessOptions={accessOptions}
        onClearQuery={vi.fn()}
        onClearType={vi.fn()}
        onClearDistrict={vi.fn()}
        onClearActivity={vi.fn()}
        onClearAccess={vi.fn()}
        onClearEstablishmentDateFrom={vi.fn()}
        onClearEstablishmentDateTo={vi.fn()}
      />,
    );

    expect(screen.getByText('Query: tamihi')).toBeInTheDocument();
    expect(screen.getByText('Site')).toBeInTheDocument();
    expect(screen.getByText('Chilliwack')).toBeInTheDocument();
    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Boat access')).toBeInTheDocument();
    expect(
      screen.getByText('Established from: 2020-01-01'),
    ).toBeInTheDocument();
    expect(screen.getByText('Established to: 2021-12-31')).toBeInTheDocument();
  });

  it('calls the matching clear action for a chip', async () => {
    const user = userEvent.setup();
    const onClearQuery = vi.fn();

    render(
      <AppliedFilterChips
        search={{
          ...DEFAULT_ADMIN_SEARCH_STATE,
          q: 'tamihi',
        }}
        typeOptions={typeOptions}
        districtOptions={districtOptions}
        activityOptions={activityOptions}
        accessOptions={accessOptions}
        onClearQuery={onClearQuery}
        onClearType={vi.fn()}
        onClearDistrict={vi.fn()}
        onClearActivity={vi.fn()}
        onClearAccess={vi.fn()}
        onClearEstablishmentDateFrom={vi.fn()}
        onClearEstablishmentDateTo={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Clear Query: tamihi' }),
    );

    expect(onClearQuery).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when no filters are active', () => {
    const { container } = render(
      <AppliedFilterChips
        search={DEFAULT_ADMIN_SEARCH_STATE}
        typeOptions={typeOptions}
        districtOptions={districtOptions}
        activityOptions={activityOptions}
        accessOptions={accessOptions}
        onClearQuery={vi.fn()}
        onClearType={vi.fn()}
        onClearDistrict={vi.fn()}
        onClearActivity={vi.fn()}
        onClearAccess={vi.fn()}
        onClearEstablishmentDateFrom={vi.fn()}
        onClearEstablishmentDateTo={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
