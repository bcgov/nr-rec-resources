import { ImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections/ImageUploadForm';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useForm } from 'react-hook-form';
import { ImageUploadFormData } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/schemas';

const TestWrapper = ({ uploadState }: { uploadState: string }) => {
  const { control } = useForm<ImageUploadFormData>();
  return <ImageUploadForm control={control} uploadState={uploadState as any} />;
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
      screen.getByText(/did you take this photo during working hours/i),
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
        /recspace is currently accepting photos only taken during working hours/i,
      ),
    ).toBeInTheDocument();
  });

  it('shows warning when photo has personal info', () => {
    render(<TestWrapper uploadState="has-personal-info" />);

    expect(
      screen.getByText(
        /this photo contains personally identifiable information/i,
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
});
