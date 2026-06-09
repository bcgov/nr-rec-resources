import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';

export type FeeWithDescription = {
  fee_id: number;
  fee_amount: number | null;
  fee_start_date: Date | null;
  fee_end_date: Date | null;
  recreation_fee_code: string;
  recreation_fee_sub_code?: string | null;
  monday_ind?: string | null;
  tuesday_ind?: string | null;
  wednesday_ind?: string | null;
  thursday_ind?: string | null;
  friday_ind?: string | null;
  saturday_ind?: string | null;
  sunday_ind?: string | null;
  recurring_ind: boolean;
  recurring_start_mmdd: string | null;
  recurring_end_mmdd: string | null;
  with_description?: { description?: string | null } | null;
  with_sub_description?: { description?: string | null } | null;
};

export function formatRecreationFeeResult(
  fee: FeeWithDescription,
): RecreationFeeDto {
  const feeTypeDescription = fee.with_description?.description ?? '';
  const feeSubTypeDescription =
    fee.with_sub_description?.description ?? undefined;

  return {
    fee_id: fee.fee_id,
    fee_amount: fee.fee_amount ?? undefined,
    fee_start_date: fee.fee_start_date ?? undefined,
    fee_end_date: fee.fee_end_date ?? undefined,
    recreation_fee_code: fee.recreation_fee_code,
    recreation_fee_sub_code: fee.recreation_fee_sub_code ?? undefined,
    fee_type_description: feeSubTypeDescription
      ? `${feeTypeDescription} - ${feeSubTypeDescription}`
      : feeTypeDescription,
    fee_sub_type_description: feeSubTypeDescription,
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
