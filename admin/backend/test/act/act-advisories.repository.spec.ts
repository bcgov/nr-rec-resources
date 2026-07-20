import { PrismaService } from '@/prisma.service';
import { ActAdvisoriesRepository } from '@/act/act-advisories.repository';
import { ActAdvisoryUpdateDto } from '@/act/dtos/act-advisory-update.dto';
import { ActAdvisoryUpsertDto } from '@/act/dtos/act-advisory-upsert.dto';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ActAdvisoriesRepository', () => {
  let repository: ActAdvisoriesRepository;

  const mockPrismaService = {
    act_advisories_flat: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const basePayload: ActAdvisoryUpsertDto = {
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

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ActAdvisoriesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = moduleRef.get(ActAdvisoriesRepository);
  });

  it('returns true when advisory already exists', async () => {
    mockPrismaService.act_advisories_flat.findUnique.mockResolvedValue({
      rec_resource_id: 'REC0002',
    });

    await expect(
      repository.exists({ rec_resource_id: 'REC0002', advisory_number: 3791 }),
    ).resolves.toBe(true);
  });

  it('returns false when advisory does not exist', async () => {
    mockPrismaService.act_advisories_flat.findUnique.mockResolvedValue(null);

    await expect(
      repository.exists({ rec_resource_id: 'REC0002', advisory_number: 3791 }),
    ).resolves.toBe(false);
  });

  it('upserts and marks action as created with normalized defaults', async () => {
    mockPrismaService.act_advisories_flat.findUnique.mockResolvedValue(null);
    mockPrismaService.act_advisories_flat.upsert.mockResolvedValue({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });

    const result = await repository.upsert(basePayload);

    expect(result.created).toBe(true);
    expect(mockPrismaService.act_advisories_flat.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          description: null,
          access_status_description: null,
          end_date: null,
          expiry_date: null,
          published_at: null,
          listing_rank: 0,
          urgency_sequence: 0,
          access_status_precedence: 0,
          event_type_precedence: 0,
        }),
        update: expect.objectContaining({
          description: null,
          access_status_description: null,
          end_date: null,
          expiry_date: null,
          published_at: null,
          listing_rank: 0,
          urgency_sequence: 0,
          access_status_precedence: 0,
          event_type_precedence: 0,
        }),
      }),
    );
  });

  it('upserts and marks action as updated when advisory exists', async () => {
    mockPrismaService.act_advisories_flat.findUnique.mockResolvedValue({
      rec_resource_id: 'REC0002',
    });
    mockPrismaService.act_advisories_flat.upsert.mockResolvedValue({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });

    await repository.upsert({
      ...basePayload,
      description: 'Updated description',
      access_status_description: 'Some restrictions apply',
      end_date: new Date('2026-09-30T23:59:59.000Z'),
      expiry_date: new Date('2026-10-31T23:59:59.000Z'),
      published_at: new Date('2026-06-03T00:00:00.000Z'),
      listing_rank: 3,
      urgency_sequence: 4,
      access_status_precedence: 5,
      event_type_precedence: 6,
    });

    expect(mockPrismaService.act_advisories_flat.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          description: 'Updated description',
          access_status_description: 'Some restrictions apply',
          listing_rank: 3,
          urgency_sequence: 4,
          access_status_precedence: 5,
          event_type_precedence: 6,
        }),
        update: expect.objectContaining({
          description: 'Updated description',
          access_status_description: 'Some restrictions apply',
          listing_rank: 3,
          urgency_sequence: 4,
          access_status_precedence: 5,
          event_type_precedence: 6,
        }),
      }),
    );
  });

  it('maps published_date to published_at for create/update writes', async () => {
    const publishedDate = new Date('2026-06-03T00:00:00.000Z');

    mockPrismaService.act_advisories_flat.findUnique.mockResolvedValue(null);
    mockPrismaService.act_advisories_flat.upsert.mockResolvedValue({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });

    await repository.upsert({
      ...basePayload,
      published_date: publishedDate,
      published_at: new Date('2026-06-01T00:00:00.000Z'),
    } as ActAdvisoryUpsertDto);

    expect(mockPrismaService.act_advisories_flat.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          published_at: publishedDate,
        }),
        update: expect.objectContaining({
          published_at: publishedDate,
        }),
      }),
    );
  });

  it('updates using only fields present in partial payload', async () => {
    const payload: ActAdvisoryUpdateDto = {
      title: 'Updated title',
      description: null,
    };

    await repository.update(
      { rec_resource_id: 'REC0002', advisory_number: 3791 },
      payload,
    );

    expect(mockPrismaService.act_advisories_flat.update).toHaveBeenCalledWith({
      where: {
        rec_resource_id_advisory_number: {
          rec_resource_id: 'REC0002',
          advisory_number: 3791,
        },
      },
      data: {
        title: 'Updated title',
        description: null,
      },
    });
  });

  it('includes explicitly provided undefined values in partial updates', async () => {
    await repository.update(
      { rec_resource_id: 'REC0002', advisory_number: 3791 },
      { title: undefined },
    );

    expect(mockPrismaService.act_advisories_flat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: undefined },
      }),
    );
  });

  it('maps published_date to published_at in partial updates', async () => {
    const publishedDate = new Date('2026-06-03T00:00:00.000Z');

    await repository.update(
      { rec_resource_id: 'REC0002', advisory_number: 3791 },
      {
        published_date: publishedDate,
        published_at: new Date('2026-06-01T00:00:00.000Z'),
      },
    );

    expect(mockPrismaService.act_advisories_flat.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          published_at: publishedDate,
        },
      }),
    );
  });

  it('deletes by composite key', async () => {
    await repository.delete({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });

    expect(mockPrismaService.act_advisories_flat.delete).toHaveBeenCalledWith({
      where: {
        rec_resource_id_advisory_number: {
          rec_resource_id: 'REC0002',
          advisory_number: 3791,
        },
      },
    });
  });
});
