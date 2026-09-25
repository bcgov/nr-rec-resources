import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { S3Service } from '@/s3/s3.service';
import { BcgwExportService } from './export/bcgw-export.service';

/**
 * How long a redirect's presigned URL stays valid. Long enough for BCGW to
 * download a large layer over a slow link, short enough that a leaked URL
 * expires quickly.
 */
const DOWNLOAD_URL_EXPIRY_SECONDS = 3600;

/**
 * Resolves BCGW layer downloads.
 *
 * The layer files themselves are produced out of band by BcgwExportService and
 * stored in S3, so serving a layer is just a presigned URL for the endpoints to
 * redirect to.
 */
@Injectable()
export class BcgwService {
  private readonly logger = new Logger(BcgwService.name);

  constructor(
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
}
