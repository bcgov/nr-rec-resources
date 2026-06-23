import { CustomBadge } from '@/components/custom-badge';
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

interface FileStatusBadgeProps {
  /** Status code from the API (e.g. "AR", "HI", "PE") */
  code: string | null | undefined;
  label?: string | null;
}

type BadgeColors = { bgColor: string; textColor: string };

const DEFAULT_COLORS: BadgeColors = {
  bgColor: COLOR_BACKGROUND_GREY,
  textColor: COLOR_GREY,
};

const REC_STATUS_COLOR_MAP: Record<string, BadgeColors> = {
  AR: { bgColor: COLOR_RED_LIGHT, textColor: COLOR_RED },
  HI: { bgColor: COLOR_GREEN_LIGHTEST, textColor: COLOR_GREEN_DARKER },
  PE: { bgColor: COLOR_YELLOW_ADVISORY_BG, textColor: COLOR_GOLD_DARK },
  DD: { bgColor: COLOR_RED_LIGHT, textColor: COLOR_RED },
  CL: { bgColor: COLOR_BACKGROUND_GREY, textColor: COLOR_GREY },
  DE: { bgColor: COLOR_BACKGROUND_GREY, textColor: COLOR_GREY },
  EE: { bgColor: COLOR_RED_LIGHT, textColor: COLOR_RED },
  HX: { bgColor: COLOR_RED_LIGHT, textColor: COLOR_RED },
  NC: { bgColor: COLOR_BACKGROUND_GREY, textColor: COLOR_GREY },
  PI: { bgColor: COLOR_YELLOW_ADVISORY_BG, textColor: COLOR_GOLD_DARK },
};

export function FileStatusBadge({ code, label }: FileStatusBadgeProps) {
  if (!code) return null;

  const resolvedLabel = label ?? code;
  const { bgColor, textColor } = REC_STATUS_COLOR_MAP[code] ?? DEFAULT_COLORS;

  return (
    <CustomBadge
      label={resolvedLabel}
      bgColor={bgColor}
      textColor={textColor}
    />
  );
}
