import { SNCSC_STATUS_RESOURCE_TYPE } from '@/sncsc/sncsc.constants';
import { SncscSpatialSubmissionStatusController } from '@/sncsc/sncsc-spatial-submission-status.controller';
import { describe, expect, it, vi } from 'vitest';

describe('SncscSpatialSubmissionStatusController', () => {
  it('delegates update requests to the service with route param and payload', async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    const controller = new SncscSpatialSubmissionStatusController({
      updateStatus,
    } as any);

    const payload = {
      '@type': SNCSC_STATUS_RESOURCE_TYPE,
      status: 'APP' as const,
      statusDate: 1791436445000,
      comment: 'Approved with conditions',
      adjudicationReportDocumentUri: 'dms://sncsc/reports/123',
      userId: 'SNCSC_USER_01',
    };

    await expect(
      controller.updateSpatialSubmissionStatus(
        '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
        payload,
      ),
    ).resolves.toBeUndefined();

    expect(updateStatus).toHaveBeenCalledOnce();
    expect(updateStatus).toHaveBeenCalledWith(
      '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
      payload,
    );
  });
});
