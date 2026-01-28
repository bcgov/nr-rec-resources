import {
  CreateEstablishmentOrderDocBodyDto,
  CreateEstablishmentOrderDocFormDto,
} from '@/establishment-order-docs/dto/create-establishment-order-doc.dto';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('CreateEstablishmentOrderDocBodyDto', () => {
  it('should pass validation with valid title', async () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 'Establishment Order 2024';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with empty title', async () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with null title', async () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = null as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with undefined title', async () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = undefined as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with non-string title', async () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 123 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.constraints).toHaveProperty('isString');
  });

  it('should pass validation with long valid title', async () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 'A'.repeat(255); // Max reasonable length

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

describe('CreateEstablishmentOrderDocFormDto', () => {
  it('should have file property', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    expect(dto).toHaveProperty('file');
  });

  it('should have title property', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    expect(dto).toHaveProperty('title');
  });

  it('should accept file and title values', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.file = {} as any;
    dto.title = 'Test Order';

    expect(dto.file).toBeDefined();
    expect(dto.title).toBe('Test Order');
  });
});
