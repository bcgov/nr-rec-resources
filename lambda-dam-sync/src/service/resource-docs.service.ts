import { Client } from 'pg';
import {
  getCollectionResources,
  getResourceFieldData,
  getResourcePath,
} from './dam-api.service';
import { getClient } from './db.service';

export class ResourceDocsService {
  constructor() {}

  collectionRef: string = '739';

  private async executeSyncSqlDocs(dbClient: Client, data: any) {
    const jsonParam = JSON.stringify(data);
    const query = `
      WITH src AS (
        SELECT $1::jsonb AS item
      )
      INSERT INTO rst.recreation_resource_docs (ref_id, rec_resource_id, title, url, doc_code, extension)
      SELECT
        (item->>'ref_id')::varchar AS ref_id,
        (item->>'rec_resource_id')::varchar AS rec_resource_id,
        (item->>'title')::varchar AS title,
        (item->>'url')::varchar AS url,
        (item->>'doc_code')::varchar AS doc_code,
        (item->>'extension')::varchar AS extension
      FROM src
      on conflict (ref_id) do update
      set
        rec_resource_id = excluded.rec_resource_id,
        title = excluded.title,
        url = excluded.url,
        doc_code = excluded.doc_code,
        extension = excluded.extension,
        updated_by      = excluded.updated_by,
        updated_at      = excluded.updated_at,
        created_at      = excluded.created_at,
        created_by      = excluded.created_by;
    `;
    return await dbClient.query(query, [jsonParam]);
  }

  private async deleteDocs(dbClient: Client, data: any) {
    const jsonParam = JSON.stringify(data);
    const query = `
      WITH ids AS (
        SELECT jsonb_array_elements_text($1::jsonb) AS ref_id
      )
      DELETE FROM rst.recreation_resource_docs t
      WHERE t.ref_id NOT IN (SELECT ref_id FROM ids)
    `;
    return dbClient.query(query, [jsonParam]);
  }

  async syncDocsCollection(): Promise<any> {
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

          const recreation_url = files.filter(
            (x: any) => x.size_code === 'original',
          );
          const url_row = recreation_url.length > 0 && recreation_url[0]?.url;
          const match = url_row && url_row.match(/\/filestore\/.*/);
          const url = match && match[0];
          const extension =
            recreation_url.length > 0 && recreation_url[0]?.extension;
          return {
            ref_id: d.ref,
            rec_resource_id,
            title,
            url,
            doc_code: 'RM',
            extension,
          };
        }),
      );
      results.push(...batchResults);
    }
    const dbClient = getClient();
    try {
      await dbClient.connect();

      for (let i = 0; i < results.length; i++) {
        try {
          if (results[i].rec_resource_id !== '') {
            await this.executeSyncSqlDocs(dbClient, results[i]);
          }
        } catch (err) {
          console.log(err);
        }
      }

      const refIds = results.map((r: any) => r.ref_id);
      //Remove deleted images
      await this.deleteDocs(dbClient, refIds);

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
