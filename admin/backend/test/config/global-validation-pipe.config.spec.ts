import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { globalValidationPipe } from '@/config/global-validation-pipe.config';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TestDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;
}

describe('globalValidationPipe', () => {
  it('should pass validation with correct input', async () => {
    const input = { name: 'John', age: 30 };

    const result = await globalValidationPipe.transform(input, {
      type: 'body',
      metatype: TestDto,
    });

    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should strip unknown properties and throw error (forbidNonWhitelisted)', async () => {
    const input = { name: 'John', age: 30, extra: 'not allowed' };

    await expect(
      globalValidationPipe.transform(input, {
        type: 'body',
        metatype: TestDto,
      }),
    ).rejects.toThrowError(BadRequestException);

    await expect(
      globalValidationPipe.transform(input, {
        type: 'body',
        metatype: TestDto,
      }),
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: [
          {
            field: 'extra',
            messages: ['property extra should not exist'],
          },
        ],
      },
    });
  });

  it('should handle validation errors without constraints (from nested DTO)', async () => {
    class InnerDto {
      @IsInt()
      age: number;
    }

    class OuterDto {
      @IsString()
      name: string;

      @ValidateNested()
      @Type(() => InnerDto)
      inner: InnerDto;
    }

    const input = {
      name: 'John',
      inner: { age: 'not-a-number' }, // triggers nested validation
    };

    await expect(
      globalValidationPipe.transform(input, {
        type: 'body',
        metatype: OuterDto,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      globalValidationPipe.transform(input, {
        type: 'body',
        metatype: OuterDto,
      }),
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'inner',
            messages: [], // 🔥 Covers the `constraints === undefined` path
          }),
        ]),
      },
    });
  });

  it('should throw error if required field is missing', async () => {
    const input = { age: 30 };

    await expect(
      globalValidationPipe.transform(input, {
        type: 'body',
        metatype: TestDto,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      globalValidationPipe.transform(input, {
        type: 'body',
        metatype: TestDto,
      }),
    ).rejects.toMatchObject({
      response: {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
          }),
        ]),
      },
    });
  });

  it('should transform types correctly', async () => {
    class NumberDto {
      @Type(() => Number)
      @IsInt()
      age: number;
    }

    const input = { age: '42' };

    const result = await globalValidationPipe.transform(input, {
      type: 'body',
      metatype: NumberDto,
    });

    expect(result).toEqual({ age: 42 });
    expect(typeof result.age).toBe('number');
  });
});
