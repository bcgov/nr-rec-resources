import { PrismaService } from '@/prisma.service';
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
        select: { application_guid: true },
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
        : payload.status === 'REJ'
          ? 'REJECT'
          : null;

    await this.prisma.recreation_spatial_submission.update({
      where: { application_guid: applicationGuid },
      data: {
        status: payload.status,
        decision,
        adjudication_ind: true,
        adjudicated_by: payload.userId,
        adjudication_date: statusDate,
        adjudication_comment:
          payload.status === 'CLR' ? null : normalizedComment,
        adjudication_report_document_uri:
          payload.status === 'CLR' ? null : normalizedReportUri,
        updated_by: payload.userId,
      },
    });
  }
}
