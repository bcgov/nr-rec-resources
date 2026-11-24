import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import { PrismaService } from '@/prisma.service';
import { SNCSC_STATUS_RESOURCE_TYPE } from '@/sncsc/sncsc.constants';
import { SncscSpatialSubmissionStatusService } from '@/sncsc/sncsc-spatial-submission-status.service';

describe('SncscSpatialSubmissionStatusService', () => {
  let service: SncscSpatialSubmissionStatusService;
  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
    $executeRaw: ReturnType<typeof vi.fn>;
    recreation_spatial_submission: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    recreation_resource: {
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      $transaction: vi.fn(async (callback: any) => callback(prisma as any)),
      $executeRaw: vi.fn(),
      recreation_spatial_submission: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      recreation_resource: {
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
      tenure_id: 'REC0001',
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
    expect(prisma.recreation_resource.update).toHaveBeenCalledWith({
      where: { rec_resource_id: 'REC0001' },
      data: { rec_status_code: 'HI' },
    });
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
      tenure_id: 'REC0002',
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
      tenure_id: 'REC0003',
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

  it('throws BadRequestException when statusDate is not a valid epoch value', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'date-guid',
      tenure_id: 'REC0004',
    });

    await expect(
      service.updateStatus('date-guid', {
        '@type': SNCSC_STATUS_RESOURCE_TYPE,
        status: 'APP',
        statusDate: Number.NaN,
        comment: 'ok',
        adjudicationReportDocumentUri: 'dms://sncsc/reports/789',
        userId: 'SNCSC_USER_01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates REJ status with REJECT decision mapping', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'rej-ok-guid',
      tenure_id: 'REC0005',
    });

    await service.updateStatus('rej-ok-guid', {
      '@type': SNCSC_STATUS_RESOURCE_TYPE,
      status: 'REJ',
      statusDate: 1791436445000,
      comment: '  Rejected: insufficient detail  ',
      adjudicationReportDocumentUri: '  dms://sncsc/reports/999  ',
      userId: 'SNCSC_USER_01',
    });

    const [{ data }] =
      prisma.recreation_spatial_submission.update.mock.calls.at(-1)!;
    expect(data.decision).toBe('REJECT');
    expect(data.adjudication_ind).toBe(true);
    expect(data.adjudicated_by).toBe('SNCSC_USER_01');
    expect(data.adjudication_comment).toBe('Rejected: insufficient detail');
    expect(data.adjudication_report_document_uri).toBe(
      'dms://sncsc/reports/999',
    );
    expect(prisma.recreation_resource.update).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
  });

  it('normalizes CLR payload to null decision/comment/report', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'clr-guid',
      tenure_id: 'REC0006',
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
    expect(prisma.recreation_resource.update).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('does not attempt resource status update when APP payload has no tenure id', async () => {
    prisma.recreation_spatial_submission.findUnique.mockResolvedValue({
      application_guid: 'app-no-tenure',
      tenure_id: '   ',
    });

    await service.updateStatus('app-no-tenure', {
      '@type': SNCSC_STATUS_RESOURCE_TYPE,
      status: 'APP',
      statusDate: 1791436445000,
      comment: 'Approved with no tenure id linkage',
      adjudicationReportDocumentUri: 'dms://sncsc/reports/555',
      userId: 'SNCSC_USER_01',
    });

    expect(prisma.recreation_resource.update).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});
