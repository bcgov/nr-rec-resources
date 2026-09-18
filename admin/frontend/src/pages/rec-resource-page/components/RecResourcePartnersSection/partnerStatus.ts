import {
  COLOR_BACKGROUND_GREY,
  COLOR_GREEN_DARKER,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY,
  COLOR_RED,
  COLOR_RED_LIGHT,
} from '@/styles/colors';

/**
 * An agreement is expired only when it has an end date that has passed. An
 * agreement with no end date is open-ended and therefore active.
 *
 * Shared by the read-only and edit views so the two cannot disagree about the
 * same record.
 */
export function isAgreementExpired(
  agreementEndDate?: string | null,
  now: Date = new Date(),
): boolean {
  if (!agreementEndDate) return false;

  // Bare YYYY-MM-DD parses as UTC midnight, matching how the API serialises
  // the date column. Appending a time would parse as local and shift the day
  // for viewers east of UTC.
  const endDate = new Date(agreementEndDate);
  if (Number.isNaN(endDate.getTime())) return false;

  // Compared against today's UTC midnight rather than the current instant, so
  // an agreement stays current through the whole of its end date instead of
  // flipping to Expired partway through that day. This mirrors the public
  // site's filter (`agreement_end_date >= today`) in
  // RecreationResourceService.findSiteOperatorClientNumber, so both apps agree
  // about the same record.
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  return endDate.getTime() < todayUtc;
}

export const AGREEMENT_STATUS_BADGE = {
  active: {
    label: 'Active',
    bgColor: COLOR_GREEN_LIGHTEST,
    textColor: COLOR_GREEN_DARKER,
  },
  expired: {
    label: 'Expired',
    bgColor: COLOR_BACKGROUND_GREY,
    textColor: COLOR_GREY,
  },
} as const;

/** Mirrors the archived (AR) chip on the resource details page. */
export const CANCELLED_BADGE = {
  label: 'Cancelled',
  bgColor: COLOR_RED_LIGHT,
  textColor: COLOR_RED,
} as const;

/**
 * A cancelled agreement always reads as Expired, whatever its end date says.
 * The separate "Cancelled" chip distinguishes it from a term that simply lapsed.
 */
export function getAgreementStatusBadge(
  agreementEndDate?: string | null,
  cancelled = false,
) {
  return cancelled || isAgreementExpired(agreementEndDate)
    ? AGREEMENT_STATUS_BADGE.expired
    : AGREEMENT_STATUS_BADGE.active;
}

/** Formats a YYYY-MM-DD API date for display. */
export function formatAgreementDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
