import { fireEvent, render, screen } from '@testing-library/react';
import PhotoGallery from './PhotoGallery';

const photos: any = [
  {
    caption: null,
    previewUrl: 'url1',
    fullResolutionUrl: 'fullurl1',
  },
  {
    caption: 'caption2',
    previewUrl: 'url2',
    fullResolutionUrl: 'fullurl2',
  },
  {
    caption: 'caption3',
    previewUrl: 'url3',
    fullResolutionUrl: 'fullurl3',
  },
  {
    caption: 'caption4',
    previewUrl: 'url4',
    fullResolutionUrl: 'fullurl4',
  },
  {
    caption: 'caption5',
    previewUrl: 'url5',
    fullResolutionUrl: 'fullurl5',
  },
];

describe('the PhotoGallery component', () => {
  it('renders the component correctly with no photos', () => {
    render(<PhotoGallery photos={[]} />);
    expect(screen.queryByText(/Show photos/)).toBeNull();
  });

  it('renders the component correctly with 1 photo', () => {
    render(<PhotoGallery photos={photos.slice(0, 1)} />);
    expect(screen.queryByText(/Show photos/)).toBeNull();
  });

  it('renders the component correctly with 3 photos', () => {
    render(<PhotoGallery photos={photos.slice(0, 3)} />);
    expect(screen.queryAllByLabelText(/Show photos/)[0]).toBeInTheDocument();
  });

  it('renders the component correctly with 5 photos', () => {
    render(<PhotoGallery photos={photos} />);
    expect(screen.queryAllByLabelText(/Show photos/)[0]).toBeInTheDocument();
  });

  it('renders the component correctly and clicks on show photos button', () => {
    const c = <PhotoGallery photos={photos} />;
    render(c);
    const showPhotosButton = screen.queryAllByText(/Show photos/);
    if (showPhotosButton) {
      fireEvent.click(showPhotosButton[0]);
    }
    expect(showPhotosButton[0]).toBeInTheDocument();
  });

  it('renders the component correctly and clicks on the gallery', () => {
    const c = <PhotoGallery photos={photos} />;
    const { queryByTestId } = render(c);
    const divGallery = queryByTestId('park-photo-gallery-container');
    if (divGallery) {
      fireEvent.click(divGallery);
    }
    expect(divGallery).toBeInTheDocument();
  });

  it('renders the component correctly and clicks and presses keys on mobile view', () => {
    const c = <PhotoGallery photos={photos} />;
    const { queryByTestId } = render(c);
    const div = queryByTestId('clickable-mobile-div');
    const divRow = queryByTestId('clickable-mobile-div-row');
    if (div) {
      fireEvent.click(div);
      fireEvent.keyDown(div, { key: 'Enter', code: 13, charCode: 13 });
      fireEvent.keyDown(div, { key: ' ' });
    }
    if (divRow) {
      fireEvent.keyDown(divRow, { key: 'Enter', code: 13, charCode: 13 });
      fireEvent.keyDown(divRow, { key: ' ' });
    }
    expect(div).toBeInTheDocument();
    expect(divRow).toBeInTheDocument();
  });
});
