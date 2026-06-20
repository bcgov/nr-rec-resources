import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { AdvisoriesController } from './advisories.controller';
import { AdvisoriesService } from './advisories.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdvisoriesController],
  providers: [AdvisoriesService, PrismaService],
  exports: [AdvisoriesService],
})
export class AdvisoriesModule {}
