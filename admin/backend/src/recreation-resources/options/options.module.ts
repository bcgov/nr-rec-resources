import { PrismaService } from '@/prisma.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OptionsController } from './options.controller';
import { OptionsRepository } from './options.repository';
import { OptionsService } from './options.service';

@Module({
  imports: [ConfigModule],
  controllers: [OptionsController],
  providers: [OptionsService, OptionsRepository, PrismaService],
  exports: [OptionsService],
})
export class OptionsModule {}
