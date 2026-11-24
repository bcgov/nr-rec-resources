import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { SncscModule } from '@/sncsc/sncsc.module';
import { ExhibitAModule } from '@/exhibit-a/exhibit-a.module';
import { Module } from '@nestjs/common';

import { GeospatialController } from './geospatial.controller';
import { GeospatialService } from './geospatial.service';

@Module({
  imports: [PrismaModule, SncscModule, ExhibitAModule],
  controllers: [GeospatialController],
  providers: [GeospatialService, PrismaService],
  exports: [GeospatialService],
})
export class GeospatialModule {}
