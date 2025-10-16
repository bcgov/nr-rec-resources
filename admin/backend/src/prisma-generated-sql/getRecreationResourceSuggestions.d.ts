import * as $runtime from '@prisma/client/runtime/library';

/**
 * @param text
 */
export const getRecreationResourceSuggestions: (
  text: string,
) => $runtime.TypedSql<
  getRecreationResourceSuggestions.Parameters,
  getRecreationResourceSuggestions.Result
>;

export namespace getRecreationResourceSuggestions {
  export type Parameters = [text: string];
  export type Result = {
    name: string | null;
    rec_resource_id: string;
    recreation_resource_type: string | null;
    recreation_resource_type_code: string | null;
    district_description: string;
    display_on_public_site: boolean | null;
  };
}
