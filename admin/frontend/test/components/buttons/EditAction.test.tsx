import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditAction } from '@/components/buttons';

const mockLinkWithQueryParams = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: (props: {
    to: string;
    className?: string;
    children: React.ReactNode;
  }) => mockLinkWithQueryParams(props),
}));

describe('EditAction', () => {
  beforeEach(() => {
    mockLinkWithQueryParams.mockClear();
  });

  it('renders an edit link when enabled', () => {
    render(<EditAction to="/resource/edit" />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(mockLinkWithQueryParams).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/resource/edit',
        className: 'btn btn-outline-primary',
        children: 'Edit',
      }),
    );
  });

  it('renders a disabled button when disabled', () => {
    render(<EditAction to="/resource/edit" disabled />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
    expect(mockLinkWithQueryParams).not.toHaveBeenCalled();
  });
});
