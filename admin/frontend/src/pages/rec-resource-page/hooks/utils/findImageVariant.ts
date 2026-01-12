import { RecreationResourceImageVariantDto } from '@/services/recreation-resource-admin';

export function findImageVariant(
  variants: RecreationResourceImageVariantDto[] | undefined,
  sizeCode: 'original' | 'scr' | 'pre' | 'thm',
): RecreationResourceImageVariantDto | undefined {
  return variants?.find((v) => v.size_code === sizeCode);
}
