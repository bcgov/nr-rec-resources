import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportRepository } from './export.repository';
import { ExportService } from './export.service';

@Module({
  controllers: [ExportController],
  providers: [ExportService, ExportRepository, PrismaService],
  exports: [ExportService],
})
export class ExportsModule {}
