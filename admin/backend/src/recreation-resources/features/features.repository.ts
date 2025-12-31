import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { RecreationFeatureDto } from './dtos/recreation-feature.dto';
import { syncManyToMany } from '../utils/syncManyToManyUtils';

@Injectable()
export class FeaturesRepository {
  private readonly logger = new Logger(FeaturesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds all features for a recreation resource.
   * @param rec_resource_id - The resource ID
   * @returns Array of feature DTOs
   */
  async findFeaturesByResourceId(
    rec_resource_id: string,
  ): Promise<RecreationFeatureDto[]> {
    const features = await this.prisma.recreation_feature.findMany({
      where: { rec_resource_id },
      select: {
        recreation_feature_code_ref: {
          select: {
            recreation_feature_code: true,
            description: true,
          },
        },
      },
    });

    return features.map((feature) => ({
      recreation_feature_code:
        feature.recreation_feature_code_ref.recreation_feature_code,
      description: feature.recreation_feature_code_ref.description ?? '',
    }));
  }

  /**
   * Updates features for a recreation resource.
   * Only deletes removed features and creates new ones,
   * leaving unchanged features untouched to minimize history table entries.
   * @param rec_resource_id - The resource ID
   * @param feature_codes - Array of feature codes to set
   */
  async updateFeatures(
    rec_resource_id: string,
    feature_codes: string[],
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await syncManyToMany({
          tx,
          tableName: 'recreation_feature',
          where: { rec_resource_id },
          keyField: 'recreation_feature_code',
          newKeys: feature_codes,
          createData: (feature_code) => ({
            rec_resource_id,
            recreation_feature_code: feature_code,
          }),
        });
      });
    } catch (error) {
      this.logger.error(
        `Failed to update features for resource ${rec_resource_id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
}
