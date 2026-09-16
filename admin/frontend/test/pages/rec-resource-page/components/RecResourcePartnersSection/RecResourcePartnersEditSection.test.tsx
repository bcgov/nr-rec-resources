import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
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
    mockUpdate.mockResolvedValue({
      visible_on_public_website: false,
      agreementEndDate: '2026-09-16',
    });
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

  describe('cancelling an agreement', () => {
    it('clears the visibility toggle on the cancelled card', async () => {
      renderSection([
        partner(1, { visible_on_public_website: true }),
        partner(2),
      ]);

      expect(isOn(1)).toBe(true);

      // the card's action, then the modal's confirm — both are labelled
      // "Cancel agreement", so the confirm is scoped to the dialog
      fireEvent.click(
        screen.getAllByRole('button', { name: 'Cancel agreement' })[0],
      );
      const dialog = await screen.findByRole('dialog');
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Cancel agreement' }),
      );

      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            agreementHolderId: 1,
            dto: { cancelled: true, agreementEndDate: expect.any(String) },
          }),
        ),
      );
      // the API clears visibility when cancelling; the card mirrors it
      await waitFor(() => expect(isOn(1)).toBe(false));
    });

    it('stamps the end date input with the date the API returned', async () => {
      renderSection([partner(1, { agreementEndDate: '2030-12-31' })]);

      expect(
        (document.querySelector('#agreement-end-1') as HTMLInputElement).value,
      ).toBe('2030-12-31');

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Cancel agreement' })[0],
      );
      const dialog = await screen.findByRole('dialog');
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Cancel agreement' }),
      );

      await waitFor(() =>
        expect(
          (document.querySelector('#agreement-end-1') as HTMLInputElement)
            .value,
        ).toBe('2026-09-16'),
      );
    });

    it('defaults the cancellation date to today', async () => {
      renderSection([partner(1)]);

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Cancel agreement' })[0],
      );
      await screen.findByRole('dialog');

      const today = new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      expect(
        (document.querySelector('#cancel-agreement-date') as HTMLInputElement)
          .value,
      ).toBe(today.toISOString().slice(0, 10));
    });

    it('sends the cancellation date the user picked', async () => {
      renderSection([partner(1)]);

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Cancel agreement' })[0],
      );
      const dialog = await screen.findByRole('dialog');

      fireEvent.change(
        document.querySelector('#cancel-agreement-date') as HTMLInputElement,
        { target: { value: '2026-03-04' } },
      );
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Cancel agreement' }),
      );

      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            dto: { cancelled: true, agreementEndDate: '2026-03-04' },
          }),
        ),
      );
    });

    it('resets the cancellation date to today on each open', async () => {
      renderSection([partner(1), partner(2)]);

      const dateInput = () =>
        document.querySelector('#cancel-agreement-date') as HTMLInputElement;

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Cancel agreement' })[0],
      );
      const dialog = await screen.findByRole('dialog');
      fireEvent.change(dateInput(), { target: { value: '2026-03-04' } });
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Keep agreement' }),
      );

      fireEvent.click(
        screen.getAllByRole('button', { name: 'Cancel agreement' })[1],
      );
      await screen.findByRole('dialog');

      const today = new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      expect(dateInput().value).toBe(today.toISOString().slice(0, 10));
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
        screen.getByText('This will replace the current main contact.'),
      ).toBeInTheDocument();
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
