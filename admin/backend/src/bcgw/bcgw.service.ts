import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { S3Service } from '@/s3/s3.service';
import { PrismaService } from 'src/prisma.service';
import { BcgwExportService } from './export/bcgw-export.service';
import { BcgwLayer, findBcgwLayer } from './export/bcgw-layers';
import { BcgwPaginatedResult } from './dto/bcgw-paginated-features.dto';

/**
 * How long a redirect's presigned URL stays valid. Long enough for BCGW to
 * download a large layer over a slow link, short enough that a leaked URL
 * expires quickly.
 */
const DOWNLOAD_URL_EXPIRY_SECONDS = 3600;

/** Row shape returned by the paginated layer queries. */
type LayerRow = Record<string, unknown> & { total_count: number | null };

/**
 * Serves BCGW layers two ways.
 *
 * The bulk path is a presigned URL for the file BcgwExportService produced out of
 * band, which is how BCGW consumes a whole layer in one GET. The paginated path
 * reads the views live, for debugging and for any consumer that would rather page
 * than download a whole layer.
 *
 * The two can disagree: pagination sees the materialized views as of their last
 * refresh, while a download sees the last export run. That is expected, and the
 * manifest's generated_at is what makes the download's age legible.
 */
@Injectable()
export class BcgwService {
  private readonly logger = new Logger(BcgwService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(S3Service)
    private readonly s3Service: S3Service | null,
  ) {}

  /**
   * The bucket is optional config, so reads go through here to fail with
   * something explainable instead of a null dereference.
   */
  private requireS3(): S3Service {
    if (!this.s3Service) {
      throw new ServiceUnavailableException(
        'BCGW layer downloads are not configured on this environment ' +
          '(BCGW_EXPORTS_BUCKET is unset).',
      );
    }
    return this.s3Service;
  }

  /**
   * Presigned download URL for a layer's most recent export.
   *
   * @param layerName - Layer name, matching the endpoint path segment
   * @returns A presigned URL for the gzipped GeoJSON file
   * @throws NotFoundException if no export has been produced yet
   */
  async getLayerDownloadUrl(layerName: string): Promise<string> {
    const s3 = this.requireS3();
    const key = BcgwExportService.dataKey(layerName);

    if (!(await s3.objectExists(key))) {
      this.logger.warn(`No export available for layer "${layerName}"`);
      throw new NotFoundException(
        `No export is available for "${layerName}" yet. The export job runs on a ` +
          `schedule; if this persists, check that it is enabled and succeeding.`,
      );
    }

    return s3.getSignedUrl(key, DOWNLOAD_URL_EXPIRY_SECONDS);
  }

  /**
   * One page of a layer, read live from the `bcgw` views.
   *
   * @param layerName - Layer name, matching the endpoint path segment
   * @param page - 1-indexed page number; anything lower is clamped to 1
   * @throws NotFoundException if the layer name is not recognised
   */
  async findLayerPage<TProperties>(
    layerName: string,
    page: number = 1,
  ): Promise<BcgwPaginatedResult<TProperties>> {
    const layer = findBcgwLayer(layerName);
    if (!layer) {
      throw new NotFoundException(`Unknown BCGW layer "${layerName}"`);
    }

    const currentPage = Math.max(Math.trunc(page) || 1, 1);
    const offset = (currentPage - 1) * layer.pageSize;
    const rows = await this.queryPage(layer, offset);
    const total = rows.length > 0 ? (rows[0]!.total_count ?? 0) : 0;

    return {
      type: 'FeatureCollection',
      features: rows.map((row) => this.toFeature<TProperties>(row)),
      meta: {
        total,
        page: currentPage,
        totalPages: Math.ceil(total / layer.pageSize),
        pageSize: layer.pageSize,
      },
    };
  }

  /**
   * Wraps the layer's query so the total can come back with the page rather than
   * costing a second scan. `COUNT(*) OVER ()` is evaluated before LIMIT, so it
   * counts the whole layer.
   *
   * The query text is static and the user-supplied values are parameterised, so
   * $queryRawUnsafe is only carrying the interpolated column and view names that
   * the layer definitions own.
   */
  private queryPage(layer: BcgwLayer, offset: number): Promise<LayerRow[]> {
    return this.prisma.$queryRawUnsafe<LayerRow[]>(
      `SELECT page.*, COUNT(*) OVER ()::int AS total_count
       FROM (${layer.query}) AS page
       ORDER BY ${layer.orderBy} ASC
       LIMIT $1 OFFSET $2`,
      layer.pageSize,
      offset,
    );
  }

  /**
   * Geometry arrives as GeoJSON text and has to be parsed so it nests as an object
   * in the response. That parse is what made the full inline responses so
   * expensive, but at one page it is cheap - which is the whole point of the page
   * sizes in the layer definitions.
   */
  private toFeature<TProperties>(
    row: LayerRow,
  ): BcgwPaginatedResult<TProperties>['features'][number] {
    const { geometry, total_count: _total, ...properties } = row;

    return {
      type: 'Feature',
      geometry:
        typeof geometry === 'string' && geometry.length > 0
          ? JSON.parse(geometry)
          : null,
      // The query is untyped at the driver boundary, so the column list in the
      // layer definition is what guarantees this matches the layer's DTO.
      properties: properties as TProperties,
    };
  }
}
