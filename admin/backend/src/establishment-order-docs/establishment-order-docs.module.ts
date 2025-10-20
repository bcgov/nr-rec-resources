import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { S3Module } from '@/s3';
import { EstablishmentOrderDocsController } from './establishment-order-docs.controller';
import { EstablishmentOrderDocsService } from './establishment-order-docs.service';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [EstablishmentOrderDocsController],
  providers: [EstablishmentOrderDocsService, PrismaService],
  exports: [EstablishmentOrderDocsService],
})
export class EstablishmentOrderDocsModule {}
