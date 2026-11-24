import { PrismaService } from '@/prisma.service';
import { Prisma } from '@generated/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateSpatialSubmissionStatusDto } from './dtos/update-spatial-submission-status.dto';

@Injectable()
export class SncscSpatialSubmissionStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(
    applicationGuid: string,
    payload: UpdateSpatialSubmissionStatusDto,
  ): Promise<void> {
    const existing = await this.prisma.recreation_spatial_submission.findUnique(
      {
        where: { application_guid: applicationGuid },
        select: { application_guid: true, tenure_id: true },
      },
    );

    if (!existing) {
      throw new NotFoundException(
        `Spatial submission not found for application_guid: ${applicationGuid}`,
      );
    }

    const normalizedComment = payload.comment?.trim() || null;
    const normalizedReportUri =
      payload.adjudicationReportDocumentUri?.trim() || null;

    if (payload.status === 'APP' && !normalizedReportUri) {
      throw new BadRequestException(
        'adjudicationReportDocumentUri is required when status is APP.',
      );
    }

    if (payload.status === 'REJ' && !normalizedComment) {
      throw new BadRequestException('comment is required when status is REJ.');
    }

    const statusDate = new Date(payload.statusDate);
    if (Number.isNaN(statusDate.getTime())) {
      throw new BadRequestException('statusDate must be a valid epoch value.');
    }

    const decision =
      payload.status === 'APP'
        ? 'APPROVE'
        : payload.status === 'REJ' || payload.status === 'FAI'
          ? 'REJECT'
          : null;

    const isAdjudicated =
      payload.status === 'APP' ||
      payload.status === 'REJ' ||
      payload.status === 'FAI';

    await this.prisma.$transaction(async (tx) => {
      await tx.recreation_spatial_submission.update({
        where: { application_guid: applicationGuid },
        data: {
          status: payload.status,
          decision,
          adjudication_ind: isAdjudicated,
          adjudicated_by: isAdjudicated ? payload.userId : null,
          adjudication_date: isAdjudicated ? statusDate : null,
          adjudication_comment:
            payload.status === 'CLR' ? null : normalizedComment,
          adjudication_report_document_uri:
            payload.status === 'CLR' ? null : normalizedReportUri,
          updated_by: payload.userId,
        },
      });

      if (payload.status === 'APP' && existing.tenure_id?.trim()) {
        await tx.recreation_resource.update({
          where: { rec_resource_id: existing.tenure_id.trim() },
          data: { rec_status_code: 'HI' },
        });

        const submissionRows = tx.$queryRaw
          ? await tx.$queryRaw<
              {
                rssmf_skey: bigint;
                rec_resource_id: string;
                section_id: string | null;
                rmf_skey: number | null;
                rssmf_amend_status_code: string | null;
                rmf_current_ind: string | null;
                rmf_amend_status_code: string | null;
              }[]
            >(Prisma.sql`
          SELECT
            rssmf.rssmf_skey,
            rssmf.rec_resource_id,
            rssmf.section_id,
            rssmf.rmf_skey,
            rssmf.amend_status_code AS rssmf_amend_status_code,
            rmf.current_ind AS rmf_current_ind,
            rmf.amend_status_code AS rmf_amend_status_code
          FROM rst.recreation_spatial_submission_map_feature rssmf
          LEFT JOIN rst.recreation_map_feature rmf
            ON rmf.rmf_skey = rssmf.rmf_skey
          WHERE rssmf.application_guid = ${applicationGuid}::uuid
            AND rssmf.rmf_skey IS NOT NULL
        `)
          : [];

        for (const row of submissionRows) {
          if (!row.rmf_skey) {
            continue;
          }

          const alreadyApproved =
            row.rssmf_amend_status_code === 'APP' &&
            row.rmf_current_ind === 'Y' &&
            row.rmf_amend_status_code === 'APP';
          if (alreadyApproved) {
            continue;
          }

          if (row.section_id === null) {
            await tx.$executeRaw(Prisma.sql`
              UPDATE rst.recreation_map_feature
              SET
                current_ind = 'N',
                revision_count = COALESCE(revision_count, 0) + 1,
                updated_by = ${payload.userId},
                updated_at = now()
              WHERE rec_resource_id = ${row.rec_resource_id}
                AND current_ind = 'Y'
                AND section_id IS NULL
                AND rmf_skey <> ${row.rmf_skey}
            `);
          } else {
            await tx.$executeRaw(Prisma.sql`
              UPDATE rst.recreation_map_feature
              SET
                current_ind = 'N',
                revision_count = COALESCE(revision_count, 0) + 1,
                updated_by = ${payload.userId},
                updated_at = now()
              WHERE rec_resource_id = ${row.rec_resource_id}
                AND section_id = ${row.section_id}
                AND current_ind = 'Y'
                AND rmf_skey <> ${row.rmf_skey}
            `);
          }

          await tx.$executeRaw(Prisma.sql`
            UPDATE rst.recreation_map_feature
            SET
              current_ind = 'Y',
              amend_status_code = 'APP',
              amend_status_date = now(),
              updated_by = ${payload.userId},
              updated_at = now()
            WHERE rmf_skey = ${row.rmf_skey}
              AND amend_status_code IS DISTINCT FROM 'APP'
          `);

          await tx.$executeRaw(Prisma.sql`
            UPDATE rst.recreation_spatial_submission_map_feature
            SET
              amend_status_code = 'APP',
              updated_by = ${payload.userId},
              updated_at = now()
            WHERE rssmf_skey = ${row.rssmf_skey}
              AND amend_status_code IS DISTINCT FROM 'APP'
          `);
        }
      }

      if (payload.status === 'REJ' || payload.status === 'FAI') {
        await tx.$executeRaw(Prisma.sql`
          WITH pending AS (
            SELECT rmf_skey
            FROM rst.recreation_spatial_submission_map_feature
            WHERE application_guid = ${applicationGuid}::uuid
              AND rmf_skey IS NOT NULL
              AND amend_status_code = 'PND'
          ), deleted_geom AS (
            DELETE FROM rst.recreation_map_feature_geom
            WHERE rmf_skey IN (SELECT rmf_skey FROM pending)
          )
          DELETE FROM rst.recreation_map_feature
          WHERE rmf_skey IN (SELECT rmf_skey FROM pending)
        `);

        await tx.$executeRaw(Prisma.sql`
          UPDATE rst.recreation_spatial_submission_map_feature
          SET
            amend_status_code = 'REJ',
            updated_by = ${payload.userId},
            updated_at = now()
          WHERE application_guid = ${applicationGuid}::uuid
            AND amend_status_code IS DISTINCT FROM 'APP'
        `);
      }
    });
  }
}
