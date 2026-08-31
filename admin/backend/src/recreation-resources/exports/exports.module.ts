import { PrismaService } from '@/prisma.service';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportRepository } from './export.repository';
import { ExportService } from './export.service';

@Module({
  imports: [UserContextModule],
  controllers: [ExportController],
  providers: [ExportService, ExportRepository, PrismaService],
  exports: [ExportService],
})
export class ExportsModule {}
