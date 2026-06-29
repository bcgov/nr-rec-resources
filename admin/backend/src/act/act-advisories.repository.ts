import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '@/prisma.service';
import { ActAdvisoryUpdateDto } from './dtos/act-advisory-update.dto';
import { ActAdvisoryUpsertDto } from './dtos/act-advisory-upsert.dto';

/**
 * Composite natural key used to address a row in `act_advisories_flat`.
 */
export interface ActAdvisoryKey {
  rec_resource_id: string;
  advisory_number: number;
}

/**
 * Result of the {@link ActAdvisoriesRepository.upsert} operation.
 */
export interface ActAdvisoryUpsertResult {
  /** Whether the row already existed (and was therefore updated). */
  created: boolean;
  /** The persisted row after the upsert. */
  advisory: Prisma.act_advisories_flatGetPayload<true>;
}

/**
 * Repository for managing rows in the `rst.act_advisories_flat` table
 * that originate from the Act integration.
 */
@Injectable()
export class ActAdvisoriesRepository {
  private readonly logger = new Logger(ActAdvisoriesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns true if a row already exists for the given natural key.
   */
  async exists(key: ActAdvisoryKey): Promise<boolean> {
    const existing = await this.prisma.act_advisories_flat.findUnique({
      where: this.toCompositeWhereInput(key),
      select: { rec_resource_id: true },
    });
    return existing !== null;
  }

  /**
   * Upserts an advisory record using the composite (rec_resource_id, advisory_number) key.
   * If the row exists it is updated, otherwise a new row is created.
   *
   * @returns the persisted row and whether it was newly created.
   */
  async upsert(
    payload: ActAdvisoryUpsertDto,
  ): Promise<ActAdvisoryUpsertResult> {
    const { rec_resource_id, advisory_number } = payload;

    const created = !(await this.exists({ rec_resource_id, advisory_number }));

    const advisory = await this.prisma.act_advisories_flat.upsert({
      where: this.toCompositeWhereInput({ rec_resource_id, advisory_number }),
      create: this.toCreateInput(payload),
      update: this.toUpdateInput(payload),
    });

    this.logger.log(
      `Act advisory ${created ? 'created' : 'updated'} (rec_resource_id=${rec_resource_id}, advisory_number=${advisory_number})`,
    );

    return { created, advisory };
  }

  /**
   * Updates an existing advisory row. Throws Prisma P2025 if not found.
   * Only fields present in the partial DTO are written.
   */
  async update(
    key: ActAdvisoryKey,
    payload: ActAdvisoryUpdateDto,
  ): Promise<Prisma.act_advisories_flatGetPayload<true>> {
    return this.prisma.act_advisories_flat.update({
      where: this.toCompositeWhereInput(key),
      data: this.toPartialUpdateInput(payload),
    });
  }

  /**
   * Deletes an advisory row. Throws Prisma P2025 if not found.
   */
  async delete(key: ActAdvisoryKey): Promise<void> {
    await this.prisma.act_advisories_flat.delete({
      where: this.toCompositeWhereInput(key),
    });
  }

  /**
   * Builds the Prisma `where` object for the advisory composite natural key.
   */
  private toCompositeWhereInput(
    key: ActAdvisoryKey,
  ): Prisma.act_advisories_flatWhereUniqueInput {
    return {
      rec_resource_id_advisory_number: {
        rec_resource_id: key.rec_resource_id,
        advisory_number: key.advisory_number,
      },
    };
  }

  /**
   * Shared normalized payload used by both create and full update operations.
   */
  private toWriteInput(
    payload: ActAdvisoryUpsertDto,
  ): Omit<
    Prisma.act_advisories_flatUncheckedCreateInput,
    'rec_resource_id' | 'advisory_number'
  > {
    return {
      title: payload.title,
      description: payload.description ?? null,
      submitted_by: payload.submitted_by,
      access_status_name: payload.access_status_name,
      access_status_grouplabel: payload.access_status_grouplabel,
      access_status_description: payload.access_status_description ?? null,
      event_type: payload.event_type,
      urgency: payload.urgency,
      advisory_status: payload.advisory_status,
      is_reservations_affected: payload.is_reservations_affected,
      is_advisory_date_displayed: payload.is_advisory_date_displayed,
      is_effective_date_displayed: payload.is_effective_date_displayed,
      is_end_date_displayed: payload.is_end_date_displayed,
      is_updated_date_displayed: payload.is_updated_date_displayed,
      advisory_date: payload.advisory_date,
      effective_date: payload.effective_date,
      end_date: payload.end_date ?? null,
      expiry_date: payload.expiry_date ?? null,
      updated_date: payload.updated_date,
      published_at: payload.published_at ?? null,
      listing_rank: payload.listing_rank ?? 0,
      urgency_sequence: payload.urgency_sequence ?? 0,
      access_status_precedence: payload.access_status_precedence ?? 0,
      event_type_precedence: payload.event_type_precedence ?? 0,
    };
  }

  /**
   * Builds a Prisma create input from a full upsert payload.
   */
  private toCreateInput(
    payload: ActAdvisoryUpsertDto,
  ): Prisma.act_advisories_flatUncheckedCreateInput {
    return {
      rec_resource_id: payload.rec_resource_id,
      advisory_number: payload.advisory_number,
      ...this.toWriteInput(payload),
    };
  }

  /**
   * Builds a Prisma update input from a full upsert payload.
   * The composite key columns are intentionally omitted because they
   * are matched in the `where` clause.
   */
  private toUpdateInput(
    payload: ActAdvisoryUpsertDto,
  ): Prisma.act_advisories_flatUncheckedUpdateInput {
    return this.toWriteInput(payload);
  }

  /**
   * Builds a Prisma partial update input - only fields explicitly present
   * in the partial DTO are written. Fields explicitly set to `null` are
   * forwarded so Act can clear nullable columns.
   */
  private toPartialUpdateInput(
    payload: ActAdvisoryUpdateDto,
  ): Prisma.act_advisories_flatUncheckedUpdateInput {
    const data: Prisma.act_advisories_flatUncheckedUpdateInput = {};
    const source = payload as Record<string, unknown>;

    const setIfPresent = <K extends keyof ActAdvisoryUpdateDto>(
      key: K,
    ): void => {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        (data as Record<string, unknown>)[key as string] =
          source[key as string];
      }
    };

    const updatableFields: Array<keyof ActAdvisoryUpdateDto> = [
      'title',
      'description',
      'submitted_by',
      'access_status_name',
      'access_status_grouplabel',
      'access_status_description',
      'event_type',
      'urgency',
      'advisory_status',
      'is_reservations_affected',
      'is_advisory_date_displayed',
      'is_effective_date_displayed',
      'is_end_date_displayed',
      'is_updated_date_displayed',
      'advisory_date',
      'effective_date',
      'end_date',
      'expiry_date',
      'removal_date',
      'updated_date',
      'modified_date',
      'published_at',
      'listing_rank',
      'urgency_sequence',
      'access_status_precedence',
      'event_type_precedence',
    ];

    updatableFields.forEach(setIfPresent);

    return data;
  }
}
