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
        isRecreationSite={true}
        isRecreationTrail={false}
        isInterpretiveForest={false}
        advisories={null}
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
        isRecreationSite={true}
        isRecreationTrail={false}
        isInterpretiveForest={false}
        advisories={null}
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
        isRecreationSite={true}
        isRecreationTrail={false}
        isInterpretiveForest={false}
        advisories={null}
      />,
    );

    // Cash section appears
    expect(screen.getByAltText(/Cash Only icon/i)).toBeInTheDocument();
    expect(screen.getByText(/Bring cash/i)).toBeInTheDocument();
  });

  it('renders all basic info', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
        isCampingAvailable={false}
        isRecreationSite={true}
        isRecreationTrail={false}
        isInterpretiveForest={false}
        advisories={null}
      />,
    );

    // Safety heading
    expect(
      screen.getByRole('heading', { level: 3, name: /Staying safe/i }),
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

  it('renders all recreation site related info', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
        isCampingAvailable={false}
        isRecreationSite={true}
        isRecreationTrail={false}
        isInterpretiveForest={false}
        advisories={null}
      />,
    );
    // Recycle icon
    expect(screen.getByAltText(/Recycle icon/i)).toBeInTheDocument();

    // Cel reception icon
    expect(screen.getByAltText(/Cel Reception icon/i)).toBeInTheDocument();

    // Wildlife icon
    expect(
      screen.getByAltText(/Wildlife and Animal Safety icon/i),
    ).toBeInTheDocument();

    // Toilet icon
    expect(screen.getByAltText(/Toilet icon/i)).toBeInTheDocument();

    // Forest service icon
    expect(
      screen.getByAltText(/Forest Service Roads icon/i),
    ).toBeInTheDocument();

    // Campfires icon
    expect(
      screen.getByAltText(/Campfires and fire safety icon/i),
    ).toBeInTheDocument();
  });

  it('renders all recreation trail related info', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
        isCampingAvailable={false}
        isRecreationSite={false}
        isRecreationTrail={true}
        isInterpretiveForest={false}
        advisories={null}
      />,
    );
    // Recycle icon
    expect(screen.getByAltText(/Recycle icon/i)).toBeInTheDocument();

    // Cel reception icon
    expect(screen.getByAltText(/Cel Reception icon/i)).toBeInTheDocument();

    // Wildlife icon
    expect(
      screen.getByAltText(/Wildlife and Animal Safety icon/i),
    ).toBeInTheDocument();

    // Trail conditions icon
    expect(screen.getByAltText(/Trail Conditions icon/i)).toBeInTheDocument();

    // Stay on Trails icon
    expect(screen.getByAltText(/Stay on Trail icon/i)).toBeInTheDocument();

    // Toilet icon
    expect(screen.getByAltText(/Toilet icon/i)).toBeInTheDocument();

    // Forest service icon
    expect(
      screen.getByAltText(/Forest Service Roads icon/i),
    ).toBeInTheDocument();

    // Campfires icon
    expect(
      screen.getByAltText(/Campfires and fire safety icon/i),
    ).toBeInTheDocument();
  });

  it('renders all interpretive forest related info', () => {
    render(
      <KnowBeforeYouGo
        isAdditionalFeesAvailable={false}
        isReservable={false}
        isCampingAvailable={false}
        isRecreationSite={false}
        isRecreationTrail={false}
        isInterpretiveForest={true}
        advisories={null}
      />,
    );
    // Stay on Trails icon
    expect(screen.getByAltText(/Stay on Trail icon/i)).toBeInTheDocument();

    // Cel reception icon
    expect(screen.getByAltText(/Cel Reception icon/i)).toBeInTheDocument();

    // Wildlife icon
    expect(
      screen.getByAltText(/Wildlife and Animal Safety icon/i),
    ).toBeInTheDocument();

    // Recycle icon
    expect(screen.getByAltText(/Recycle icon/i)).toBeInTheDocument();

    // Campfires icon
    expect(
      screen.getByAltText(/Campfires and fire safety icon/i),
    ).toBeInTheDocument();

    // Respect and learning icon
    expect(screen.getByAltText(/Respect learning icon/i)).toBeInTheDocument();
  });
});
