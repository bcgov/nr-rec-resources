import { CustomBadge } from '@/components/custom-badge';
import {
  COLOR_BACKGROUND_GREY,
  COLOR_GREEN_DARKER,
  COLOR_GREEN_LIGHTEST,
  COLOR_GREY,
} from '@/styles/colors';

interface AdminStatusBadgeProps {
  label: string;
  statusCode: number;
}

export function AdminStatusBadge({ label, statusCode }: AdminStatusBadgeProps) {
  const isOpenStatus = statusCode === 1;

  return (
    <CustomBadge
      label={label}
      bgColor={isOpenStatus ? COLOR_GREEN_LIGHTEST : COLOR_BACKGROUND_GREY}
      textColor={isOpenStatus ? COLOR_GREEN_DARKER : COLOR_GREY}
    />
  );
}
