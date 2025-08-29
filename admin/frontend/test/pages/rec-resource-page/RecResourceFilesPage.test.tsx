import { RecResourceFilesPage } from '@/pages/rec-resource-page/RecResourceFilesPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseRecResourceFileTransferState = vi.fn();
const mockGetImageGeneralActionHandler = vi.fn();
const mockGetDocumentGeneralActionHandler = vi.fn();

// Mock the useRecResourceFileTransferState hook
vi.mock(
  '@/pages/rec-resource-page/hooks/useRecResourceFileTransferState',
  () => ({
    useRecResourceFileTransferState: () =>
      mockUseRecResourceFileTransferState(),
  }),
);

// Mock the RecResourceFileSection component
vi.mock('@/pages/rec-resource-page/components/RecResourceFileSection', () => ({
  RecResourceFileSection: () => (
    <div data-testid="rec-resource-file-section">
      Mock RecResourceFileSection
    </div>
  ),
}));

// Mock CustomButton
vi.mock('@/components', () => ({
  CustomButton: ({ children, onClick, disabled, leftIcon, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {leftIcon}
      {children}
    </button>
  ),
}));

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({
    icon,
    'aria-label': ariaLabel,
    className,
    ...props
  }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon.iconName || 'mocked-icon'}
      aria-label={ariaLabel}
      className={className}
      {...props}
    />
  ),
}));

describe('RecResourceFilesPage', () => {
  const defaultState = {
    isDocumentUploadDisabled: false,
    isImageUploadDisabled: false,
    getDocumentGeneralActionHandler: mockGetDocumentGeneralActionHandler,
    getImageGeneralActionHandler: mockGetImageGeneralActionHandler,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRecResourceFileTransferState.mockReturnValue(defaultState);
    mockGetImageGeneralActionHandler.mockReturnValue(vi.fn());
    mockGetDocumentGeneralActionHandler.mockReturnValue(vi.fn());
  });
  it('renders the InfoBanner component', () => {
    render(<RecResourceFilesPage />);

    // Check for info banner elements
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(
        /All images and documents will be published to the beta website within 15 minutes/,
      ),
    ).toBeInTheDocument();
  });

  it('renders the info banner with correct warning variant', () => {
    render(<RecResourceFilesPage />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-warning');
  });

  it('renders the info banner with information icon', () => {
    render(<RecResourceFilesPage />);

    const icon = screen.getByLabelText('Information');
    expect(icon).toBeInTheDocument();
  });

  it('renders the RecResourceFileSection component', () => {
    render(<RecResourceFilesPage />);

    expect(screen.getByTestId('rec-resource-file-section')).toBeInTheDocument();
  });

  it('renders the action buttons section with Files heading', () => {
    render(<RecResourceFilesPage />);

    expect(screen.getByRole('heading', { name: 'Files' })).toBeInTheDocument();
  });

  it('renders Add image and Add document buttons', () => {
    render(<RecResourceFilesPage />);

    expect(
      screen.getByRole('button', { name: /add image/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add document/i }),
    ).toBeInTheDocument();
  });

  it('calls action handlers when buttons are clicked', () => {
    const mockImageHandler = vi.fn();
    const mockDocumentHandler = vi.fn();

    mockGetImageGeneralActionHandler.mockReturnValue(mockImageHandler);
    mockGetDocumentGeneralActionHandler.mockReturnValue(mockDocumentHandler);

    render(<RecResourceFilesPage />);

    const addImageButton = screen.getByRole('button', { name: /add image/i });
    const addDocumentButton = screen.getByRole('button', {
      name: /add document/i,
    });

    fireEvent.click(addImageButton);
    fireEvent.click(addDocumentButton);

    expect(mockGetImageGeneralActionHandler).toHaveBeenCalledWith('upload');
    expect(mockGetDocumentGeneralActionHandler).toHaveBeenCalledWith('upload');
    expect(mockImageHandler).toHaveBeenCalledTimes(1);
    expect(mockDocumentHandler).toHaveBeenCalledTimes(1);
  });

  it('disables Add document button when upload is disabled', () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      isDocumentUploadDisabled: true,
    });

    render(<RecResourceFilesPage />);

    const addDocumentButton = screen.getByRole('button', {
      name: /add document/i,
    });
    expect(addDocumentButton).toBeDisabled();
  });

  it('disables Add image button when upload is disabled', () => {
    mockUseRecResourceFileTransferState.mockReturnValue({
      ...defaultState,
      isImageUploadDisabled: true,
    });

    render(<RecResourceFilesPage />);

    const addImageButton = screen.getByRole('button', { name: /add image/i });
    expect(addImageButton).toBeDisabled();
  });

  it('has correct layout structure with Stack', () => {
    const { container } = render(<RecResourceFilesPage />);

    // Check that the main container has the correct structure
    const stackElement = container.firstChild as HTMLElement;
    expect(stackElement).toHaveClass('vstack', 'gap-4');
  });

  it('has gap between sections', () => {
    const { container } = render(<RecResourceFilesPage />);

    const stackElement = container.firstChild as HTMLElement;
    expect(stackElement).toHaveClass('gap-4');
  });

  it('renders info banner text content correctly', () => {
    render(<RecResourceFilesPage />);

    expect(
      screen.getByText(
        'All images and documents will be published to the beta website within 15 minutes.',
      ),
    ).toBeInTheDocument();
  });

  it('has correct CSS classes for info banner', () => {
    render(<RecResourceFilesPage />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('rec-resource-page__info-banner');
  });

  it('has correct horizontal stack layout in info banner', () => {
    render(<RecResourceFilesPage />);

    const stackElement = screen.getByRole('alert').querySelector('.hstack');
    expect(stackElement).toHaveClass('gap-2');
  });

  it('has correctly styled icon in info banner', () => {
    render(<RecResourceFilesPage />);

    const icon = screen.getByLabelText('Information');
    expect(icon).toHaveClass('rec-resource-page__info-banner-icon');
  });

  it('has correctly styled text in info banner', () => {
    render(<RecResourceFilesPage />);

    const textElement = screen.getByText(
      'All images and documents will be published to the beta website within 15 minutes.',
    );
    expect(textElement).toHaveClass('rec-resource-page__info-banner-text');
  });
});
