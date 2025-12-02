import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { OptionDto } from './dtos/option.dto';
import { OPTION_TABLE_MAPPINGS, OPTION_TYPES } from './options.constants';
import {
  buildSelectFields,
  mapResultToOptionDto,
  transformResultsToOptionDtos,
} from './options.mapper';
import { TableMapping } from './options.types';

@Injectable()
export class OptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes a Prisma query and transforms the result to OptionDto.
   */
  private async executeAndTransform<T>(
    mapping: TableMapping,
    queryFn: (selectFields: Record<string, boolean>) => Promise<T>,
  ): Promise<OptionDto | null> {
    const selectFields = buildSelectFields(mapping);
    const result = await queryFn(selectFields);

    if (!result) {
      return null;
    }

    return mapResultToOptionDto(mapping, result);
  }

  /**
   * Find all options by type
   */
  async findAllByType(mapping: TableMapping): Promise<OptionDto[]> {
    const selectFields = buildSelectFields(mapping);

    const results = await (this.prisma as any)[mapping.prismaModel].findMany({
      select: selectFields,
      orderBy: {
        [mapping.labelField]: 'asc',
      },
    });

    return await transformResultsToOptionDtos(mapping, results);
  }

  /**
   * Find options for multiple types using a single transaction.
   * Accepts an array of { type, mapping } so the caller can preserve the original type key.
   */
  async findAllByTypes(
    mappingPairs: { type: string; mapping: TableMapping }[],
  ): Promise<Record<string, OptionDto[]>> {
    // Build an array of Prisma findMany/select calls
    const queries = mappingPairs.map(({ mapping }) => {
      const model = (this.prisma as any)[mapping.prismaModel];
      const selectFields = buildSelectFields(mapping);

      return model.findMany({
        select: selectFields,
        orderBy: { [mapping.labelField]: 'asc' },
      });
    });

    // Execute all queries in a single transaction
    const results = await this.prisma.$transaction(queries);

    // Map results back to type -> OptionDto[] using transformation pipeline
    const output: Record<string, OptionDto[]> = {};

    // Process all mappings in parallel
    await Promise.all(
      mappingPairs.map(async ({ type, mapping }, idx) => {
        const rows = results[idx];
        output[type] = await transformResultsToOptionDtos(mapping, rows);
      }),
    );

    return output;
  }

  /**
   * Find one option by type and ID
   */
  async findOneByTypeAndId(
    mapping: TableMapping,
    searchId: string | number,
  ): Promise<OptionDto | null> {
    return this.executeAndTransform(mapping, (selectFields) =>
      (this.prisma as any)[mapping.prismaModel].findUnique({
        where: {
          [mapping.idField]: searchId,
        },
        select: selectFields,
      }),
    );
  }

  /**
   * Create a new option
   */
  async create(mapping: TableMapping, data: any): Promise<OptionDto> {
    const selectFields = buildSelectFields(mapping);
    const result = await (this.prisma as any)[mapping.prismaModel].create({
      data,
      select: selectFields,
    });

    return mapResultToOptionDto(mapping, result);
  }

  /**
   * Update an existing option
   */
  async update(
    mapping: TableMapping,
    searchId: string | number,
    data: any,
  ): Promise<OptionDto> {
    const selectFields = buildSelectFields(mapping);
    const result = await (this.prisma as any)[mapping.prismaModel].update({
      where: {
        [mapping.idField]: searchId,
      },
      data,
      select: selectFields,
    });

    return mapResultToOptionDto(mapping, result);
  }

  /**
   * Delete an option
   */
  async remove(
    mapping: TableMapping,
    searchId: string | number,
  ): Promise<void> {
    await (this.prisma as any)[mapping.prismaModel].delete({
      where: {
        [mapping.idField]: searchId,
      },
    });
  }

  /**
   * Check if access code exists
   */
  async findAccessCode(accessCode: string): Promise<any> {
    return this.prisma.recreation_access_code.findUnique({
      where: { access_code: accessCode },
    });
  }

  /**
   * Find sub-access codes by access code
   */
  async findSubAccessByAccessCode(accessCode: string): Promise<OptionDto[]> {
    const mapping = OPTION_TABLE_MAPPINGS[OPTION_TYPES.SUB_ACCESS];
    const selectFields = buildSelectFields(mapping);

    const results = await this.prisma.recreation_sub_access_code.findMany({
      where: {
        recreation_access: {
          some: {
            access_code: accessCode,
          },
        },
      },
      select: selectFields,
      orderBy: {
        [mapping.labelField]: 'asc',
      },
    });

    return await transformResultsToOptionDtos(mapping, results);
  }

  /**
   * Find sub-access code by code
   */
  async findSubAccessCode(subAccessCode: string): Promise<any> {
    return this.prisma.recreation_sub_access_code.findUnique({
      where: { sub_access_code: subAccessCode },
    });
  }

  /**
   * Check if access and sub-access combination exists
   */
  async findAccessSubAccessCombination(
    accessCode: string,
    subAccessCode: string,
  ): Promise<any> {
    return this.prisma.recreation_access.findFirst({
      where: {
        access_code: accessCode,
        sub_access_code: subAccessCode,
      },
    });
  }

  /**
   * Create sub-access code
   */
  async createSubAccess(
    subAccessCode: string,
    description: string,
  ): Promise<OptionDto> {
    const mapping = OPTION_TABLE_MAPPINGS[OPTION_TYPES.SUB_ACCESS];
    return this.create(mapping, {
      [mapping.idField]: subAccessCode,
      [mapping.labelField]: description,
    });
  }

  /**
   * Update sub-access code
   */
  async updateSubAccess(
    subAccessCode: string,
    description: string,
  ): Promise<OptionDto> {
    const mapping = OPTION_TABLE_MAPPINGS[OPTION_TYPES.SUB_ACCESS];
    return this.update(mapping, subAccessCode, {
      [mapping.labelField]: description,
    });
  }

  /**
   * Delete sub-access code
   */
  async removeSubAccess(subAccessCode: string): Promise<void> {
    const mapping = OPTION_TABLE_MAPPINGS[OPTION_TYPES.SUB_ACCESS];
    return this.remove(mapping, subAccessCode);
  }
}
