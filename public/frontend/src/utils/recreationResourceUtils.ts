import { ROUTE_PATHS } from '@/constants/routes';
import { RecreationResourceDetailModel } from '@/service/custom-models';

/**
 * Returns the canonical absolute URL for a rec resource detail page.
 * @param recResourceId The rec resource ID
 */
export function getRecResourceDetailPageUrl(recResourceId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const route = ROUTE_PATHS.REC_RESOURCE.replace('$id', recResourceId);
  return `${baseUrl}${route}`;
}

/**
 * Checks if the given recreation resource is a rec trail.
 */
export function isRecreationTrail(
  resource: RecreationResourceDetailModel,
): boolean {
  return resource.rec_resource_type.toLowerCase() === 'recreation trail';
}

/**
 * Checks if the given recreation resource is a rec site.
 */
export function isRecreationSite(
  resource: RecreationResourceDetailModel,
): boolean {
  return resource.rec_resource_type.toLowerCase() === 'recreation site';
}
/**
 * Checks if the given recreation resource is interpretive forest.
 */
export function isInterpretiveForest(
  resource: RecreationResourceDetailModel,
): boolean {
  return resource.rec_resource_type.toLowerCase() === 'interpretive forest';
}
