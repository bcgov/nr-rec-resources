import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitiesRepository } from './activities.repository';

@Module({
  providers: [ActivitiesService, ActivitiesRepository, PrismaService],
  controllers: [ActivitiesController],
  imports: [PrismaModule],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
