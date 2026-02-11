import { PhotoDetailsModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/PhotoDetailsModal/PhotoDetailsModal';
import {
  recResourceFileTransferStore,
  showPhotoDetailsForImage,
} from '@/pages/rec-resource-page/store/recResourceFileTransferStore';
import { GalleryImage } from '@/pages/rec-resource-page/types';
import { TestQueryClientProvider } from '@test/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon?.iconName || 'mocked'}
      className={className}
    />
  ),
}));

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-object-url'),
});

vi.mock('@/components', () => ({
  CustomButton: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
  ClampLines: ({ text }: any) => <div>{text}</div>,
}));

vi.mock('@/utils/imageProcessing', () => ({
  formatFileSize: vi.fn(
    (size: number) => `${(size / 1024 / 1024).toFixed(1)} MB`,
  ),
}));

const mockConsentMutate = vi.fn();
vi.mock('@/pages/rec-resource-page/hooks/useConsentDownload', () => ({
  useConsentDownload: () => ({ mutate: mockConsentMutate }),
}));

const mockDownloadMutate = vi.fn();
vi.mock('@/pages/rec-resource-page/hooks/useFileDownload', () => ({
  useFileDownload: () => ({ mutate: mockDownloadMutate }),
}));

vi.mock('@/pages/rec-resource-page/hooks/useRecResource', () => ({
  useRecResource: () => ({ rec_resource_id: 'RES-001' }),
}));

const mockImage: GalleryImage = {
  id: 'img-1',
  name: 'test-photo.webp',
  date: 'January 1, 2024',
  url: 'https://example.com/original.jpg',
  extension: 'jpg',
  type: 'image',
  previewUrl: 'https://example.com/preview.jpg',
  variants: [],
  file_size: 2097152,
  date_taken: '2024-06-15',
  photographer_type: 'STAFF',
  photographer_type_description: 'Staff Member',
  photographer_name: 'John Doe',
  photographer_display_name: 'John Doe',
  contains_pii: true,
};

/** Helper to set the store state for the modal */
function openModalWithImage(image: GalleryImage) {
  showPhotoDetailsForImage(image);
}

/** Helper to reset the store state */
function resetStore() {
  recResourceFileTransferStore.setState((prev) => ({
    ...prev,
    showPhotoDetailsModal: false,
    selectedImageForDetails: null,
  }));
}

describe('PhotoDetailsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('renders nothing when no image is selected in store', () => {
    const { container } = render(<PhotoDetailsModal />, {
      wrapper: TestQueryClientProvider,
    });
    expect(container.innerHTML).toBe('');
  });

  it('renders photo details with consent metadata', () => {
    openModalWithImage(mockImage);

    render(<PhotoDetailsModal />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('Photo details')).toBeInTheDocument();
    expect(screen.getByText('test-photo.webp')).toBeInTheDocument();
    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('2.0 MB')).toBeInTheDocument();

    expect(screen.getByText('Staff Member')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('shows "No" for PII when contains_pii is false', () => {
    const imageNoPii = { ...mockImage, contains_pii: false };
    openModalWithImage(imageNoPii);

    render(<PhotoDetailsModal />, { wrapper: TestQueryClientProvider });

    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('shows "Not specified" for missing fields', () => {
    const minimalImage: GalleryImage = {
      id: 'img-2',
      name: 'minimal.webp',
      date: '',
      url: '',
      extension: 'webp',
      type: 'image',
      variants: [],
    } as any;

    openModalWithImage(minimalImage);

    render(<PhotoDetailsModal />, { wrapper: TestQueryClientProvider });

    const notSpecified = screen.getAllByText('Not specified');
    expect(notSpecified.length).toBeGreaterThanOrEqual(2);
  });

  it('renders download consent button when image contains PII', () => {
    openModalWithImage(mockImage);

    render(<PhotoDetailsModal />, { wrapper: TestQueryClientProvider });

    const downloadBtn = screen.getByText('Download form');
    expect(downloadBtn).toBeInTheDocument();

    fireEvent.click(downloadBtn);
    expect(mockConsentMutate).toHaveBeenCalledWith({
      recResourceId: 'RES-001',
      imageId: 'img-1',
    });
  });

  it('does not render download consent button when image does not contain PII', () => {
    const imageNoPii = { ...mockImage, contains_pii: false };
    openModalWithImage(imageNoPii);

    render(<PhotoDetailsModal />, { wrapper: TestQueryClientProvider });

    expect(screen.queryByText('Download form')).not.toBeInTheDocument();
  });

  it('renders download button and triggers download', () => {
    openModalWithImage(mockImage);

    render(<PhotoDetailsModal />, { wrapper: TestQueryClientProvider });

    const downloadBtn = screen.getByText('Download');
    fireEvent.click(downloadBtn);
    expect(mockDownloadMutate).toHaveBeenCalledWith({ file: mockImage });
  });
});
