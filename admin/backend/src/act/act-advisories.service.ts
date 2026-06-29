import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
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
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: { rec_resource_id: true },
    });
    if (!resource) {
      throw new NotFoundException(
        `${ACT_ERROR_MESSAGES.REC_RESOURCE_NOT_FOUND}: ${rec_resource_id}`,
      );
    }
  }
}
