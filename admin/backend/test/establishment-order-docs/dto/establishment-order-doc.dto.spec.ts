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

  it('should allow setting all optional fields', () => {
    const dto = new EstablishmentOrderDocDto();
    dto.s3_key = 'REC0002/document.pdf';
    dto.rec_resource_id = 'REC0002';
    dto.title = 'Test Document';
    dto.url = 'https://example.com/doc.pdf';
    dto.file_size = undefined;
    dto.extension = undefined;
    dto.created_at = undefined;

    expect(dto.s3_key).toBe('REC0002/document.pdf');
    expect(dto.rec_resource_id).toBe('REC0002');
    expect(dto.title).toBe('Test Document');
    expect(dto.url).toBe('https://example.com/doc.pdf');
    expect(dto.file_size).toBeUndefined();
    expect(dto.extension).toBeUndefined();
    expect(dto.created_at).toBeUndefined();
  });

  it('should handle large file sizes', () => {
    const dto = new EstablishmentOrderDocDto();
    dto.file_size = 10485760; // 10MB
    expect(dto.file_size).toBe(10485760);
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

  it('should handle presigned URLs with query parameters', () => {
    const dto = new EstablishmentOrderDocDto();
    dto.url =
      'https://s3.amazonaws.com/bucket/file.pdf?AWSAccessKeyId=XXX&Expires=1234567890&Signature=YYY';
    expect(dto.url).toContain('AWSAccessKeyId');
    expect(dto.url).toContain('Expires');
    expect(dto.url).toContain('Signature');
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

  it('should accept short titles', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 'AB';
    expect(dto.title).toBe('AB');
  });

  it('should accept long titles', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    const longTitle =
      'This is a very long establishment order title that contains many words and describes the order in great detail';
    dto.title = longTitle;
    expect(dto.title).toBe(longTitle);
  });

  it('should trim whitespace if title has leading/trailing spaces', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = '  Test Order  ';
    expect(dto.title.trim()).toBe('Test Order');
  });

  it('should handle Unicode characters in title', () => {
    const dto = new CreateEstablishmentOrderDocBodyDto();
    dto.title = 'Établissement Ordre 2024';
    expect(dto.title).toBe('Établissement Ordre 2024');
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

  it('should allow file to be a Buffer', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Test Order';
    dto.file = Buffer.from('test file content');

    expect(dto.title).toBe('Test Order');
    expect(dto.file).toBeInstanceOf(Buffer);
  });

  it('should allow missing file property', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Test Order';

    expect(dto.title).toBe('Test Order');
    expect(dto.file).toBeUndefined();
  });

  it('should handle file as binary string', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Binary Order';
    dto.file = 'binary-file-content';

    expect(dto.file).toBe('binary-file-content');
  });

  it('should handle empty title', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.file = Buffer.from('content');

    expect(dto.title).toBeUndefined();
    expect(dto.file).toBeInstanceOf(Buffer);
  });

  it('should handle large file buffers', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Large Document';
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
    dto.file = largeBuffer;

    expect(dto.file).toBeInstanceOf(Buffer);
    expect(dto.file.length).toBe(10 * 1024 * 1024);
  });

  it('should handle file as any type', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Test';
    dto.file = { name: 'test.pdf', content: 'data' };

    expect(dto.file).toEqual({ name: 'test.pdf', content: 'data' });
  });

  it('should allow both properties to be set simultaneously', () => {
    const dto = new CreateEstablishmentOrderDocFormDto();
    dto.title = 'Complete Order';
    dto.file = Buffer.from('complete content');

    expect(dto.title).toBe('Complete Order');
    expect(dto.file).toBeInstanceOf(Buffer);
    expect(dto.file.toString()).toBe('complete content');
  });
});
