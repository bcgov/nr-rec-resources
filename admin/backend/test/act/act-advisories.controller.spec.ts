import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ActAdvisoriesController } from '@/act/act-advisories.controller';
import { ActAdvisoriesService } from '@/act/act-advisories.service';

describe('ActAdvisoriesController', () => {
  let controller: ActAdvisoriesController;
  let app: INestApplication;

  const mockService = {
    upsert: vi.fn(),
    bulkUpsert: vi.fn(),
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
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
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

  it('delegates bulk upsert to service', async () => {
    const payload = {
      rec_resource_ids: ['REC0002', 'REC0042'],
      advisory_number: 3791,
    } as any;
    mockService.bulkUpsert.mockResolvedValue({ count: 2, results: [] });

    await controller.bulkUpsert(payload);

    expect(mockService.bulkUpsert).toHaveBeenCalledWith(payload);
  });

  it('delegates delete to service with composite key', async () => {
    mockService.delete.mockResolvedValue({ action: 'deleted' });

    await controller.delete('REC0002', 3791);

    expect(mockService.delete).toHaveBeenCalledWith({
      rec_resource_id: 'REC0002',
      advisory_number: 3791,
    });
  });

  it('generates Swagger schema with string nullable fields and published field alias metadata', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('test').build(),
    );

    const updateSchema = document.components?.schemas?.ActAdvisoryUpdateDto as {
      properties: Record<string, any>;
    };
    expect(updateSchema).toBeDefined();

    const { properties } = updateSchema;
    expect(properties.description).toMatchObject({
      type: 'string',
      nullable: true,
    });
    expect(properties.access_status_description).toMatchObject({
      type: 'string',
      nullable: true,
    });
    expect(properties.is_reservations_affected).toMatchObject({
      type: 'boolean',
      nullable: true,
    });
    expect(properties.is_updated_date_displayed).toMatchObject({
      type: 'boolean',
      nullable: true,
    });
    expect(properties.end_date).toMatchObject({
      type: 'string',
      nullable: true,
    });
    expect(properties.expiry_date).toMatchObject({
      type: 'string',
      nullable: true,
    });
    expect(properties.published_date).toMatchObject({
      type: 'string',
      nullable: true,
    });
    expect(properties.published_at).toMatchObject({
      type: 'string',
      nullable: true,
      deprecated: true,
    });
  });
});
