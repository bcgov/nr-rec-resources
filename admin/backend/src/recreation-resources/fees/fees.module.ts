import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';

@Module({
  imports: [PrismaModule],
  controllers: [FeesController],
  providers: [FeesService, PrismaService],
  exports: [FeesService],
})
export class FeesModule {}
