import { PublicAccessStatusBadge } from '@/components/public-access-status-badge/PublicAccessStatusBadge';
import {
  COLOR_BACKGROUND_GREY,
  COLOR_GOLD_DARK,
  COLOR_GREEN_DARKER,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY,
  COLOR_YELLOW_ADVISORY_BG,
} from '@/styles/colors';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PublicAccessStatusBadge', () => {
  it('renders the label text', () => {
    render(<PublicAccessStatusBadge label="Open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('defaults to Open label and green colors when label is null', () => {
    render(<PublicAccessStatusBadge label={null} />);
    const badge = screen.getByText('Open');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({
      backgroundColor: COLOR_GREEN_LIGHTEST,
      color: COLOR_GREEN_DARKER,
    });
  });

  it('renders Open with green colors', () => {
    render(<PublicAccessStatusBadge label="Open" />);
    expect(screen.getByText('Open')).toHaveStyle({
      backgroundColor: COLOR_GREEN_LIGHTEST,
      color: COLOR_GREEN_DARKER,
    });
  });

  it('renders Seasonal restrictions with green colors', () => {
    render(<PublicAccessStatusBadge label="Seasonal restrictions" />);
    expect(screen.getByText('Seasonal restrictions')).toHaveStyle({
      backgroundColor: COLOR_GREEN_LIGHTEST,
      color: COLOR_GREEN_DARKER,
    });
  });

  it('renders Closed with grey colors', () => {
    render(<PublicAccessStatusBadge label="Closed" />);
    expect(screen.getByText('Closed')).toHaveStyle({
      backgroundColor: COLOR_BACKGROUND_GREY,
      color: COLOR_GREY,
    });
  });

  it('renders Restricted with grey colors', () => {
    render(<PublicAccessStatusBadge label="Restricted" />);
    expect(screen.getByText('Restricted')).toHaveStyle({
      backgroundColor: COLOR_BACKGROUND_GREY,
      color: COLOR_GREY,
    });
  });

  it('renders Limited access with yellow advisory colors', () => {
    render(<PublicAccessStatusBadge label="Limited access" />);
    expect(screen.getByText('Limited access')).toHaveStyle({
      backgroundColor: COLOR_YELLOW_ADVISORY_BG,
      color: COLOR_GOLD_DARK,
    });
  });

  it('renders Visit with caution with yellow advisory colors', () => {
    render(<PublicAccessStatusBadge label="Visit with caution" />);
    expect(screen.getByText('Visit with caution')).toHaveStyle({
      backgroundColor: COLOR_YELLOW_ADVISORY_BG,
      color: COLOR_GOLD_DARK,
    });
  });

  it('falls back to default green colors for unrecognized labels', () => {
    render(<PublicAccessStatusBadge label="Unknown Status" />);
    expect(screen.getByText('Unknown Status')).toHaveStyle({
      backgroundColor: COLOR_GREEN_LIGHTEST,
      color: COLOR_GREEN_DARKER,
    });
  });
});
