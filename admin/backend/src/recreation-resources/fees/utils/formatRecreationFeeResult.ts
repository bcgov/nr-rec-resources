import { Prisma } from '@prisma/client';
import { RecreationFeeDto } from '@/recreation-resources/fees/dto/recreation-fee.dto';

export type FeeWithDescription = Prisma.recreation_feeGetPayload<{
  include: { with_description: { select: { description: true } } };
}>;

/**
 * Formats a Prisma `recreation_fee` record (including `with_description`)
 * into the `RecreationFeeDto` shape consumed by consumers of the service.
 *
 * - Converts DB `null` values to `undefined` where the API expects that.
 * - Extracts `with_description.description` into `fee_type_description`.
 * - Strips the nested `with_description` relation from the resulting DTO.
 */
export function formatRecreationFeeResult(
  fee: FeeWithDescription,
): RecreationFeeDto {
  return {
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
  };
}
