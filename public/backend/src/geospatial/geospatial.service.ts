import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const BCGW_BASE =
  'https://maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_forest_tenure/MapServer';

const ALLOWED_LAYERS: Record<string, string> = {
  '3': `${BCGW_BASE}/3/query`,
  '5': `${BCGW_BASE}/5/query`,
};

@Injectable()
export class GeospatialService {
  constructor(private readonly httpService: HttpService) {}

  async getBcgwLayer(layer: string, extent: string): Promise<unknown> {
    const queryUrl = ALLOWED_LAYERS[layer];
    if (!queryUrl) {
      throw new BadRequestException(
        `Layer "${layer}" is not allowed. Permitted values: ${Object.keys(ALLOWED_LAYERS).join(', ')}`,
      );
    }

    const params = new URLSearchParams({
      f: 'json',
      where: "LIFE_CYCLE_STATUS_CODE='ACTIVE'",
      outFields:
        'OBJECTID,FOREST_FILE_ID,PROJECT_NAME,PROJECT_TYPE,LIFE_CYCLE_STATUS_CODE,RMF_SKEY',
      geometry: extent,
      geometryType: 'esriGeometryEnvelope',
      inSR: '102100',
      spatialRel: 'esriSpatialRelIntersects',
      outSR: '102100',
    });

    const response = await firstValueFrom(
      this.httpService.get(`${queryUrl}?${params}`),
    );

    return { objectIdFieldName: 'OBJECTID', ...response.data };
  }
}
