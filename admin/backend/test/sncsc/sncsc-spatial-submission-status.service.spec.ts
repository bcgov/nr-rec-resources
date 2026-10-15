import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import { PrismaService } from '@/prisma.service';
import { SNCSC_STATUS_RESOURCE_TYPE } from '@/sncsc/sncsc.constants';
import { SncscSpatialSubmissionStatusService } from '@/sncsc/sncsc-spatial-submission-status.service';

describe('SncscSpatialSubmissionStatusService', () => {
  let service: SncscSpatialSubmissionStatusService;
  let prisma: {
    recreation_spatial_submission: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      recreation_spatial_submission: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new SncscSpatialSubmissionStatusService(
      prisma as unknown as PrismaService,
    );
  });

  it('updates APP status with APPROVE decision mapping', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: '9b8ab705-5325-4f7a-aadc-51ef2d3a6d53',
    });

    await service.updateStatus('9b8ab705-5325-4f7a-aadc-51ef2d3a6d53', {
      '@type': SNCSC_STATUS_RESOURCE_TYPE,
      status: 'APP',
      statusDate: 1791436445000,
      comment: 'Approved with conditions',
      adjudicationReportDocumentUri: 'dms://sncsc/reports/123',
      userId: 'SNCSC_USER_01',
    });

    expect(prisma.recreation_spatial_submission.update).toHaveBeenCalledOnce();
    const [{ data }] =
      prisma.recreation_spatial_submission.update.mock.calls[0]!;

    expect(data.status).toBe('APP');
    expect(data.decision).toBe('APPROVE');
    expect(data.adjudication_ind).toBe(true);
    expect(data.adjudicated_by).toBe('SNCSC_USER_01');
    expect(data.adjudication_comment).toBe('Approved with conditions');
    expect(data.adjudication_report_document_uri).toBe(
      'dms://sncsc/reports/123',
    );
  });

  it('throws NotFoundException when application_guid does not exist', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus('missing-guid', {
        '@type': SNCSC_STATUS_RESOURCE_TYPE,
        status: 'CLR',
        statusDate: 1791436445000,
        userId: 'SNCSC_USER_01',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when APP is missing report URI', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'app-guid',
    });

    await expect(
      service.updateStatus('app-guid', {
        '@type': SNCSC_STATUS_RESOURCE_TYPE,
        status: 'APP',
        statusDate: 1791436445000,
        comment: 'ok',
        adjudicationReportDocumentUri: null,
        userId: 'SNCSC_USER_01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when REJ is missing comment', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'rej-guid',
    });

    await expect(
      service.updateStatus('rej-guid', {
        '@type': SNCSC_STATUS_RESOURCE_TYPE,
        status: 'REJ',
        statusDate: 1791436445000,
        comment: '   ',
        adjudicationReportDocumentUri: null,
        userId: 'SNCSC_USER_01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('normalizes CLR payload to null decision/comment/report', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'clr-guid',
    });

    await service.updateStatus('clr-guid', {
      '@type': SNCSC_STATUS_RESOURCE_TYPE,
      status: 'CLR',
      statusDate: 1791436445000,
      comment: 'ignored',
      adjudicationReportDocumentUri: 'ignored',
      userId: 'SNCSC_USER_01',
    });

    const [{ data }] =
      prisma.recreation_spatial_submission.update.mock.calls[0]!;
    expect(data.decision).toBeNull();
    expect(data.adjudication_ind).toBe(false);
    expect(data.adjudicated_by).toBeNull();
    expect(data.adjudication_date).toBeNull();
    expect(data.adjudication_comment).toBeNull();
    expect(data.adjudication_report_document_uri).toBeNull();
  });
});
