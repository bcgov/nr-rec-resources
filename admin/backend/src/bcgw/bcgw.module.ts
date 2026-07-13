import { Module } from '@nestjs/common';
import { BcgwController } from './bcgw.controller';
import { BcgwService } from './bcgw.service';
import { PrismaModule } from 'src/prisma.module';
import { PrismaService } from 'src/prisma.service';
import { BcgwAuthModule } from './auth/bcgw-auth.module';

@Module({
  imports: [PrismaModule, BcgwAuthModule],
  controllers: [BcgwController],
  providers: [BcgwService, PrismaService],
})
export class BcgwModule {}
