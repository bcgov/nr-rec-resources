import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { GeospatialController } from './geospatial.controller';
import { GeospatialService } from './geospatial.service';

describe('GeospatialController', () => {
  let controller: GeospatialController;
  let getBcgwLayerMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getBcgwLayerMock = vi.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeospatialController],
      providers: [
        {
          provide: GeospatialService,
          useValue: {
            getBcgwLayer: getBcgwLayerMock,
          },
        },
      ],
    }).compile();

    controller = module.get<GeospatialController>(GeospatialController);
  });

  // ── Body validation ────────────────────────────────────────────────────────

  it('throws BadRequestException when body has no ids field', () => {
    expect(() => controller.getBcgwLayer('3', {})).toThrow(BadRequestException);
  });

  it('throws BadRequestException when ids is a string (not array)', () => {
    expect(() =>
      controller.getBcgwLayer('3', { ids: 'AB001' as unknown as string[] }),
    ).toThrow(BadRequestException);
  });

  it('throws BadRequestException when ids is an array of numbers', () => {
    expect(() =>
      controller.getBcgwLayer('3', { ids: [1, 2, 3] as unknown as string[] }),
    ).toThrow(BadRequestException);
  });

  // ── Delegation ─────────────────────────────────────────────────────────────

  it('delegates to service.getBcgwLayer with layer and ids', () => {
    const ids = ['AB001', 'AB002'];
    getBcgwLayerMock.mockResolvedValue({ features: [] });

    controller.getBcgwLayer('3', { ids });

    expect(getBcgwLayerMock).toHaveBeenCalledWith('3', ids);
  });

  it('returns the service result', async () => {
    const serviceResult = {
      objectIdFieldName: 'OBJECTID',
      features: [{ id: 1 }],
    };
    getBcgwLayerMock.mockResolvedValue(serviceResult);

    const result = await controller.getBcgwLayer('3', { ids: ['AB001'] });

    expect(result).toBe(serviceResult);
  });
});
