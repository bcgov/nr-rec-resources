import { RecResourceOverviewItem } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components/RecResourceOverviewItem';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

  it('renders dash if value is falsy', () => {
    render(<RecResourceOverviewItem label="Label" value={undefined} />);
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
