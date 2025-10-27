import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecResourceOverviewItem } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/RecResourceOverviewItem';

describe('RecResourceOverviewItem', () => {
  it('renders label and value', () => {
    render(<RecResourceOverviewItem label="Label" value="Value" />);
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('renders HTML value when isHtml is true', () => {
    render(
      <RecResourceOverviewItem label="HTML Label" value="<b>Bold</b>" isHtml />,
    );
    expect(screen.getByText('HTML Label')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
  });

  it('returns null if value is falsy', () => {
    const { container } = render(
      <RecResourceOverviewItem label="Label" value={undefined} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
