import * as $runtime from '@prisma/client/runtime/library';

/**
 * @param limit
 * @param offset
 */
export const getRecreationResourceSummary: (
  limit: number,
  offset: number,
) => $runtime.TypedSql<
  getRecreationResourceSummary.Parameters,
  getRecreationResourceSummary.Result
>;

export namespace getRecreationResourceSummary {
  export type Parameters = [limit: number, offset: number];
  export type Result = {
    rec_resource_id: string;
    name: string | null;
    display_on_public_site: boolean | null;
    district_code: string;
    district_description: string;
    rec_resource_type_code: string | null;
    rec_resource_type_description: string | null;
    status_code: number;
    status_description: string;
    closure_comment: string;
    site_point_geometry: string | null;
    total_count: number | null;
  };
}
