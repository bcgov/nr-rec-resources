import { fireEvent, render, screen } from '@testing-library/react';
import PageMenu from './PageMenu';

const s = [
  {
    sectionIndex: 0,
    href: 'link',
    title: 'title',
  },
  {
    sectionIndex: 1,
    href: 'link1',
    title: 'title1',
  },
];

describe('the PageMenu component', () => {
  it('renders the component correctly anc changes value', async () => {
    const c = <PageMenu activeSection={0} pageSections={s} />;
    const { queryByTitle } = render(c);
    const select = queryByTitle('mobile-navigation');
    if (select) {
      fireEvent.change(select, { target: { value: 1 } });
    }
    const selectedOption = screen.getByText('title1');
    expect(selectedOption).toBeInTheDocument();
  });
});
