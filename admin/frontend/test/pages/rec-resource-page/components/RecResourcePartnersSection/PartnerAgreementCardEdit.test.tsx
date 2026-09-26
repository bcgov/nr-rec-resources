import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PartnerAgreementCardEdit,
  getDateOrderError,
  toDraft,
  DATE_ORDER_ERROR,
} from '@/pages/rec-resource-page/components/RecResourcePartnersSection/PartnerAgreementCardEdit';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin';

const mockUseAuthorizations = vi.hoisted(() =>
  vi.fn(() => ({ isSuperAdmin: true })),
);

vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: {
    VIEWER: 'rst-viewer',
    ADMIN: 'rst-admin',
    SUPER_ADMIN: 'rst-super-admin',
    DEVELOPER: 'rst-developer',
  },
  useAuthorizations: () => mockUseAuthorizations(),
}));

const basePartner: AgreementHolderClientPublicViewDto = {
  agreement_holder_id: 1000001,
  cancelled: false,
  clientNumber: '00123456',
  clientName: 'acme corporation',
  agreementStartDate: '2024-01-01',
  agreementEndDate: '2030-12-31',
  visible_on_public_website: true,
};

function renderCard(
  partner: AgreementHolderClientPublicViewDto = basePartner,
  overrides: Partial<
    React.ComponentProps<typeof PartnerAgreementCardEdit>
  > = {},
) {
  const props = {
    partner,
    draft: toDraft(partner),
    onDraftChange: vi.fn(),
    onDelete: vi.fn(),
    onCancelAgreement: vi.fn(),
    ...overrides,
  };
  render(<PartnerAgreementCardEdit {...props} />);
  return props;
}

describe('getDateOrderError', () => {
  it('allows either date to be empty', () => {
    expect(
      getDateOrderError({
        agreementStartDate: '',
        agreementEndDate: '2030-01-01',
        visible_on_public_website: false,
      }),
    ).toBeNull();
    expect(
      getDateOrderError({
        agreementStartDate: '2024-01-01',
        agreementEndDate: '',
        visible_on_public_website: false,
      }),
    ).toBeNull();
  });

  it('rejects an end date that is not after the start date', () => {
    expect(
      getDateOrderError({
        agreementStartDate: '2024-06-01',
        agreementEndDate: '2024-01-01',
        visible_on_public_website: false,
      }),
    ).toBe(DATE_ORDER_ERROR);
    expect(
      getDateOrderError({
        agreementStartDate: '2024-06-01',
        agreementEndDate: '2024-06-01',
        visible_on_public_website: false,
      }),
    ).toBe(DATE_ORDER_ERROR);
  });
});

describe('PartnerAgreementCardEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the four specified rows', () => {
    renderCard();
    expect(screen.getByText('00123456')).toBeInTheDocument();
    expect(
      screen.getByText('Display as main contact on public website'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Agreement start date')).toBeInTheDocument();
    expect(screen.getByLabelText('Agreement end date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel agreement' }),
    ).toBeInTheDocument();
  });

  it('shows Active for an agreement with no end date', () => {
    renderCard({ ...basePartner, agreementEndDate: null });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Expired')).not.toBeInTheDocument();
  });

  it('shows Expired for a past end date', () => {
    renderCard({ ...basePartner, agreementEndDate: '2020-01-01' });
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('shows the Cancelled chip and disables cancelling when already cancelled', () => {
    renderCard({ ...basePartner, cancelled: true });
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel agreement' }),
    ).toBeDisabled();
  });

  it('does not show the Cancelled chip for an active agreement', () => {
    renderCard();
    expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
  });

  it('lifts date edits to the parent rather than saving directly', () => {
    const props = renderCard();
    fireEvent.change(screen.getByLabelText('Agreement end date'), {
      target: { value: '2031-01-01' },
    });
    expect(props.onDraftChange).toHaveBeenCalledWith(
      1000001,
      expect.objectContaining({ agreementEndDate: '2031-01-01' }),
    );
  });

  it('lifts the visibility toggle to the parent', () => {
    const props = renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'No' }));
    expect(props.onDraftChange).toHaveBeenCalledWith(
      1000001,
      expect.objectContaining({ visible_on_public_website: false }),
    );
  });

  it('routes Delete and Cancel agreement through the parent handlers', () => {
    const props = renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(props.onDelete).toHaveBeenCalledWith(basePartner);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel agreement' }));
    expect(props.onCancelAgreement).toHaveBeenCalledWith(basePartner);
  });

  describe('delete permission', () => {
    it('shows Delete to a super admin', () => {
      mockUseAuthorizations.mockReturnValue({ isSuperAdmin: true });
      renderCard();

      expect(
        screen.getByRole('button', { name: 'Delete' }),
      ).toBeInTheDocument();
    });

    it('hides Delete from a non-super-admin', () => {
      mockUseAuthorizations.mockReturnValue({ isSuperAdmin: false });
      renderCard();

      expect(
        screen.queryByRole('button', { name: 'Delete' }),
      ).not.toBeInTheDocument();
      // the other row-4 action is unaffected
      expect(
        screen.getByRole('button', { name: 'Cancel agreement' }),
      ).toBeInTheDocument();
    });
  });
});
