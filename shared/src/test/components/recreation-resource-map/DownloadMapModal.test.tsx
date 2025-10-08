import { render, screen, fireEvent } from '@testing-library/react';
import DownloadMapModal from '@shared/components/recreation-resource-map/DownloadMapModal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@shared/components/recreation-resource-map/helpers/mapDownloadHandlers',
  () => ({
    downloadGPX: vi.fn(),
    downloadKML: vi.fn(),
  }),
);

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
      '@shared/components/recreation-resource-map/helpers/mapDownloadHandlers'
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

    // Deselect KML
    fireEvent.click(kmlCheckbox);
    expect(kmlCheckbox).not.toBeChecked();

    // Select GPX
    fireEvent.click(gpxCheckbox);
    expect(gpxCheckbox).toBeChecked();

    // Deselect GPX
    fireEvent.click(gpxCheckbox);
    expect(gpxCheckbox).not.toBeChecked();

    // Download GPX and KML
    fireEvent.click(gpxCheckbox);
    fireEvent.click(kmlCheckbox);
    fireEvent.click(screen.getByText('Download'));
    expect(downloadGPX).toHaveBeenCalledWith(styledFeatures, 'Test Resource');
    expect(downloadKML).toHaveBeenCalledWith(
      styledFeatures,
      recResource,
      undefined,
    );
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
