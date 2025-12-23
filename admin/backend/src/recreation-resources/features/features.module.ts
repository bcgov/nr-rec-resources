import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { FeaturesRepository } from './features.repository';

@Module({
  providers: [FeaturesService, FeaturesRepository, PrismaService],
  controllers: [FeaturesController],
  imports: [PrismaModule],
  exports: [FeaturesService],
})
export class FeaturesModule {}
