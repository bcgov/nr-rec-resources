import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { RecreationAssetController } from './resource-asset.controller';
import { RecreationAssetService } from './service/resource-asset.service';

@Module({
  imports: [ConfigModule],
  controllers: [RecreationAssetController],
  providers: [PrismaService, RecreationAssetService],
  exports: [RecreationAssetService],
})
export class RecreationAssetModule {}
