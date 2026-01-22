import { ImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections/ImageUploadForm';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: () => {},
  setUploadConsentMetadata: () => {},
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
  () => ({
    useGetRecreationResourceOptions: () => ({
      data: [
        {
          type: 'photographerType',
          options: [
            { id: 'STAFF', label: 'Staff' },
            { id: 'CONTRACTOR', label: 'Contractor' },
            { id: 'VOLUNTEER', label: 'Volunteer' },
            { id: 'PHOTOGRAPHER', label: 'Photographer' },
            { id: 'OTHER', label: 'Other' },
          ],
        },
      ],
      isLoading: false,
      error: null,
    }),
  }),
);

const TestWrapper = ({
  onUpload = vi.fn(),
  onFormReady = vi.fn(),
}: {
  onUpload?: () => void;
  onFormReady?: (handlers: any) => void;
}) => {
  return (
    <ImageUploadForm
      fileName="test-image.jpg"
      onUpload={onUpload}
      onFormReady={onFormReady}
    />
  );
};

describe('ImageUploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('component setup', () => {
    it('calls onFormReady with form handlers on mount', async () => {
      const onFormReady = vi.fn();
      render(<TestWrapper onFormReady={onFormReady} />);

      await waitFor(() => {
        expect(onFormReady).toHaveBeenCalledWith(
          expect.objectContaining({
            resetForm: expect.any(Function),
            isValid: expect.any(Boolean),
          }),
        );
      });
    });
  });

  describe('display name field', () => {
    it('renders display name input', () => {
      render(<TestWrapper />);

      expect(
        screen.getByPlaceholderText('Enter a display name'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/briefly describe the location or feature/i),
      ).toBeInTheDocument();
    });
  });

  describe('date taken field', () => {
    it('renders date taken section', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Date Taken')).toBeInTheDocument();
    });
  });

  describe('photographer fields', () => {
    it('renders photographer type dropdown', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Photographer Type')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders did you take photo question', () => {
      render(<TestWrapper />);

      expect(
        screen.getByText(/did you take this photo\?/i),
      ).toBeInTheDocument();
    });
  });

  describe('identifiable information', () => {
    it('renders identifiable information question', () => {
      render(<TestWrapper />);

      expect(
        screen.getByRole('link', {
          name: /personally identifiable information/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('confirmation checkbox', () => {
    it('renders confirmation checkbox', () => {
      render(<TestWrapper />);

      expect(
        screen.getByText(
          /by uploading this photo, i confirm that it contains no personally identifiable information/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
