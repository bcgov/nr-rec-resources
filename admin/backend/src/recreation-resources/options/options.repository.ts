import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { OptionDto } from './dtos/option.dto';
import { TableMapping } from './options.constants';

@Injectable()
export class OptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all options by type
   */
  async findAllByType(mapping: TableMapping): Promise<OptionDto[]> {
    const results = await (this.prisma as any)[mapping.prismaModel].findMany({
      orderBy: {
        [mapping.labelField]: 'asc',
      },
    });

    if (mapping.reducer) {
      return mapping.reducer(results);
    }

    return results.map((result: any) => ({
      id: result[mapping.idField].toString(),
      label: result[mapping.labelField],
    }));
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
      // Use the prisma model dynamically
      const model = (this.prisma as any)[mapping.prismaModel];

      // Use findMany with orderBy
      return model.findMany({
        orderBy: { [mapping.labelField]: 'asc' },
      });
    });

    // Execute all queries in a single transaction
    const results = await this.prisma.$transaction(queries);

    // Map results back to type -> OptionDto[] applying reducers where provided
    const output: Record<string, OptionDto[]> = {};

    mappingPairs.forEach(({ type, mapping }, idx) => {
      const rows = results[idx];

      if (mapping.reducer) {
        output[type] = mapping.reducer(rows);
      } else {
        output[type] = (rows as any[]).map((result) => ({
          id: result[mapping.idField].toString(),
          label: result[mapping.labelField],
        }));
      }
    });

    return output;
  }

  /**
   * Find one option by type and ID
   */
  async findOneByTypeAndId(
    mapping: TableMapping,
    searchId: string | number,
  ): Promise<OptionDto | null> {
    const result = await (this.prisma as any)[mapping.prismaModel].findUnique({
      where: {
        [mapping.idField]: searchId,
      },
      select: {
        [mapping.idField]: true,
        [mapping.labelField]: true,
      },
    });

    if (!result) {
      return null;
    }

    return {
      id: result[mapping.idField].toString(),
      label: result[mapping.labelField],
    };
  }

  /**
   * Create a new option
   */
  async create(mapping: TableMapping, data: any): Promise<OptionDto> {
    const result = await (this.prisma as any)[mapping.prismaModel].create({
      data,
      select: {
        [mapping.idField]: true,
        [mapping.labelField]: true,
      },
    });

    return {
      id: result[mapping.idField].toString(),
      label: result[mapping.labelField],
    };
  }

  /**
   * Update an existing option
   */
  async update(
    mapping: TableMapping,
    searchId: string | number,
    data: any,
  ): Promise<OptionDto> {
    const result = await (this.prisma as any)[mapping.prismaModel].update({
      where: {
        [mapping.idField]: searchId,
      },
      data,
      select: {
        [mapping.idField]: true,
        [mapping.labelField]: true,
      },
    });

    return {
      id: result[mapping.idField].toString(),
      label: result[mapping.labelField],
    };
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
    const results = await this.prisma.recreation_sub_access_code.findMany({
      where: {
        recreation_access: {
          some: {
            access_code: accessCode,
          },
        },
      },
      select: {
        sub_access_code: true,
        description: true,
      },
      orderBy: {
        description: 'asc',
      },
    });

    return results.map((result) => ({
      id: result.sub_access_code,
      label: result.description || '',
    }));
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
    const result = await this.prisma.recreation_sub_access_code.create({
      data: {
        sub_access_code: subAccessCode,
        description: description,
      },
      select: {
        sub_access_code: true,
        description: true,
      },
    });

    return {
      id: result.sub_access_code,
      label: result.description || '',
    };
  }

  /**
   * Update sub-access code
   */
  async updateSubAccess(
    subAccessCode: string,
    description: string,
  ): Promise<OptionDto> {
    const result = await this.prisma.recreation_sub_access_code.update({
      where: {
        sub_access_code: subAccessCode,
      },
      data: {
        description: description,
      },
      select: {
        sub_access_code: true,
        description: true,
      },
    });

    return {
      id: result.sub_access_code,
      label: result.description || '',
    };
  }

  /**
   * Delete sub-access code
   */
  async removeSubAccess(subAccessCode: string): Promise<void> {
    await this.prisma.recreation_sub_access_code.delete({
      where: {
        sub_access_code: subAccessCode,
      },
    });
  }
}
