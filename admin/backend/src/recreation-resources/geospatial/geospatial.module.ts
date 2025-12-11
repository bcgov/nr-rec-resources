import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';

import { GeospatialController } from './geospatial.controller';
import { GeospatialService } from './geospatial.service';

@Module({
  imports: [PrismaModule],
  controllers: [GeospatialController],
  providers: [GeospatialService, PrismaService],
  exports: [GeospatialService],
})
export class GeospatialModule {}
