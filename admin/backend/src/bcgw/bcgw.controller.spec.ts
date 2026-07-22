import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BcgwController } from './bcgw.controller';
import { BcgwService } from './bcgw.service';
import { BcgwFeatureCollectionDto } from './dto/bcgw-recreation-resource.dto';
import { BcgwClosuresShortFeatureCollectionDto } from './dto/bcgw-closures-short.dto';
import { BcgwRecreationLinesFeatureCollectionDto } from './dto/bcgw-recreation-lines.dto';
import { BcgwRecreationPolygonsFeatureCollectionDto } from './dto/bcgw-recreation-polygons.dto';

const emptyMeta = { total: 0, page: 1, totalPages: 0, pageSize: 1000 };

const emptyFullCollection = (): BcgwFeatureCollectionDto => ({
  type: 'FeatureCollection',
  features: [],
  meta: emptyMeta,
});

const emptyShortCollection = (): BcgwClosuresShortFeatureCollectionDto => ({
  type: 'FeatureCollection',
  features: [],
  meta: emptyMeta,
});

const emptyLinesCollection = (): BcgwRecreationLinesFeatureCollectionDto => ({
  type: 'FeatureCollection',
  features: [],
  meta: emptyMeta,
});

const emptyPolygonsCollection =
  (): BcgwRecreationPolygonsFeatureCollectionDto => ({
    type: 'FeatureCollection',
    features: [],
    meta: emptyMeta,
  });

describe('BcgwController', () => {
  let controller: BcgwController;
  let service: BcgwService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BcgwController],
      providers: [
        {
          provide: BcgwService,
          useValue: {
            findAll: vi.fn(),
            findAllShort: vi.fn(),
            findAllLines: vi.fn(),
            findAllPolygons: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BcgwController>(BcgwController);
    service = module.get<BcgwService>(BcgwService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecreationResources', () => {
    it('calls service.findAll with the page param and returns the result', async () => {
      const expected = emptyFullCollection();
      vi.spyOn(service, 'findAll').mockResolvedValue(expected);

      const result = await controller.getRecreationResources(2);

      expect(service.findAll).toHaveBeenCalledWith(2);
      expect(result).toBe(expected);
    });

    it('defaults to page 1 when no param provided', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue(emptyFullCollection());

      await controller.getRecreationResources(1);

      expect(service.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('getClosuresShort', () => {
    it('calls service.findAllShort with the page param and returns the result', async () => {
      const expected = emptyShortCollection();
      vi.spyOn(service, 'findAllShort').mockResolvedValue(expected);

      const result = await controller.getClosuresShort(3);

      expect(service.findAllShort).toHaveBeenCalledWith(3);
      expect(result).toBe(expected);
    });

    it('defaults to page 1', async () => {
      vi.spyOn(service, 'findAllShort').mockResolvedValue(
        emptyShortCollection(),
      );

      await controller.getClosuresShort(1);

      expect(service.findAllShort).toHaveBeenCalledWith(1);
    });
  });

  describe('getRecreationLines', () => {
    it('calls service.findAllLines with the page param and returns the result', async () => {
      const expected = emptyLinesCollection();
      vi.spyOn(service, 'findAllLines').mockResolvedValue(expected);

      const result = await controller.getRecreationLines(4);

      expect(service.findAllLines).toHaveBeenCalledWith(4);
      expect(result).toBe(expected);
    });

    it('defaults to page 1', async () => {
      vi.spyOn(service, 'findAllLines').mockResolvedValue(
        emptyLinesCollection(),
      );

      await controller.getRecreationLines(1);

      expect(service.findAllLines).toHaveBeenCalledWith(1);
    });
  });

  describe('getRecreationPolygons', () => {
    it('calls service.findAllPolygons with the page param and returns the result', async () => {
      const expected = emptyPolygonsCollection();
      vi.spyOn(service, 'findAllPolygons').mockResolvedValue(expected);

      const result = await controller.getRecreationPolygons(5);

      expect(service.findAllPolygons).toHaveBeenCalledWith(5);
      expect(result).toBe(expected);
    });

    it('defaults to page 1', async () => {
      vi.spyOn(service, 'findAllPolygons').mockResolvedValue(
        emptyPolygonsCollection(),
      );

      await controller.getRecreationPolygons(1);

      expect(service.findAllPolygons).toHaveBeenCalledWith(1);
    });
  });
});
