import { describe, expect, it } from 'vitest';
import { GenericErrorResponseDto } from '@/common/dtos/generic-error-response.dto';

describe('GenericErrorResponseDto', () => {
  it('should create an instance of GenericErrorResponseDto', () => {
    const genericErrorResponseDto = new GenericErrorResponseDto();
    expect(genericErrorResponseDto).toBeInstanceOf(GenericErrorResponseDto);
  });

  it('should have the correct properties and types', () => {
    const genericErrorResponseDto = new GenericErrorResponseDto();
    genericErrorResponseDto.statusCode = 404;
    genericErrorResponseDto.message = 'Not Found';
    genericErrorResponseDto.error = 'Not Found Error';
    genericErrorResponseDto.timestamp = new Date().toISOString();
    genericErrorResponseDto.path = '/api/v1/resource';

    expect(typeof genericErrorResponseDto.statusCode).toBe('number');
    expect(typeof genericErrorResponseDto.message).toBe('string');
    expect(typeof genericErrorResponseDto.error).toBe('string');
    expect(typeof genericErrorResponseDto.timestamp).toBe('string');
    expect(typeof genericErrorResponseDto.path).toBe('string');
  });

  it('should match the example values', () => {
    const genericErrorResponseDto = new GenericErrorResponseDto();
    genericErrorResponseDto.statusCode = 404;
    genericErrorResponseDto.message = 'Resource Not Found';
    genericErrorResponseDto.error = 'Not Found';
    genericErrorResponseDto.timestamp = '2025-06-13T21:13:23.000Z';
    genericErrorResponseDto.path = '/api/v1/users/invalid-input';

    expect(genericErrorResponseDto.statusCode).toBe(404);
    expect(genericErrorResponseDto.message).toBe('Resource Not Found');
    expect(genericErrorResponseDto.error).toBe('Not Found');
    expect(genericErrorResponseDto.timestamp).toBe('2025-06-13T21:13:23.000Z');
    expect(genericErrorResponseDto.path).toBe('/api/v1/users/invalid-input');
  });
});
