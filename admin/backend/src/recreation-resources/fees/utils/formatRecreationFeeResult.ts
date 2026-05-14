import { Prisma } from '@generated/prisma';
import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';

export type FeeWithDescription = Prisma.recreation_feeGetPayload<{
  include: { with_description: { select: { description: true } } };
}> & {
  recurring_ind: boolean;
  recurring_start_mmdd: string | null;
  recurring_end_mmdd: string | null;
};

export function formatRecreationFeeResult(
  fee: FeeWithDescription,
): RecreationFeeDto {
  return {
    fee_id: fee.fee_id,
    fee_amount: fee.fee_amount ?? undefined,
    fee_start_date: fee.fee_start_date ?? undefined,
    fee_end_date: fee.fee_end_date ?? undefined,
    recreation_fee_code: fee.recreation_fee_code,
    fee_type_description: fee.with_description?.description ?? '',
    monday_ind: fee.monday_ind ?? undefined,
    tuesday_ind: fee.tuesday_ind ?? undefined,
    wednesday_ind: fee.wednesday_ind ?? undefined,
    thursday_ind: fee.thursday_ind ?? undefined,
    friday_ind: fee.friday_ind ?? undefined,
    saturday_ind: fee.saturday_ind ?? undefined,
    sunday_ind: fee.sunday_ind ?? undefined,
    recurring_ind: fee.recurring_ind ?? false,
    recurring_start_mmdd: fee.recurring_start_mmdd ?? undefined,
    recurring_end_mmdd: fee.recurring_end_mmdd ?? undefined,
  };
}
