import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { SncscModule } from '@/sncsc/sncsc.module';
import { Module } from '@nestjs/common';

import { GeospatialController } from './geospatial.controller';
import { GeospatialService } from './geospatial.service';

@Module({
  imports: [PrismaModule, SncscModule],
  controllers: [GeospatialController],
  providers: [GeospatialService, PrismaService],
  exports: [GeospatialService],
})
export class GeospatialModule {}
