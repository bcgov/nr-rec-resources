import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOptionDto, OptionDto, UpdateOptionDto } from './dtos/option.dto';
import { OPTION_TABLE_MAPPINGS, VALID_OPTION_TYPES } from './options.constants';
import { OptionsRepository } from './options.repository';
import { OptionType } from './options.types';

@Injectable()
export class OptionsService {
  constructor(private readonly optionsRepository: OptionsRepository) {}

  /**
   * Validates if the option type is supported
   */
  private validateOptionType(type: string): OptionType {
    if (!VALID_OPTION_TYPES.includes(type as OptionType)) {
      throw new BadRequestException(
        `Invalid option type: ${type}. Valid types are: ${VALID_OPTION_TYPES.join(', ')}`,
      );
    }
    return type as OptionType;
  }

  /**
   * Gets the table mapping for a given option type
   */
  private getTableMapping(type: OptionType) {
    return OPTION_TABLE_MAPPINGS[type];
  }

  /**
   * List all options for a given type
   */
  async findAllByType(type: string): Promise<OptionDto[]> {
    const validType = this.validateOptionType(type);
    const mapping = this.getTableMapping(validType);

    const options = await this.optionsRepository.findAllByType(mapping);

    return options;
  }

  /**
   * Retrieve options for multiple types. Returns a mapping of type -> options array.
   */
  async findAllByTypes(types: string[]): Promise<Record<string, OptionDto[]>> {
    // Validate types and build mapping pairs preserving the original type string
    const mappingPairs = types.map((t) => {
      const validType = this.validateOptionType(t);
      const mapping = this.getTableMapping(validType);
      return { type: t, mapping };
    });

    // Let the repository execute all queries in a single transaction and return a map
    return this.optionsRepository.findAllByTypes(mappingPairs);
  }

  /**
   * Get a single option by type and ID
   */
  async findOneByTypeAndId(type: string, id: string): Promise<OptionDto> {
    const validType = this.validateOptionType(type);
    const mapping = this.getTableMapping(validType);

    // Convert id to appropriate type (some fields are integers)
    const searchId = this.convertIdForSearch(id, mapping.idField);

    const result = await this.optionsRepository.findOneByTypeAndId(
      mapping,
      searchId,
    );

    if (!result) {
      throw new NotFoundException(
        `Option with ID '${id}' not found for type '${type}'`,
      );
    }

    return result;
  }

  /**
   * Create a new option
   */
  async create(
    type: string,
    createOptionDto: CreateOptionDto,
  ): Promise<OptionDto> {
    const validType = this.validateOptionType(type);
    const mapping = this.getTableMapping(validType);

    const data: any = {
      [mapping.labelField]: createOptionDto.label,
    };

    // For integer ID fields, let the database auto-generate
    // For string ID fields, we might need to generate or allow user input
    if (
      mapping.idField === 'recreation_activity_code' ||
      mapping.idField === 'status_code' ||
      mapping.idField === 'structure_code'
    ) {
      // These are auto-increment fields, don't set the ID
    } else {
      // For string fields, we could generate from label or require user input
      // For now, let's use a simple slug generation
      data[mapping.idField] = this.generateIdFromLabel(createOptionDto.label);
    }

    return this.optionsRepository.create(mapping, data);
  }

  /**
   * Update an existing option
   */
  async update(
    type: string,
    id: string,
    updateOptionDto: UpdateOptionDto,
  ): Promise<OptionDto> {
    const validType = this.validateOptionType(type);
    const mapping = this.getTableMapping(validType);

    // Convert id to appropriate type
    const searchId = this.convertIdForSearch(id, mapping.idField);

    // First check if the option exists
    await this.findOneByTypeAndId(type, id);

    const data = {
      [mapping.labelField]: updateOptionDto.label,
    };

    return this.optionsRepository.update(mapping, searchId, data);
  }

  /**
   * Delete an option
   */
  async remove(type: string, id: string): Promise<void> {
    const validType = this.validateOptionType(type);
    const mapping = this.getTableMapping(validType);

    // Convert id to appropriate type
    const searchId = this.convertIdForSearch(id, mapping.idField);

    // First check if the option exists
    await this.findOneByTypeAndId(type, id);

    await this.optionsRepository.remove(mapping, searchId);
  }

  /**
   * List all sub-access options for a given access code
   * Note: Based on the current schema, sub-access codes are not directly linked to access codes
   * This method will return all sub-access codes that have been used with the specified access code
   */
  async findSubAccessByAccessCode(accessCode: string): Promise<OptionDto[]> {
    // First verify that the access code exists
    const accessExists =
      await this.optionsRepository.findAccessCode(accessCode);

    if (!accessExists) {
      throw new NotFoundException(`Access code '${accessCode}' not found`);
    }

    return this.optionsRepository.findSubAccessByAccessCode(accessCode);
  }

  /**
   * Get a specific sub-access option by access code and sub-access code
   * Note: This verifies that the sub-access code exists and has been used with the access code
   */
  async findSubAccessByAccessAndSubAccessCode(
    accessCode: string,
    subAccessCode: string,
  ): Promise<OptionDto> {
    // First verify that the access code exists
    const accessExists =
      await this.optionsRepository.findAccessCode(accessCode);

    if (!accessExists) {
      throw new NotFoundException(`Access code '${accessCode}' not found`);
    }

    // Check if the sub-access code exists
    const subAccessExists =
      await this.optionsRepository.findSubAccessCode(subAccessCode);

    if (!subAccessExists) {
      throw new NotFoundException(
        `Sub-access code '${subAccessCode}' not found`,
      );
    }

    // Check if this combination has been used together
    const combinationExists =
      await this.optionsRepository.findAccessSubAccessCombination(
        accessCode,
        subAccessCode,
      );

    if (!combinationExists) {
      throw new NotFoundException(
        `Sub-access code '${subAccessCode}' is not associated with access code '${accessCode}'`,
      );
    }

    return {
      id: subAccessExists.sub_access_code,
      label: subAccessExists.description || '',
    };
  }

  /**
   * Create a new sub-access option under a specific access code
   * Note: This creates the sub-access code and establishes the relationship via recreation_access table
   */
  async createSubAccess(
    accessCode: string,
    createOptionDto: CreateOptionDto,
  ): Promise<OptionDto> {
    // First verify that the access code exists
    const accessExists =
      await this.optionsRepository.findAccessCode(accessCode);

    if (!accessExists) {
      throw new NotFoundException(`Access code '${accessCode}' not found`);
    }

    const subAccessCode = this.generateIdFromLabel(createOptionDto.label);

    // Check if sub-access code already exists
    const existingSubAccess =
      await this.optionsRepository.findSubAccessCode(subAccessCode);

    if (existingSubAccess) {
      throw new BadRequestException(
        `Sub-access code '${subAccessCode}' already exists`,
      );
    }

    return this.optionsRepository.createSubAccess(
      subAccessCode,
      createOptionDto.label,
    );
  }

  /**
   * Update a sub-access option
   */
  async updateSubAccess(
    accessCode: string,
    subAccessCode: string,
    updateOptionDto: UpdateOptionDto,
  ): Promise<OptionDto> {
    // First check if the sub-access exists for this access code
    await this.findSubAccessByAccessAndSubAccessCode(accessCode, subAccessCode);

    return this.optionsRepository.updateSubAccess(
      subAccessCode,
      updateOptionDto.label,
    );
  }

  /**
   * Delete a sub-access option
   */
  async removeSubAccess(
    accessCode: string,
    subAccessCode: string,
  ): Promise<void> {
    // First check if the sub-access exists for this access code
    await this.findSubAccessByAccessAndSubAccessCode(accessCode, subAccessCode);

    await this.optionsRepository.removeSubAccess(subAccessCode);
  }

  /**
   * Convert string ID to appropriate type for database queries
   */
  private convertIdForSearch(id: string, idField: string): string | number {
    // Integer fields
    if (
      idField === 'recreation_activity_code' ||
      idField === 'status_code' ||
      idField === 'structure_code'
    ) {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) {
        throw new BadRequestException(
          `Invalid ID format: ${id} (expected number)`,
        );
      }
      return numId;
    }
    // String fields
    return id;
  }

  /**
   * Generate a simple ID from label (slug-like)
   */
  private generateIdFromLabel(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 10);
  }
}
