import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeospatialController } from './geospatial.controller';
import { GeospatialService } from './geospatial.service';

@Module({
  imports: [HttpModule],
  controllers: [GeospatialController],
  providers: [GeospatialService],
})
export class GeospatialModule {}
