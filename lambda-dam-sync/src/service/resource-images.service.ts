import { Client } from 'pg';
import {
  getCollectionResources,
  getResourceFieldData,
  getResourcePath,
} from './dam-api.service';
import { getClient } from './db.service';

export class ResourceImagesService {
  constructor() {}

  collectionRef: string = '728';

  private async executeSyncSqlImages(dbClient: Client, data: any) {
    const jsonParam = JSON.stringify(data);
    const query = `
      WITH src AS (
        SELECT $1::jsonb AS item
      )
      INSERT INTO rst.recreation_resource_images (ref_id, rec_resource_id, caption)
      SELECT
        (item->>'ref_id')::varchar AS ref_id,
        (item->>'rec_resource_id')::varchar AS rec_resource_id,
        (item->>'title')::varchar AS caption
      FROM src
      ON CONFLICT (ref_id) DO UPDATE
      SET
        rec_resource_id = excluded.rec_resource_id,
        caption = EXCLUDED.caption,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at,
        created_at = EXCLUDED.created_at,
        created_by = EXCLUDED.created_by;
    `;
    return await dbClient.query(query, [jsonParam]);
  }

  private async executeSyncSqlImageVariants(dbClient: Client, data: any) {
    const jsonParam = JSON.stringify(data);
    const query = `
      WITH src AS (
        SELECT $1::jsonb AS item
      ),
      expanded AS (
        SELECT
          (item->>'ref_id')::varchar AS ref_id,
        (item->>'rec_resource_id')::varchar AS rec_resource_id,
          jsonb_array_elements(item->'files') AS f
        FROM src
      )
      INSERT INTO rst.recreation_resource_image_variants (ref_id, size_code, extension, url, width, height)
      SELECT
        ref_id,
          f->>'size_code',
          f->>'extension',
          f->>'url',
          (f->>'width')::int,
          (f->>'height')::int
      FROM expanded
      on conflict (ref_id, size_code) do update
      set
        extension = excluded.extension,
        url = excluded.url,
        width = excluded.width,
        height = excluded.height,
        updated_by      = excluded.updated_by,
        updated_at      = excluded.updated_at,
        created_at      = excluded.created_at,
        created_by      = excluded.created_by;
    `;
    return await dbClient.query(query, [jsonParam]);
  }

  private async deleteImages(dbClient: Client, data: any) {
    const jsonParam = JSON.stringify(data);
    const query = `
      WITH ids AS (
        SELECT jsonb_array_elements_text($1::jsonb) AS ref_id
      )
      DELETE FROM rst.recreation_resource_images t
      WHERE t.ref_id NOT IN (SELECT ref_id FROM ids)
    `;
    return dbClient.query(query, [jsonParam]);
  }

  private async deleteImageVariants(dbClient: Client, data: any) {
    const jsonParam = JSON.stringify(data);
    const query = `
      WITH ids AS (
        SELECT jsonb_array_elements_text($1::jsonb) AS ref_id
      )
      DELETE FROM rst.recreation_resource_image_variants t
      WHERE t.ref_id NOT IN (SELECT ref_id FROM ids)
    `;
    return dbClient.query(query, [jsonParam]);
  }

  async syncImagesCollection(): Promise<any> {
    const data = await getCollectionResources(this.collectionRef);

    const BATCH_SIZE = 5;
    const results = [];

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (d: any) => {
          const [fields, files] = await Promise.all([
            getResourceFieldData(d.ref),
            getResourcePath(d.ref),
          ]);
          const recreation = fields.filter(
            (x: any) => x.name === 'recreationname',
          );
          const rec_resource = recreation.length > 0 && recreation[0]?.value;
          const rec_resource_id = rec_resource && rec_resource.split(' - ')[1];

          const recreation_title = fields.filter(
            (x: any) => x.name === 'title',
          );
          const title =
            recreation_title.length > 0 && recreation_title[0]?.value;
          return {
            ref_id: d.ref,
            rec_resource_id,
            title,
            files: files
              .filter((f: any) =>
                [
                  'original',
                  'hpr',
                  'scr',
                  'pre',
                  'pcs',
                  'thm',
                  'col',
                  'webp',
                ].includes(f.size_code),
              )
              .map((f: any) => {
                const match = f.url && f.url.match(/\/filestore\/.*/);
                const url = match && match[0];
                return {
                  size_code: f.size_code,
                  extension: f.extension,
                  url,
                  width: f.width,
                  height: f.height,
                  file_size: f.file_size,
                };
              }),
            fields: fields
              .filter((f: any) =>
                [
                  'title',
                  'closestcommunity',
                  'recreationname',
                  'recreationdistrict',
                ].includes(f.name),
              )
              .map((f: any) => {
                return {
                  name: f.name,
                  title: f.title,
                  value: f.value,
                };
              }),
          };
        }),
      );
      results.push(...batchResults);
    }
    const dbClient = getClient();
    try {
      await dbClient.connect();

      // Sync Images
      for (let i = 0; i < results.length; i++) {
        try {
          if (results[i].rec_resource_id !== '') {
            await this.executeSyncSqlImages(dbClient, results[i]);
          }
        } catch (err) {
          console.log(err);
        }
      }

      // Sync Variants
      for (let i = 0; i < results.length; i++) {
        try {
          if (results[i].rec_resource_id !== '') {
            await this.executeSyncSqlImageVariants(dbClient, results[i]);
          }
        } catch (err) {
          console.log(err);
        }
      }

      const refIds = results.map((r: any) => r.ref_id);
      console.log('IMAGES IDS', refIds);
      //Remove deleted image variants
      await this.deleteImageVariants(dbClient, refIds);
      //Remove deleted images
      await this.deleteImages(dbClient, refIds);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Data saved successfully',
        }),
      };
    } catch (error: any) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    } finally {
      await dbClient.end();
    }
  }
}
