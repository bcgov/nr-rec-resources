import { fireEvent, render, screen } from '@testing-library/react';
import CardCarousel from '@/components/rec-resource/card/CardCarousel';


const imageList = [
  { imageUrl: 'url1' },
  { imageUrl: 'url2' },
  { imageUrl: 'url3' },
];

describe('the CardCarousel component', () => {
  it('renders the CardCarousel component', async () => {
    render(<CardCarousel imageList={imageList} />);
    const resources = screen.queryAllByAltText('rec resource carousel');
    expect(resources.length).toEqual(6);
  });

  it('renders the CardCarousel component and select the carousel', async () => {
    const c = <CardCarousel imageList={imageList} />;
    const { queryByTestId } = render(c);
    const image = queryByTestId('card-carousel');
    if (image) {
      fireEvent.select(image);
    }
    const resources = screen.queryAllByAltText('rec resource carousel');
    expect(resources.length).toEqual(6);
  });

  it('renders the CardCarousel component and press the arrows', async () => {
    const c = <CardCarousel imageList={imageList} />;
    const { queryByTestId } = render(c);
    const image = queryByTestId(`image-${imageList[1].imageUrl}`);
    if (image) {
      fireEvent.keyDown(image, { key: "ArrowRight" });
      fireEvent.keyDown(image, { key: "ArrowLeft" });
    }
    const resources = screen.queryAllByAltText('rec resource carousel');
    expect(resources.length).toEqual(6);
  });

  it('renders an empty CardCarousel component', async () => {
    render(<CardCarousel imageList={[]} />);
    const resources = screen.queryAllByAltText('rec resource carousel');
    expect(resources.length).toEqual(0);
  });
});
