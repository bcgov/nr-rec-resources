import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '@/prisma.service';
import { ActAdvisoriesRepository } from '@/act/act-advisories.repository';
import { ActAdvisoriesService } from '@/act/act-advisories.service';
import { ACT_ERROR_MESSAGES } from '@/act/act.constants';
import { ActAdvisoryUpsertDto } from '@/act/dtos/act-advisory-upsert.dto';

describe('ActAdvisoriesService', () => {
  let service: ActAdvisoriesService;

  const mockRepository = {
    exists: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockPrisma = {
    recreation_resource: {
      findUnique: vi.fn(),
    },
  };

  const upsertPayload: ActAdvisoryUpsertDto = {
    rec_resource_id: 'REC0002',
    advisory_number: 3791,
    title: 'Bear in area',
    submitted_by: 'act-service-account',
    access_status_name: 'Open with restrictions',
    access_status_grouplabel: 'Open',
    event_type: 'Wildlife',
    urgency: 'High',
    advisory_status: 'Published',
    is_reservations_affected: false,
    is_advisory_date_displayed: true,
    is_effective_date_displayed: true,
    is_end_date_displayed: false,
    is_updated_date_displayed: true,
    advisory_date: new Date('2026-06-01T15:00:00.000Z'),
    effective_date: new Date('2026-06-02T00:00:00.000Z'),
    updated_date: new Date('2026-06-05T08:30:00.000Z'),
    modified_date: new Date('2026-06-05T08:30:00.000Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ActAdvisoriesService(
      mockRepository as unknown as ActAdvisoriesRepository,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('returns created response for successful upsert', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:00:00.000Z'));

    mockPrisma.recreation_resource.findUnique.mockResolvedValue({
      rec_resource_id: 'REC0002',
    });
    mockRepository.upsert.mockResolvedValue({
      created: true,
      advisory: {},
    });

    const result = await service.upsert(upsertPayload);

    expect(result).toEqual({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
      action: 'created',
      timestamp: '2026-06-29T12:00:00.000Z',
    });

    vi.useRealTimers();
  });

  it('returns updated response for successful upsert of existing advisory', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:01:00.000Z'));

    mockPrisma.recreation_resource.findUnique.mockResolvedValue({
      rec_resource_id: 'REC0002',
    });
    mockRepository.upsert.mockResolvedValue({
      created: false,
      advisory: {},
    });

    const result = await service.upsert(upsertPayload);

    expect(result.action).toBe('updated');
    expect(result.timestamp).toBe('2026-06-29T12:01:00.000Z');

    vi.useRealTimers();
  });

  it('throws NotFoundException when rec_resource_id does not exist for upsert', async () => {
    mockPrisma.recreation_resource.findUnique.mockResolvedValue(null);

    await expect(service.upsert(upsertPayload)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.upsert(upsertPayload)).rejects.toThrow(
      `${ACT_ERROR_MESSAGES.REC_RESOURCE_NOT_FOUND}: REC0002`,
    );
  });

  it('bulk upserts the same advisory across multiple resource IDs', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:04:00.000Z'));

    mockPrisma.recreation_resource.findUnique
      .mockResolvedValueOnce({ rec_resource_id: 'REC0002' })
      .mockResolvedValueOnce({ rec_resource_id: 'REC0042' });
    mockRepository.upsert
      .mockResolvedValueOnce({ created: true, advisory: {} })
      .mockResolvedValueOnce({ created: false, advisory: {} });

    const result = await service.bulkUpsert({
      ...upsertPayload,
      rec_resource_ids: ['REC0002', 'REC0042'],
      published_date: new Date('2026-06-02T00:00:00.000Z'),
    });

    expect(mockRepository.upsert).toHaveBeenNthCalledWith(1, {
      ...upsertPayload,
      rec_resource_id: 'REC0002',
      published_date: new Date('2026-06-02T00:00:00.000Z'),
    });
    expect(mockRepository.upsert).toHaveBeenNthCalledWith(2, {
      ...upsertPayload,
      rec_resource_id: 'REC0042',
      published_date: new Date('2026-06-02T00:00:00.000Z'),
    });
    expect(result).toEqual({
      count: 2,
      results: [
        {
          rec_resource_id: 'REC0002',
          advisory_number: 3791,
          action: 'created',
          timestamp: '2026-06-29T12:04:00.000Z',
        },
        {
          rec_resource_id: 'REC0042',
          advisory_number: 3791,
          action: 'updated',
          timestamp: '2026-06-29T12:04:00.000Z',
        },
      ],
    });

    vi.useRealTimers();
  });

  it('throws NotFoundException when any bulk rec_resource_ids are missing', async () => {
    mockPrisma.recreation_resource.findUnique
      .mockResolvedValueOnce({ rec_resource_id: 'REC0002' })
      .mockResolvedValueOnce(null);

    await expect(
      service.bulkUpsert({
        ...upsertPayload,
        rec_resource_ids: ['REC0002', 'REC0042'],
      }),
    ).rejects.toThrow(`${ACT_ERROR_MESSAGES.REC_RESOURCE_NOT_FOUND}: REC0042`);
  });

  it('throws NotFoundException when update target advisory does not exist', async () => {
    mockRepository.exists.mockResolvedValue(false);

    await expect(
      service.update(
        { rec_resource_id: 'REC0002', advisory_number: 3791 },
        { title: 'Updated title' },
      ),
    ).rejects.toThrow(ACT_ERROR_MESSAGES.ADVISORY_NOT_FOUND);
  });

  it('returns updated response when update succeeds', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:02:00.000Z'));

    mockRepository.exists.mockResolvedValue(true);
    mockRepository.update.mockResolvedValue({});

    const result = await service.update(
      { rec_resource_id: 'REC0002', advisory_number: 3791 },
      { title: 'Updated title' },
    );

    expect(mockRepository.update).toHaveBeenCalledWith(
      { rec_resource_id: 'REC0002', advisory_number: 3791 },
      { title: 'Updated title' },
    );
    expect(result).toEqual({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
      action: 'updated',
      timestamp: '2026-06-29T12:02:00.000Z',
    });

    vi.useRealTimers();
  });

  it('throws NotFoundException when delete target advisory does not exist', async () => {
    mockRepository.exists.mockResolvedValue(false);

    await expect(
      service.delete({ rec_resource_id: 'REC0002', advisory_number: 3791 }),
    ).rejects.toThrow(ACT_ERROR_MESSAGES.ADVISORY_NOT_FOUND);
  });

  it('returns deleted response when delete succeeds', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-29T12:03:00.000Z'));

    mockRepository.exists.mockResolvedValue(true);
    mockRepository.delete.mockResolvedValue(undefined);

    const result = await service.delete({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });

    expect(mockRepository.delete).toHaveBeenCalledWith({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });
    expect(result).toEqual({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
      action: 'deleted',
      timestamp: '2026-06-29T12:03:00.000Z',
    });

    vi.useRealTimers();
  });
});
