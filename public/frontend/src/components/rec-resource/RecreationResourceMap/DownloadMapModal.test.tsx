import { render, screen, fireEvent } from '@testing-library/react';
import DownloadMapModal from '@/components/rec-resource/RecreationResourceMap/DownloadMapModal';
import { vi } from 'vitest';

vi.mock('@/components/rec-resource/RecreationResourceMap/helpers', () => ({
  downloadGPX: vi.fn(),
  downloadKML: vi.fn(),
}));

describe('DownloadMapModal', () => {
  const setIsOpen = vi.fn();
  const styledFeatures = [{ id: 'fake-feature' }] as any;
  const recResource = { name: 'Test Resource' } as any;

  beforeEach(() => {
    setIsOpen.mockClear();
  });

  it('renders when isOpen is true', () => {
    render(
      <DownloadMapModal
        isOpen={true}
        setIsOpen={setIsOpen}
        styledFeatures={styledFeatures}
        recResource={recResource}
      />,
    );

    expect(screen.getByText('Export map file')).toBeInTheDocument();
    expect(screen.getByText('KML File')).toBeInTheDocument();
    expect(screen.getByText('GPX File')).toBeInTheDocument();
  });

  it('calls setIsOpen(false) when close or cancel is clicked', () => {
    render(
      <DownloadMapModal
        isOpen={true}
        setIsOpen={setIsOpen}
        styledFeatures={styledFeatures}
        recResource={recResource}
      />,
    );

    fireEvent.click(screen.getByLabelText('close'));
    expect(setIsOpen).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText('Cancel'));
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('toggles KML and GPX checkboxes and triggers the correct download', async () => {
    const { downloadKML, downloadGPX } = await import(
      '@/components/rec-resource/RecreationResourceMap/helpers'
    );

    render(
      <DownloadMapModal
        isOpen={true}
        setIsOpen={setIsOpen}
        styledFeatures={styledFeatures}
        recResource={recResource}
      />,
    );

    const kmlCheckbox = screen.getByLabelText(/KML File/i);
    const gpxCheckbox = screen.getByLabelText(/GPX File/i);

    // Select KML
    fireEvent.click(kmlCheckbox);
    expect(kmlCheckbox).toBeChecked();
    expect(gpxCheckbox).not.toBeChecked();

    // Deselect KML
    fireEvent.click(kmlCheckbox);
    expect(kmlCheckbox).not.toBeChecked();
    expect(gpxCheckbox).not.toBeChecked();

    // Select GPX (deselects KML)
    fireEvent.click(kmlCheckbox);
    fireEvent.click(gpxCheckbox);
    expect(gpxCheckbox).toBeChecked();
    expect(kmlCheckbox).not.toBeChecked();

    // Deselect GPX
    fireEvent.click(gpxCheckbox);
    expect(gpxCheckbox).not.toBeChecked();
    expect(kmlCheckbox).not.toBeChecked();

    // Download GPX
    fireEvent.click(gpxCheckbox);
    fireEvent.click(screen.getByText('Download'));
    expect(downloadGPX).toHaveBeenCalledWith(styledFeatures, 'Test Resource');
    expect(downloadKML).not.toHaveBeenCalled();

    // Toggle KML back on and download
    fireEvent.click(kmlCheckbox);
    fireEvent.click(screen.getByText('Download'));
    expect(downloadKML).toHaveBeenCalledWith(styledFeatures, recResource);
  });

  it('disables download button when no checkbox is selected', () => {
    render(
      <DownloadMapModal
        isOpen={true}
        setIsOpen={setIsOpen}
        styledFeatures={styledFeatures}
        recResource={recResource}
      />,
    );

    const downloadButton = screen.getByText('Download') as HTMLButtonElement;
    expect(downloadButton).toBeDisabled();
  });
});
