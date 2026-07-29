import { ApiPropertyOptions } from '@nestjs/swagger';

/**
 * Builders for the recurring "nullable scalar" @ApiProperty shape used
 * across the BCGW recreation feature DTOs, where fields only vary by
 * description and example.
 */
export function nullableStringProperty(
  description: string,
  example?: string | null,
): ApiPropertyOptions {
  return { type: String, description, example, nullable: true };
}

export function nullableNumberProperty(
  description: string,
  example?: number | null,
): ApiPropertyOptions {
  return { type: Number, description, example, nullable: true };
}
