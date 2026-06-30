import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActAdvisoriesController } from '@/act/act-advisories.controller';
import { ActAdvisoriesService } from '@/act/act-advisories.service';

describe('ActAdvisoriesController', () => {
  let controller: ActAdvisoriesController;

  const mockService = {
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [ActAdvisoriesController],
      providers: [
        {
          provide: ActAdvisoriesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = moduleRef.get(ActAdvisoriesController);
  });

  it('delegates upsert to service', async () => {
    const payload = {
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    } as any;
    mockService.upsert.mockResolvedValue({ action: 'created' });

    await controller.upsert(payload);

    expect(mockService.upsert).toHaveBeenCalledWith(payload);
  });

  it('delegates update to service with composite key and payload', async () => {
    const payload = { title: 'Updated title' };
    mockService.update.mockResolvedValue({ action: 'updated' });

    await controller.update('REC0002', 3791, payload);

    expect(mockService.update).toHaveBeenCalledWith(
      { rec_resource_id: 'REC0002', advisory_number: 3791 },
      payload,
    );
  });

  it('delegates delete to service with composite key', async () => {
    mockService.delete.mockResolvedValue({ action: 'deleted' });

    await controller.delete('REC0002', 3791);

    expect(mockService.delete).toHaveBeenCalledWith({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });
  });
});
