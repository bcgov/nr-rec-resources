import { act, fireEvent, render, screen } from '@testing-library/react';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { vi } from 'vitest';

const mockScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', {
    value,
    writable: true,
    configurable: true,
  });
};

describe('the ScrollToTop component', () => {
  it('renders the component, scrolls and click the button', () => {
    window.scrollTo = vi.fn();
    const addEventListenerMock = vi.spyOn(window, 'addEventListener');
    const scrollEvent = new Event('scroll');
    const c = <ScrollToTop />;
    const { queryByTestId } = render(c);
    act(() => {
      const scrollHandler = addEventListenerMock.mock.calls[0][1];
      if (typeof scrollHandler === 'function') {
        mockScrollY(500);
        scrollHandler(scrollEvent);
      }
    });

    const button = queryByTestId('scroll-button');
    if (button) {
      fireEvent.click(button);
    }

    expect(screen.getByTestId('scroll-button')).toBeInTheDocument();
  });
});
