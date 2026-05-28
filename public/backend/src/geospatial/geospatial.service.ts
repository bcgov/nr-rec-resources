import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const BCGW_BASE =
  'https://maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_forest_tenure/MapServer';

const ALLOWED_LAYERS: Record<string, string> = {
  '3': `${BCGW_BASE}/3/query`,
  '5': `${BCGW_BASE}/5/query`,
};

// Pattern to validate FOREST_FILE_IDs
const FOREST_FILE_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

// ArcGIS will reject long queries; chunk IN-lists to stay
// under the upstream limit and merge the responses here.
const ID_CHUNK_SIZE = 200;

@Injectable()
export class GeospatialService {
  constructor(private readonly httpService: HttpService) {}

  async getBcgwLayer(layer: string, ids: string[]): Promise<unknown> {
    const queryUrl = ALLOWED_LAYERS[layer];
    if (!queryUrl) {
      throw new BadRequestException(
        `Layer "${layer}" is not allowed. Permitted values: ${Object.keys(ALLOWED_LAYERS).join(', ')}`,
      );
    }

    // Return an empty EsriJSON-shaped response so callers don't need a null check.
    if (ids.length === 0) {
      return { objectIdFieldName: 'OBJECTID', features: [] };
    }

    const invalid = ids.find((id) => !FOREST_FILE_ID_PATTERN.test(id));
    if (invalid !== undefined) {
      throw new BadRequestException(
        `Invalid FOREST_FILE_ID: "${invalid}". Only letters, digits, "_" and "-" are permitted.`,
      );
    }

    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += ID_CHUNK_SIZE) {
      chunks.push(ids.slice(i, i + ID_CHUNK_SIZE));
    }

    const responses = await Promise.all(
      chunks.map((chunk) => this.fetchChunk(queryUrl, chunk)),
    );

    // Stitch all chunk responses into one EsriJSON-shaped object. Features are
    // concatenated; non-feature metadata (spatialReference, geometryType, fields, etc.)
    // is taken from the first chunk that has it so the EsriJSON consumer gets a
    // complete envelope regardless of how many chunks were fetched.
    const merged: { features: unknown[]; [key: string]: unknown } = {
      objectIdFieldName: 'OBJECTID',
      features: [],
    };
    for (const data of responses) {
      for (const [key, value] of Object.entries(data)) {
        if (key === 'features') continue;
        if (!(key in merged)) merged[key] = value;
      }
      if (Array.isArray(data.features)) {
        merged.features.push(...data.features);
      }
    }
    return merged;
  }

  private async fetchChunk(
    queryUrl: string,
    ids: string[],
  ): Promise<Record<string, unknown> & { features?: unknown[] }> {
    const inList = ids.map((id) => `'${id}'`).join(',');
    const params = new URLSearchParams({
      f: 'json',
      where: `LIFE_CYCLE_STATUS_CODE='ACTIVE' AND FOREST_FILE_ID IN (${inList})`,
      outFields:
        'OBJECTID,FOREST_FILE_ID,PROJECT_NAME,PROJECT_TYPE,LIFE_CYCLE_STATUS_CODE,RMF_SKEY',
      returnGeometry: 'true',
      outSR: '102100',
    });

    const response = await firstValueFrom(
      this.httpService.get(`${queryUrl}?${params}`),
    );
    return response.data;
  }
}
