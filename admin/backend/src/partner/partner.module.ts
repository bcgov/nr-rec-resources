import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';

@Module({
  controllers: [PartnerController],
  providers: [PartnerService, PrismaService],
  exports: [PartnerService],
})
export class PartnerModule {}
