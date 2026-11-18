import {
  COLOR_BACKGROUND_GREY,
  COLOR_GOLD_DARK,
  COLOR_GREEN_DARKER,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY,
  COLOR_RED,
  COLOR_RED_LIGHT,
  COLOR_YELLOW_ADVISORY_BG,
} from '@/styles/colors';

export interface BadgeDisplay {
  label: string;
  bgColor: string;
  textColor: string;
}

const NEUTRAL_BADGE = (label = '-'): BadgeDisplay => ({
  label,
  bgColor: COLOR_BACKGROUND_GREY,
  textColor: COLOR_GREY,
});

export const getPurposeDisplay = (
  purposeCode?: string | null,
): BadgeDisplay => {
  const normalized = purposeCode?.toUpperCase().trim() ?? '';
  if (normalized === 'N') {
    return {
      label: 'NEW',
      bgColor: COLOR_GREEN_LIGHTEST,
      textColor: COLOR_GREEN_DARKER,
    };
  }
  if (normalized === 'A') {
    return {
      label: 'AMEND',
      bgColor: COLOR_YELLOW_ADVISORY_BG,
      textColor: COLOR_GOLD_DARK,
    };
  }
  if (normalized === 'R') {
    return {
      label: 'RETIRE',
      bgColor: COLOR_RED_LIGHT,
      textColor: COLOR_RED,
    };
  }
  return NEUTRAL_BADGE();
};

export const getStatusDisplay = (statusCode?: string | null): BadgeDisplay => {
  const normalized = statusCode?.toUpperCase().trim() ?? '';
  if (normalized.startsWith('PND') || normalized.includes('PEND')) {
    return {
      label: 'PENDING',
      bgColor: COLOR_YELLOW_ADVISORY_BG,
      textColor: COLOR_GOLD_DARK,
    };
  }
  if (normalized.startsWith('REJ') || normalized.includes('REJECT')) {
    return {
      label: 'REJECTED',
      bgColor: COLOR_RED_LIGHT,
      textColor: COLOR_RED,
    };
  }
  if (normalized.startsWith('APP') || normalized.includes('APPROV')) {
    return {
      label: 'APPROVED',
      bgColor: COLOR_GREEN_LIGHTEST,
      textColor: COLOR_GREEN_DARKER,
    };
  }
  return NEUTRAL_BADGE(normalized || '-');
};

export const formatSubmissionDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
};

const trimTrailingSlashes = (value: string) => {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return value.slice(0, end);
};

export const buildSncscSubmissionUrl = (statusRequestGuid?: string | null) => {
  const sncscWebUrl =
    import.meta.env.VITE_SNCSC_WEB_URL || import.meta.env.SNCSC_WEB_URL || '';
  if (!sncscWebUrl || !statusRequestGuid) return null;
  return `${trimTrailingSlashes(sncscWebUrl)}/${statusRequestGuid}`;
};
