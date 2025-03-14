import { RecreationMaintenanceDto } from './RecreationResourceDto';

export function RecreationMaintenanceDtoFromJSON(
  json: any,
): RecreationMaintenanceDto {
  return RecreationMaintenanceDtoFromJSONTyped(json);
}

export function RecreationMaintenanceDtoFromJSONTyped(
  json: any,
): RecreationMaintenanceDto {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'],
    rec_resource_id: json['rec_resource_id'],
    recreation_maintainace_code: json['recreation_maintainace_code'],
  };
}
