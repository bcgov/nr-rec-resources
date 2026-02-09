import { ImageLightboxModal } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageLightboxModal/ImageLightboxModal';
import { GalleryImage } from '@/pages/rec-resource-page/types';
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

vi.mock('@/pages/rec-resource-page/hooks/utils/findImageVariant', () => ({
  findImageVariant: vi.fn((variants: any[], sizeCode: string) =>
    variants?.find((v) => v.size_code === sizeCode),
  ),
}));

const mockImage: GalleryImage = {
  id: 'img-1',
  name: 'test-photo.webp',
  date: '2024-01-01',
  url: 'https://example.com/original.jpg',
  extension: 'jpg',
  type: 'image',
  previewUrl: 'https://example.com/preview.jpg',
  variants: [
    { size_code: 'scr', url: 'https://example.com/screen.jpg' },
    { size_code: 'original', url: 'https://example.com/original.jpg' },
  ],
} as any;

describe('ImageLightboxModal', () => {
  const mockOnHide = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(
      <ImageLightboxModal show={false} onHide={mockOnHide} image={mockImage} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when image is null', () => {
    const { container } = render(
      <ImageLightboxModal show={true} onHide={mockOnHide} image={null} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders image when shown with an image', () => {
    render(
      <ImageLightboxModal show={true} onHide={mockOnHide} image={mockImage} />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Should render the image with screen variant URL
    const img = screen.getByAltText('test-photo.webp');
    expect(img).toHaveAttribute('src', 'https://example.com/screen.jpg');
  });

  it('falls back to original URL when no screen variant', () => {
    const imageWithoutScreen: GalleryImage = {
      ...mockImage,
      variants: [],
    };

    render(
      <ImageLightboxModal
        show={true}
        onHide={mockOnHide}
        image={imageWithoutScreen}
      />,
    );

    const img = screen.getByAltText('test-photo.webp');
    expect(img).toHaveAttribute('src', 'https://example.com/original.jpg');
  });

  it('calls onHide when close button is clicked', () => {
    render(
      <ImageLightboxModal show={true} onHide={mockOnHide} image={mockImage} />,
    );

    const closeBtn = screen.getByLabelText('Close image viewer');
    fireEvent.click(closeBtn);

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('calls onHide when backdrop is clicked', () => {
    render(
      <ImageLightboxModal show={true} onHide={mockOnHide} image={mockImage} />,
    );

    const backdrop = document.querySelector('.image-lightbox__backdrop');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('calls onHide when Escape key is pressed', () => {
    render(
      <ImageLightboxModal show={true} onHide={mockOnHide} image={mockImage} />,
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
