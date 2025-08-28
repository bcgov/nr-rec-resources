import {
  RecreationResourceDetailDto,
  RecreationResourceDetailUIModel,
  RecreationResourceDocDto,
  RecreationResourceImageDto,
} from "@/services";
import { formatDateReadable } from "@shared/index";

/**
 * Maps a RecreationResourceDetailDto to RecreationResourceDetail with additional derived descriptions.
 * @param data The original RecreationResourceDetailDto object
 * @returns RecreationResourceDetail with mapped descriptions
 */
export function mapRecreationResourceDetail(
  data: RecreationResourceDetailDto,
): RecreationResourceDetailUIModel {
  return {
    ...data,
    maintenance_standard_description:
      data.maintenance_standard_code === "U" ? "Maintained" : "User Maintained",
    recreation_district_description: data.recreation_district?.description,
    recreation_status_description: data.recreation_status?.description,
    project_established_date_readable_utc: formatDateReadable(
      data.project_established_date,
      {
        timeZone: "UTC", // this date is stored in PST timezone in database
      },
    ),
  };
}

/**
 * Gets the base URL for asset storage.
 * @returns {string} The configured assets URL or default prod environment URL.
 */
export const getBasePathForAssets = (): string =>
  import.meta.env.VITE_RECREATION_RESOURCE_ASSETS_BASE_URL ||
  "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca";

/**
 * Transforms recreation resource data by updating image URLs with full asset paths.
 * @param {RecreationResourceDocDto} docs - The recreation resource to transform
 * @returns {RecreationResourceDocDto} Transformed resource with complete image URLs
 */
export const transformRecreationResourceDocs = (
  docs: RecreationResourceDocDto[],
): RecreationResourceDocDto[] => {
  const basePath = getBasePathForAssets();
  return docs.map((doc) => ({
    ...doc,
    url: `${basePath}/${doc.url}`,
  }));
};

/**
 * Transforms recreation resource images by updating image URLs with full asset paths.
 * @param docs - The recreation resource images to transform
 * @returns Transformed images with complete URLs
 */
export const transformRecreationResourceImages = (
  docs: RecreationResourceImageDto[],
): RecreationResourceImageDto[] => {
  const basePath = getBasePathForAssets();
  return docs.map((doc) => ({
    ...doc,
    recreation_resource_image_variants:
      doc.recreation_resource_image_variants?.map((v) => ({
        ...v,
        url: `${basePath}/${v.url}`,
      })),
  }));
};

/**
 * Returns a retry handler function for React Query hooks.
 * @param options Optional config: maxRetries, onFail callback
 * @returns (retryCount, error) => boolean
 */
export function createRetryHandler({
  maxRetries = 2,
  onFail,
}: {
  maxRetries?: number;
  onFail?: (error: unknown) => void;
} = {}) {
  return (retryCount: number, error: unknown) => {
    if (retryCount >= maxRetries) {
      if (onFail) onFail(error);
      return false;
    }
    const status =
      (error &&
        typeof error === "object" &&
        "response" in error &&
        (error as any).response?.status) ||
      undefined;
    return typeof status === "number" && status >= 500 && status < 600;
  };
}
