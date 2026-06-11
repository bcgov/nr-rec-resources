import { CustomBadge } from '@/components/custom-badge';
import {
  COLOR_BACKGROUND_GREY,
  COLOR_GOLD_DARK,
  COLOR_GREEN_DARKER,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY,
  COLOR_YELLOW_ADVISORY_BG,
} from '@/styles/colors';

interface PublicAccessStatusBadgeProps {
  label: string | null;
}

const OPEN_LABEL = 'Open';

type BadgeColors = { bgColor: string; textColor: string };

const LABEL_COLOR_MAP: Record<string, BadgeColors> = {
  Closed: { bgColor: COLOR_BACKGROUND_GREY, textColor: COLOR_GREY },
  Restricted: { bgColor: COLOR_BACKGROUND_GREY, textColor: COLOR_GREY },
  'Limited access': {
    bgColor: COLOR_YELLOW_ADVISORY_BG,
    textColor: COLOR_GOLD_DARK,
  },
  'Visit with caution': {
    bgColor: COLOR_YELLOW_ADVISORY_BG,
    textColor: COLOR_GOLD_DARK,
  },
  Open: { bgColor: COLOR_GREEN_LIGHTEST, textColor: COLOR_GREEN_DARKER },
  'Seasonal restrictions': {
    bgColor: COLOR_GREEN_LIGHTEST,
    textColor: COLOR_GREEN_DARKER,
  },
};

const DEFAULT_COLORS: BadgeColors = {
  bgColor: COLOR_GREEN_LIGHTEST,
  textColor: COLOR_GREEN_DARKER,
};

export function PublicAccessStatusBadge({
  label,
}: PublicAccessStatusBadgeProps) {
  const resolvedLabel = label ?? OPEN_LABEL;
  const { bgColor, textColor } =
    LABEL_COLOR_MAP[resolvedLabel] ?? DEFAULT_COLORS;

  return (
    <CustomBadge
      label={resolvedLabel}
      bgColor={bgColor}
      textColor={textColor}
    />
  );
}
