import { Module } from '@nestjs/common';
import { BcgwController } from './bcgw.controller';
import { BcgwService } from './bcgw.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BcgwController],
  providers: [BcgwService],
})
export class BcgwModule {}
