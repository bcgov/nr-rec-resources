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
    recreation_maintenance_code: json['recreation_maintenance_code'],
  };
}

export interface RecreationMaintenanceDto {
  id: number;
  rec_resource_id: string;
  recreation_maintenance_code: string;
}
