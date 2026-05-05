import { render, screen } from '@testing-library/react';
import KnowBeforeYouGo from './KnowBeforeYouGo';
import { SectionTitles } from '@/components/rec-resource/enum';
import { describe, it, expect } from 'vitest';

describe('KnowBeforeYouGo', () => {
  it('renders reservable content when isReservable = true', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isCampingAvailable={false}
        isReservable={true}
      />,
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

    // Cash instructions inside reservable branch
    expect(
      screen.getByText(/Most sites operate on a cash-only basis/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /some site operators may be able to accept card payments/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders FCFS content when isReservable = false and isCampingAvailable = true', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isCampingAvailable={true}
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
  });

  it('renders additional fees section when isAdditionalFeesAvailable = true and not reservable', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={true}
        isReservable={false}
        isCampingAvailable={false}
      />,
    );

    // Cash section appears
    expect(screen.getByAltText(/Cash Only icon/i)).toBeInTheDocument();
    expect(screen.getByText(/Bring cash/i)).toBeInTheDocument();
  });

  it('always renders safety and visit responsibly sections', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
        isCampingAvailable={false}
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

  it('always renders the four new safety sections', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
        isCampingAvailable={false}
      />,
    );

    expect(screen.getByText(/Wildlife & Animal Safety/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You may encounter wildlife, including bears/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/Toilets & Sanitation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Toilet facilities may be limited or unavailable/i),
    ).toBeInTheDocument();

    expect(screen.getByText('Forest Service Roads')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Access to this site may involve driving on Forest Service Roads/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /local road safety information/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Campfires & Fire Safety/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Campfire bans or restrictions may be in place/i),
    ).toBeInTheDocument();
  });
});
