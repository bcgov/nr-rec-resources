import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { ActAdvisoryBulkResponseDto } from './dtos/act-advisory-bulk-response.dto';
import { ActAdvisoryBulkUpsertDto } from './dtos/act-advisory-bulk-upsert.dto';
import { ActAdvisoryResponseDto } from './dtos/act-advisory-response.dto';
import { ActAdvisoryUpdateDto } from './dtos/act-advisory-update.dto';
import { ActAdvisoryUpsertDto } from './dtos/act-advisory-upsert.dto';
import {
  ActAdvisoriesRepository,
  ActAdvisoryKey,
} from './act-advisories.repository';
import { ACT_ERROR_MESSAGES, ACT_LOG_MESSAGES } from './act.constants';

/**
 * Service that orchestrates Act-driven changes against the
 * `rst.act_advisories_flat` table.
 *
 * The service is responsible for:
 *  - Validating the referenced recreation resource exists before write
 *  - Delegating persistence to {@link ActAdvisoriesRepository}
 *  - Mapping persistence results into the API response shape
 */
@Injectable()
export class ActAdvisoriesService {
  private readonly logger = new Logger(ActAdvisoriesService.name);

  constructor(
    private readonly repository: ActAdvisoriesRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create-or-update an advisory record using the natural key.
   */
  async upsert(payload: ActAdvisoryUpsertDto): Promise<ActAdvisoryResponseDto> {
    this.logger.log(
      `${ACT_LOG_MESSAGES.UPSERT_RECEIVED} (rec_resource_id=${payload.rec_resource_id}, advisory_number=${payload.advisory_number})`,
    );

    await this.assertRecResourceExists(payload.rec_resource_id);

    const { created } = await this.repository.upsert(payload);

    this.logger.log(ACT_LOG_MESSAGES.UPSERT_SUCCESS);

    return {
      rec_resource_id: payload.rec_resource_id,
      advisory_number: payload.advisory_number,
      action: created ? 'created' : 'updated',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Bulk upsert an advisory across multiple recreation resources.
   *
   * This is the chosen fan-out approach for multi-resource advisory writes
   * while keeping the existing single-resource PUT / DELETE routes unchanged.
   */
  async bulkUpsert(
    payload: ActAdvisoryBulkUpsertDto,
  ): Promise<ActAdvisoryBulkResponseDto> {
    this.logger.log(
      `${ACT_LOG_MESSAGES.UPSERT_RECEIVED} (rec_resource_ids=${payload.rec_resource_ids.join(',')}, advisory_number=${payload.advisory_number}, bulk=true)`,
    );

    await this.assertRecResourcesExist(payload.rec_resource_ids);

    const { rec_resource_ids, ...sharedPayload } = payload;
    const timestamp = new Date().toISOString();

    const results = await Promise.all(
      rec_resource_ids.map(async (rec_resource_id) => {
        const { created } = await this.repository.upsert({
          ...sharedPayload,
          rec_resource_id,
        });

        return {
          rec_resource_id,
          advisory_number: payload.advisory_number,
          action: created ? 'created' : 'updated',
          timestamp,
        } as const;
      }),
    );

    this.logger.log(ACT_LOG_MESSAGES.UPSERT_SUCCESS);

    return {
      count: results.length,
      results,
    };
  }

  /**
   * Partially update an existing advisory addressed by its natural key.
   * Throws {@link NotFoundException} if no matching row exists.
   */
  async update(
    key: ActAdvisoryKey,
    payload: ActAdvisoryUpdateDto,
  ): Promise<ActAdvisoryResponseDto> {
    this.logger.log(
      `${ACT_LOG_MESSAGES.UPDATE_RECEIVED} (rec_resource_id=${key.rec_resource_id}, advisory_number=${key.advisory_number})`,
    );

    if (!(await this.repository.exists(key))) {
      throw new NotFoundException(ACT_ERROR_MESSAGES.ADVISORY_NOT_FOUND);
    }

    await this.repository.update(key, payload);

    this.logger.log(ACT_LOG_MESSAGES.UPDATE_SUCCESS);

    return {
      rec_resource_id: key.rec_resource_id,
      advisory_number: key.advisory_number,
      action: 'updated',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete an advisory addressed by its natural key.
   * Throws {@link NotFoundException} if no matching row exists.
   */
  async delete(key: ActAdvisoryKey): Promise<ActAdvisoryResponseDto> {
    this.logger.log(
      `${ACT_LOG_MESSAGES.DELETE_RECEIVED} (rec_resource_id=${key.rec_resource_id}, advisory_number=${key.advisory_number})`,
    );

    if (!(await this.repository.exists(key))) {
      throw new NotFoundException(ACT_ERROR_MESSAGES.ADVISORY_NOT_FOUND);
    }

    await this.repository.delete(key);

    this.logger.log(ACT_LOG_MESSAGES.DELETE_SUCCESS);

    return {
      rec_resource_id: key.rec_resource_id,
      advisory_number: key.advisory_number,
      action: 'deleted',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Ensures the referenced rec_resource exists; throws NotFoundException
   * otherwise. This protects against orphan advisories and produces a
   * cleaner 404 than letting the FK constraint fire.
   */
  private async assertRecResourceExists(
    rec_resource_id: string,
  ): Promise<void> {
    await this.assertRecResourcesExist([rec_resource_id]);
  }

  private async assertRecResourcesExist(
    rec_resource_ids: string[],
  ): Promise<void> {
    const existenceChecks = await Promise.all(
      rec_resource_ids.map(async (rec_resource_id) => ({
        rec_resource_id,
        resource: await this.prisma.recreation_resource.findUnique({
          where: { rec_resource_id },
          select: { rec_resource_id: true },
        }),
      })),
    );

    const missingIds = existenceChecks
      .filter(({ resource }) => !resource)
      .map(({ rec_resource_id }) => rec_resource_id);

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `${ACT_ERROR_MESSAGES.REC_RESOURCE_NOT_FOUND}: ${missingIds.join(', ')}`,
      );
    }
  }
}
