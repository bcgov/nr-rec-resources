import { describe, it, expect } from 'vitest';
import { EstablishmentOrderDocDto } from '@/establishment-order-docs/dto/establishment-order-doc.dto';
import {
  CreateEstablishmentOrderDocBodyDto,
  CreateEstablishmentOrderDocFormDto,
} from '@/establishment-order-docs/dto/create-establishment-order-doc.dto';

describe('EstablishmentOrderDocDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new EstablishmentOrderDocDto();
    dto.s3_key = 'REC0001/establishment-order-2024.pdf';
    dto.rec_resource_id = 'REC0001';
    dto.title = 'Establishment Order 2024';
    dto.file_size = 1024000;
    dto.extension = 'pdf';
    dto.url =
      'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2024.pdf?signature=abc123';
    dto.created_at = new Date('2024-01-01T00:00:00Z');

    expect(dto).toBeDefined();
    expect(dto.s3_key).toBe('REC0001/establishment-order-2024.pdf');
    expect(dto.rec_resource_id).toBe('REC0001');
    expect(dto.title).toBe('Establishment Order 2024');
    expect(dto.file_size).toBe(1024000);
    expect(dto.extension).toBe('pdf');
    expect(dto.url).toBe(
      'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2024.pdf?signature=abc123',
    );
    expect(dto.created_at).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('should handle empty values', () => {
    const dto = new EstablishmentOrderDocDto();
    expect(dto).toBeDefined();
    expect(dto.s3_key).toBeUndefined();
    expect(dto.rec_resource_id).toBeUndefined();
    expect(dto.title).toBeUndefined();
    expect(dto.file_size).toBeUndefined();
    expect(dto.extension).toBeUndefined();
    expect(dto.url).toBeUndefined();
    expect(dto.created_at).toBeUndefined();
  });

  it('should handle various file extensions', () => {
    const dto = new EstablishmentOrderDocDto();
    dto.extension = 'pdf';
    expect(dto.extension).toBe('pdf');

    dto.extension = 'PDF';
    expect(dto.extension).toBe('PDF');
  });

  it('should handle S3 keys with special characters', () => {
    const dto = new EstablishmentOrderDocDto();
    dto.s3_key = 'REC0001/test document #2024.pdf';
    expect(dto.s3_key).toBe('REC0001/test document #2024.pdf');
  });

  it('should handle timestamps correctly', () => {
    const dto = new EstablishmentOrderDocDto();
    const now = new Date();
    dto.created_at = now;
    expect(dto.created_at).toEqual(now);
    expect(dto.created_at?.getTime()).toBe(now.getTime());
  });
});

describe('CreateEstablishmentOrderDocBodyDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 'New Establishment Order';

    expect(dto).toBeDefined();
    expect(dto.title).toBe('New Establishment Order');
  });

  it('should handle empty title', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    expect(dto.title).toBeUndefined();
  });

  it('should accept valid title with numbers', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 'Establishment Order 2024';
    expect(dto.title).toBe('Establishment Order 2024');
  });

  it('should accept title with special characters', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = "Order (2024) - Winter's Update";
    expect(dto.title).toBe("Order (2024) - Winter's Update");
  });
});

describe('CreateEstablishmentOrderDocFormDto', () => {
  it('should create a valid DTO instance', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Establishment Order 2024';
    dto.file = 'file-content';

    expect(dto).toBeDefined();
    expect(dto.title).toBe('Establishment Order 2024');
    expect(dto.file).toBe('file-content');
  });

  it('should allow missing file property', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Test Order';

    expect(dto.title).toBe('Test Order');
    expect(dto.file).toBeUndefined();
  });

  it('should handle empty title', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.file = Buffer.from('content');

    expect(dto.title).toBeUndefined();
    expect(dto.file).toBeInstanceOf(Buffer);
  });
});
