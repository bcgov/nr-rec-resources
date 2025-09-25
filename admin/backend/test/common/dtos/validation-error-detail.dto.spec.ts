import { describe, expect, it } from 'vitest';
import { ValidationErrorDetailDto } from '@/common/dtos/validation-error-detail.dto';

describe('ValidationErrorDetailDto', () => {
  it('should create an instance of ValidationErrorDetailDto', () => {
    const validationErrorDetailDto = new ValidationErrorDetailDto();
    expect(validationErrorDetailDto).toBeInstanceOf(ValidationErrorDetailDto);
  });

  it('should have the correct properties and types', () => {
    const validationErrorDetailDto = new ValidationErrorDetailDto();
    validationErrorDetailDto.field = 'name';
    validationErrorDetailDto.messages = ['name is required'];

    expect(typeof validationErrorDetailDto.field).toBe('string');
    expect(Array.isArray(validationErrorDetailDto.messages)).toBe(true);
    expect(typeof validationErrorDetailDto.messages[0]).toBe('string');
  });

  it('should match the example values', () => {
    const validationErrorDetailDto = new ValidationErrorDetailDto();
    validationErrorDetailDto.field = 'name';
    validationErrorDetailDto.messages = [
      'name must be longer than or equal to 3 characters',
      'name should not be empty',
    ];

    expect(validationErrorDetailDto.field).toBe('name');
    expect(validationErrorDetailDto.messages[0]).toBe(
      'name must be longer than or equal to 3 characters',
    );
    expect(validationErrorDetailDto.messages[1]).toBe(
      'name should not be empty',
    );
  });
});
