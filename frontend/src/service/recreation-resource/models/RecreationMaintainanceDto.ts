import { RecreationmaintenanceDto } from './RecreationResourceDto';

export function RecreationmaintenanceDtoFromJSON(
  json: any,
): RecreationmaintenanceDto {
  return RecreationmaintenanceDtoFromJSONTyped(json);
}

export function RecreationmaintenanceDtoFromJSONTyped(
  json: any,
): RecreationmaintenanceDto {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'],
    rec_resource_id: json['rec_resource_id'],
    recreation_maintenance_code: json['recreation_maintenance_code'],
  };
}
