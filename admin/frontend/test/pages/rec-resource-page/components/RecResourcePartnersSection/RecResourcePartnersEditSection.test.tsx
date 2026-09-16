import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourcePartnersEditSection } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnersEditSection';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin';

const { mockUpdate, mockDelete, mockNavigate } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/hooks/recreation-resource-admin', () => ({
  useUpdateAgreementHolder: () => ({ mutateAsync: mockUpdate }),
  useDeleteAgreementHolder: () => ({
    mutateAsync: mockDelete,
    isPending: false,
  }),
}));

vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: { SUPER_ADMIN: 'rst-super-admin', ADMIN: 'rst-admin' },
  useAuthorizations: () => ({ isSuperAdmin: true }),
}));

const partner = (
  id: number,
  overrides: Partial<AgreementHolderClientPublicViewDto> = {},
): AgreementHolderClientPublicViewDto => ({
  agreement_holder_id: id,
  cancelled: false,
  clientNumber: `0000000${id}`,
  clientName: `Partner ${id}`,
  visible_on_public_website: false,
  ...overrides,
});

function renderSection(partners: AgreementHolderClientPublicViewDto[]) {
  return render(
    <RecResourcePartnersEditSection
      partners={partners}
      recResourceId="REC0002"
    />,
  );
}

/**
 * The Yes radio for a card's visibility toggle. Addressed by id because every
 * card renders an identically-labelled Yes/No pair.
 */
const yesRadio = (id: number) =>
  document.querySelector(
    `#partner-visibility-${id}-yes`,
  ) as HTMLInputElement | null;

const toggleYes = (id: number) => yesRadio(id)!;
const isOn = (id: number) => yesRadio(id)?.checked ?? false;

describe('RecResourcePartnersEditSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  describe('public-website visibility is exclusive', () => {
    it('turns the flag off on every other card when one is turned on', () => {
      renderSection([
        partner(1, { visible_on_public_website: true }),
        partner(2),
        partner(3),
      ]);

      expect(isOn(1)).toBe(true);

      fireEvent.click(toggleYes(2));

      expect(isOn(2)).toBe(true);
      expect(isOn(1)).toBe(false);
      expect(isOn(3)).toBe(false);
    });

    it('leaves a cancelled partner untouched', () => {
      renderSection([
        partner(1, { visible_on_public_website: true, cancelled: true }),
        partner(2),
      ]);

      fireEvent.click(toggleYes(2));

      // the cancelled card is frozen and never shown publicly anyway
      expect(isOn(1)).toBe(true);
      expect(isOn(2)).toBe(true);
    });
  });

  describe('warning before the main contact moves', () => {
    it('warns instead of saving immediately, then saves on confirm', async () => {
      renderSection([
        partner(1, { visible_on_public_website: true }),
        partner(2),
      ]);

      fireEvent.click(toggleYes(2));
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText(/will become the main contact/i),
      ).toBeInTheDocument();
      expect(mockUpdate).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      // both the newly-flagged partner and the one it replaced are updated
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(2));
    });

    it('does not warn when the main contact is unchanged', async () => {
      renderSection([
        partner(1, { visible_on_public_website: true }),
        partner(2),
      ]);

      fireEvent.change(
        document.querySelector('#agreement-start-2') as HTMLInputElement,
        { target: { value: '2024-01-01' } },
      );
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.queryByText(/will become the main contact/i),
      ).not.toBeInTheDocument();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    });
  });
});
