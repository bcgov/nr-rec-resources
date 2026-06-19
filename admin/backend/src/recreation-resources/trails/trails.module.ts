import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { TrailsController } from './trails.controller';
import { TrailsRepository } from './trails.repository';
import { TrailsService } from './trails.service';

@Module({
  imports: [PrismaModule],
  controllers: [TrailsController],
  providers: [TrailsService, TrailsRepository, PrismaService],
  exports: [TrailsService],
})
export class TrailsModule {}
