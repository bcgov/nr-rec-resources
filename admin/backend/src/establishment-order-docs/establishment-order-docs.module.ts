import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { EstablishmentOrderDocsController } from './establishment-order-docs.controller';
import { EstablishmentOrderDocsService } from './establishment-order-docs.service';
import { S3Service } from './s3.service';

@Module({
  imports: [PrismaModule],
  controllers: [EstablishmentOrderDocsController],
  providers: [EstablishmentOrderDocsService, S3Service, PrismaService],
  exports: [EstablishmentOrderDocsService],
})
export class EstablishmentOrderDocsModule {}
