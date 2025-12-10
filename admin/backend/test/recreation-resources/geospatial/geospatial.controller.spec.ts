import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpException } from '@nestjs/common';
import { GeospatialController } from '@/recreation-resources/geospatial/geospatial.controller';
import { GeospatialService } from '@/recreation-resources/geospatial/geospatial.service';
import { RecreationResourceGeospatialDto } from '@/recreation-resources/geospatial/dto/recreation-resource-geospatial.dto';
import { UpdateRecreationResourceGeospatialDto } from '@/recreation-resources/geospatial/dto/update-recreation-resource-geospatial.dto';

describe('GeospatialController', () => {
  let controller: GeospatialController;
  let geospatialServiceMock: Partial<GeospatialService>;

  beforeEach(() => {
    geospatialServiceMock = {
      findGeospatialDataById: vi.fn(),
      updateGeospatialData: vi.fn(),
    };

    controller = new GeospatialController(
      geospatialServiceMock as GeospatialService,
    );
  });

  it('getGeospatialData returns geospatial data when found', async () => {
    const sample: RecreationResourceGeospatialDto = {
      rec_resource_id: 'REC100',
      spatial_feature_geometry: ['{"type":"Polygon","coordinates":[]}'],
      site_point_geometry: '{"type":"Point","coordinates":[1,2]}',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
      latitude: 53.1,
      longitude: -127.1,
    };

    (geospatialServiceMock.findGeospatialDataById as any).mockResolvedValue(
      sample,
    );

    const res = await controller.getGeospatialData('REC100');
    expect(geospatialServiceMock.findGeospatialDataById).toHaveBeenCalledWith(
      'REC100',
    );
    expect(res).toEqual(sample);
  });

  it('getGeospatialData throws 404 HttpException when not found', async () => {
    (geospatialServiceMock.findGeospatialDataById as any).mockResolvedValue(
      null,
    );

    await expect(controller.getGeospatialData('NOPE')).rejects.toBeInstanceOf(
      HttpException,
    );

    try {
      await controller.getGeospatialData('NOPE');
    } catch (err) {
      expect((err as HttpException).getStatus()).toBe(404);
      expect((err as HttpException).message).toMatch(
        /Geospatial data not found/i,
      );
    }
  });

  it('updateGeospatialData calls service.updateGeospatialData and returns updated payload', async () => {
    const updateDto: UpdateRecreationResourceGeospatialDto =
      new UpdateRecreationResourceGeospatialDto();
    updateDto.utm_zone = 10;
    updateDto.utm_easting = 500000;
    updateDto.utm_northing = 5450000;

    (geospatialServiceMock.updateGeospatialData as any).mockResolvedValue(
      undefined,
    );

    const returned: RecreationResourceGeospatialDto = {
      rec_resource_id: 'REC200',
      spatial_feature_geometry: undefined,
      site_point_geometry: '{"type":"Point","coordinates":[1,2]}',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5450000,
      latitude: 53.5,
      longitude: -127.5,
    };

    (geospatialServiceMock.findGeospatialDataById as any).mockResolvedValue(
      returned,
    );

    const res = await controller.updateGeospatialData('REC200', updateDto);

    expect(geospatialServiceMock.updateGeospatialData).toHaveBeenCalledWith(
      'REC200',
      updateDto,
    );
    expect(geospatialServiceMock.findGeospatialDataById).toHaveBeenCalledWith(
      'REC200',
    );
    expect(res).toEqual(returned);
  });

  it('updateGeospatialData throws 404 HttpException when not found after update', async () => {
    const updateDto: UpdateRecreationResourceGeospatialDto =
      new UpdateRecreationResourceGeospatialDto();
    updateDto.utm_zone = 11;
    updateDto.utm_easting = 123456;
    updateDto.utm_northing = 654321;

    (geospatialServiceMock.updateGeospatialData as any).mockResolvedValue(
      undefined,
    );

    (geospatialServiceMock.findGeospatialDataById as any).mockResolvedValue(
      null,
    );

    await expect(
      controller.updateGeospatialData('REC404', updateDto),
    ).rejects.toBeInstanceOf(HttpException);

    try {
      await controller.updateGeospatialData('REC404', updateDto);
    } catch (err) {
      expect((err as HttpException).getStatus()).toBe(404);
      expect((err as HttpException).message).toMatch(
        /Geospatial data not found for this recreation resource after update/i,
      );
    }
  });
});
