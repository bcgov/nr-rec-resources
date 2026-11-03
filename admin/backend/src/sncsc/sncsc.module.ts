import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { SncscAuthModule } from './auth';
import { SncscSpatialSubmissionStatusController } from './sncsc-spatial-submission-status.controller';
import { SncscSpatialSubmissionStatusService } from './sncsc-spatial-submission-status.service';
import { SncscStatusRequestService } from './sncsc-status-request.service';

@Module({
  imports: [SncscAuthModule, PrismaModule],
  controllers: [SncscSpatialSubmissionStatusController],
  providers: [
    SncscSpatialSubmissionStatusService,
    SncscStatusRequestService,
    PrismaService,
  ],
  exports: [SncscSpatialSubmissionStatusService, SncscStatusRequestService],
})
export class SncscModule {}
