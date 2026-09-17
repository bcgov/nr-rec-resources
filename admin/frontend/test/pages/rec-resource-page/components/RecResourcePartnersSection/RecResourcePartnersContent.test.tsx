import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RecResourcePartnersContent } from '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnersContent';
import { AgreementHolderClientPublicViewDto } from '@/services/recreation-resource-admin/models/AgreementHolderClientPublicViewDto';
import userEvent from '@testing-library/user-event';

// Mock the hook that triggers the AuthContext dependency
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetPartnerLocationsByClientId',
  () => ({
    useGetPartnerLocations: () => ({
      mutateAsync: vi.fn(),
      data: undefined,
      isPending: false,
    }),
  }),
);

vi.mock(
  '@/pages/rec-resource-page/components/RecResourcePartnersSection/RecResourcePartnerAddNewModal',
  () => ({
    RecResourcePartnerAddNewModal: ({
      show,
      onCancel,
    }: {
      show: boolean;
      onCancel: () => void;
    }) =>
      show ? (
        <div data-testid="mock-add-partner-modal">
          <span>Add Partner Modal</span>
          <button onClick={onCancel}>Close Modal</button>
        </div>
      ) : null,
  }),
);

// Mock @tanstack/react-router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

// Mock route constants
vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    REC_RESOURCE_PARTNERS_EDIT: '/rec-resource/$id/partners/edit',
  },
}));

describe('RecResourcePartnersContent', () => {
  const mockPartners: AgreementHolderClientPublicViewDto[] = [
    {
      clientNumber: '001',
      clientName: 'Partner One',
      clientTypeDescription: 'Society',
    },
    {
      clientNumber: '002',
      clientName: 'Partner Two',
      clientTypeDescription: 'Business',
    },
  ];

  it('should render section header and partner list correctly', () => {
    render(<RecResourcePartnersContent partners={mockPartners} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Active Partners' }),
    ).toBeInTheDocument();
    expect(screen.getByText('001')).toBeInTheDocument();
    expect(screen.getByText('Partner One')).toBeInTheDocument();
    expect(screen.getByText('002')).toBeInTheDocument();
    expect(screen.getByText('Partner Two')).toBeInTheDocument();
  });

  it('should not render "Add New" or "Edit" buttons when recResourceId is not provided', () => {
    render(<RecResourcePartnersContent partners={mockPartners} />);

    expect(
      screen.queryByRole('link', { name: 'Add New' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Edit' }),
    ).not.toBeInTheDocument();
  });

  it('should render "Add New" and "Edit" buttons with correct hrefs when recResourceId is provided', () => {
    const recResourceId = '12345';
    render(
      <RecResourcePartnersContent
        partners={mockPartners}
        recResourceId={recResourceId}
      />,
    );

    const addNewBtn = screen.getByRole('button', { name: 'Add New' });
    const editLink = screen.getByRole('link', { name: 'Edit' });

    expect(addNewBtn).toBeInTheDocument();

    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute(
      'href',
      '/rec-resource/12345/partners/edit',
    );
  });

  it('should render gracefully when partners array is empty', () => {
    render(<RecResourcePartnersContent partners={[]} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Active Partners' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('001')).not.toBeInTheDocument();
  });

  describe('RecResourcePartnerAddNewModal Interaction', () => {
    it('should open the modal when clicking "Add New" and close it on cancel', async () => {
      const user = userEvent.setup();

      render(
        <RecResourcePartnersContent
          partners={mockPartners}
          recResourceId="12345"
        />,
      );

      // Modal should initially be hidden
      expect(
        screen.queryByTestId('mock-add-partner-modal'),
      ).not.toBeInTheDocument();

      // Click "Add New" button
      const addNewBtn = screen.getByRole('button', { name: 'Add New' });
      await user.click(addNewBtn);

      // Modal should now be visible
      expect(screen.getByTestId('mock-add-partner-modal')).toBeInTheDocument();

      // Click the close/cancel button inside the modal
      const closeBtn = screen.getByRole('button', { name: 'Close Modal' });
      await user.click(closeBtn);

      // Modal should be hidden again
      expect(
        screen.queryByTestId('mock-add-partner-modal'),
      ).not.toBeInTheDocument();
    });
  });
});
