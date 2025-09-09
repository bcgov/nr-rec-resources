import { render, screen } from '@testing-library/react';
import KnowBeforeYouGo from './KnowBeforeYouGo';
import { SectionTitles } from '@/components/rec-resource/enum';
import { describe, it, expect } from 'vitest';

describe('KnowBeforeYouGo', () => {
  it('renders reservable content when isReservable = true', () => {
    render(
      <KnowBeforeYouGo isAdditionalFeesAvailable={false} isReservable={true} />,
    );

    // Section heading
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: SectionTitles.KNOW_BEFORE_YOU_GO,
      }),
    ).toBeInTheDocument();

    // Reservable heading
    expect(
      screen.getByRole('heading', { level: 3, name: /Reservable/i }),
    ).toBeInTheDocument();

    // Reservable paragraph
    expect(
      screen.getByText(/This site has some reservations available/i),
    ).toBeInTheDocument();

    // Reservations icon
    expect(screen.getByAltText(/Reservations icon/i)).toBeInTheDocument();

    // Cash instructions inside reservable branch
    expect(
      screen.getByText(/Most sites operate on a cash-only basis/i),
    ).toBeInTheDocument();
  });

  it('renders FCFS content when isReservable = false', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
      />,
    );

    // Heading changes
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /First come, first served/i,
      }),
    ).toBeInTheDocument();

    // FCFS paragraph
    expect(
      screen.getByText(/This site operates on a First Come, First Served/i),
    ).toBeInTheDocument();

    // Should NOT render Reservations icon
    expect(screen.queryByAltText(/Reservations icon/i)).not.toBeInTheDocument();
  });

  it('renders additional fees section when isAdditionalFeesAvailable = true and not reservable', () => {
    render(
      <KnowBeforeYouGo isAdditionalFeesAvailable={true} isReservable={false} />,
    );

    // Cash only section appears
    expect(screen.getByAltText(/Cash Only icon/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash Only/i)).toBeInTheDocument();
  });

  it('always renders safety and visit responsibly sections', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
      />,
    );

    // Safety heading
    expect(
      screen.getByRole('heading', { level: 3, name: /Staying safe/i }),
    ).toBeInTheDocument();

    // Recycle icon
    expect(screen.getByAltText(/Recycle icon/i)).toBeInTheDocument();

    // Cel reception icon
    expect(screen.getByAltText(/Cel Reception icon/i)).toBeInTheDocument();

    // Info box text
    expect(
      screen.getByText(/Review the detailed guides under visit responsibly/i),
    ).toBeInTheDocument();

    // Visit responsibly section
    expect(
      screen.getByRole('heading', { level: 3, name: /Visit responsibly/i }),
    ).toBeInTheDocument();

    // Guides list
    expect(
      screen.getByText(/Alerts, closures, and Warnings/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Fire Prohibitions and Restrictions/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Rules for Recreation Sites and Trails/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/The Camper's Code/i)).toBeInTheDocument();
  });
});
