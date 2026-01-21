import { ImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections/ImageUploadForm';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { ImageUploadFormData } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas';
import { setUploadFileName } from '@/pages/rec-resource-page/store/recResourceFileTransferStore';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
}));

const TestWrapper = ({
  uploadState,
  onSubmit = vi.fn(),
}: {
  uploadState: string;
  onSubmit?: any;
}) => {
  const { control, handleSubmit } = useForm<ImageUploadFormData>();
  return (
    <ImageUploadForm
      control={control}
      uploadState={uploadState as any}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
};

describe('ImageUploadForm', () => {
  it('renders display name input', () => {
    render(<TestWrapper uploadState="initial" />);

    expect(
      screen.getByPlaceholderText('Enter a display name'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/briefly describe the location or feature/i),
    ).toBeInTheDocument();
  });

  it('renders working hours toggle question', () => {
    render(<TestWrapper uploadState="initial" />);

    expect(
      screen.getByText(/was this photo taken by staff during working hours/i),
    ).toBeInTheDocument();
  });

  it('renders personal info toggle question', () => {
    render(<TestWrapper uploadState="initial" />);

    expect(
      screen.getByText((content) =>
        content.toLowerCase().includes('personally identifiable information'),
      ),
    ).toBeInTheDocument();
  });

  it('shows warning when not taken during working hours', () => {
    render(<TestWrapper uploadState="not-working-hours" />);

    expect(
      screen.getByText(
        /recspace is currently accepting photos only by staff during working hours/i,
      ),
    ).toBeInTheDocument();
  });

  it('shows warning when photo has personal info', () => {
    render(<TestWrapper uploadState="has-personal-info" />);

    expect(
      screen.getByText(
        /recspace is not currently accepting photos with personally identifiable information/i,
      ),
    ).toBeInTheDocument();
  });

  it('shows confirmation checkbox when ready to confirm', () => {
    render(<TestWrapper uploadState="confirm-no-personal-info" />);

    expect(
      screen.getByText(
        /by uploading this photo, i confirm that it contains no personally identifiable information/i,
      ),
    ).toBeInTheDocument();
  });

  it('syncs display name to store on change', () => {
    render(<TestWrapper uploadState="initial" />);
    const input = screen.getByPlaceholderText('Enter a display name');

    fireEvent.change(input, { target: { value: 'New Display Name' } });

    expect(setUploadFileName).toHaveBeenCalledWith('New Display Name');
  });

  it('triggers onSubmit when Enter key is pressed on display name field', async () => {
    const onSubmit = vi.fn();
    render(<TestWrapper uploadState="initial" onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Enter a display name');
    fireEvent.change(input, { target: { value: 'Valid Name' } });

    fireEvent.submit(screen.getByLabelText('image-upload-form'));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
